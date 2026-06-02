-- ============================================================
-- Smart List - Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. LISTS
CREATE TABLE IF NOT EXISTS lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_personal BOOLEAN DEFAULT FALSE,
  share_code TEXT UNIQUE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LIST MEMBERS (who belongs to which shared list)
CREATE TABLE IF NOT EXISTS list_members (
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (list_id, user_id)
);

-- 4. FOLDERS
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_expanded BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ITEMS
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity TEXT DEFAULT '1',
  is_purchased BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SHARED SNAPSHOTS (for share-as-list feature)
CREATE TABLE IF NOT EXISTS shared_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_code TEXT UNIQUE NOT NULL,
  list_name TEXT,
  items JSONB NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_snapshots ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- LISTS: viewable by owner or members
DROP POLICY IF EXISTS "lists_select" ON lists;
CREATE POLICY "lists_select" ON lists FOR SELECT USING (
  owner_id = auth.uid() OR
  id IN (SELECT list_id FROM list_members WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "lists_insert" ON lists;
CREATE POLICY "lists_insert" ON lists FOR INSERT WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "lists_update" ON lists;
CREATE POLICY "lists_update" ON lists FOR UPDATE USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "lists_delete" ON lists;
CREATE POLICY "lists_delete" ON lists FOR DELETE USING (owner_id = auth.uid());

-- LIST MEMBERS
DROP POLICY IF EXISTS "members_select" ON list_members;
CREATE POLICY "members_select" ON list_members FOR SELECT USING (
  user_id = auth.uid() OR
  list_id IN (SELECT id FROM lists WHERE owner_id = auth.uid())
);
DROP POLICY IF EXISTS "members_insert" ON list_members;
CREATE POLICY "members_insert" ON list_members FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "members_delete" ON list_members;
CREATE POLICY "members_delete" ON list_members FOR DELETE USING (
  user_id = auth.uid() OR
  list_id IN (SELECT id FROM lists WHERE owner_id = auth.uid())
);

-- Helper: check if user has access to a list
CREATE OR REPLACE FUNCTION user_has_list_access(p_list_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM lists WHERE id = p_list_id AND owner_id = auth.uid()
    UNION
    SELECT 1 FROM list_members WHERE list_id = p_list_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- FOLDERS
DROP POLICY IF EXISTS "folders_select" ON folders;
CREATE POLICY "folders_select" ON folders FOR SELECT USING (user_has_list_access(list_id));
DROP POLICY IF EXISTS "folders_insert" ON folders;
CREATE POLICY "folders_insert" ON folders FOR INSERT WITH CHECK (user_has_list_access(list_id));
DROP POLICY IF EXISTS "folders_update" ON folders;
CREATE POLICY "folders_update" ON folders FOR UPDATE USING (user_has_list_access(list_id));
DROP POLICY IF EXISTS "folders_delete" ON folders;
CREATE POLICY "folders_delete" ON folders FOR DELETE USING (user_has_list_access(list_id));

-- ITEMS
DROP POLICY IF EXISTS "items_select" ON items;
CREATE POLICY "items_select" ON items FOR SELECT USING (user_has_list_access(list_id));
DROP POLICY IF EXISTS "items_insert" ON items;
CREATE POLICY "items_insert" ON items FOR INSERT WITH CHECK (user_has_list_access(list_id));
DROP POLICY IF EXISTS "items_update" ON items;
CREATE POLICY "items_update" ON items FOR UPDATE USING (user_has_list_access(list_id));
DROP POLICY IF EXISTS "items_delete" ON items;
CREATE POLICY "items_delete" ON items FOR DELETE USING (user_has_list_access(list_id));

-- SHARED SNAPSHOTS: anyone authenticated can read, any auth user can create
DROP POLICY IF EXISTS "snapshots_select" ON shared_snapshots;
CREATE POLICY "snapshots_select" ON shared_snapshots FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "snapshots_insert" ON shared_snapshots;
CREATE POLICY "snapshots_insert" ON shared_snapshots FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- ENABLE REALTIME for shared lists
-- ============================================================
-- Run these in SQL editor:
-- ALTER PUBLICATION supabase_realtime ADD TABLE items;
-- ALTER PUBLICATION supabase_realtime ADD TABLE folders;
-- (or enable via Dashboard > Database > Replication > supabase_realtime)
