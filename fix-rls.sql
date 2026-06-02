-- ============================================================
-- Fix RLS: ensure personal lists are fully private
-- Run in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. Make sure RLS is enabled on every table
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists          ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_snapshots ENABLE ROW LEVEL SECURITY;

-- 2. Rewrite lists policy — use EXISTS to avoid IN-subquery RLS recursion
DROP POLICY IF EXISTS "lists_select" ON lists;
CREATE POLICY "lists_select" ON lists FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM list_members
      WHERE list_members.list_id = lists.id
        AND list_members.user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "lists_insert" ON lists;
CREATE POLICY "lists_insert" ON lists FOR INSERT WITH CHECK (
  owner_id = auth.uid()
);

DROP POLICY IF EXISTS "lists_update" ON lists;
CREATE POLICY "lists_update" ON lists FOR UPDATE USING (
  owner_id = auth.uid()
);

DROP POLICY IF EXISTS "lists_delete" ON lists;
CREATE POLICY "lists_delete" ON lists FOR DELETE USING (
  owner_id = auth.uid()
);

-- 3. Rewrite the helper function — keep SECURITY DEFINER to avoid
--    recursion, but tighten the logic with explicit auth checks
CREATE OR REPLACE FUNCTION user_has_list_access(p_list_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM lists
    WHERE id = p_list_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM list_members
    WHERE list_id = p_list_id AND user_id = auth.uid()
  );
$$;

-- 4. Folders — use the fixed helper
DROP POLICY IF EXISTS "folders_select" ON folders;
CREATE POLICY "folders_select" ON folders FOR SELECT USING (user_has_list_access(list_id));
DROP POLICY IF EXISTS "folders_insert" ON folders;
CREATE POLICY "folders_insert" ON folders FOR INSERT WITH CHECK (user_has_list_access(list_id));
DROP POLICY IF EXISTS "folders_update" ON folders;
CREATE POLICY "folders_update" ON folders FOR UPDATE USING (user_has_list_access(list_id));
DROP POLICY IF EXISTS "folders_delete" ON folders;
CREATE POLICY "folders_delete" ON folders FOR DELETE USING (user_has_list_access(list_id));

-- 5. Items — use the fixed helper
DROP POLICY IF EXISTS "items_select" ON items;
CREATE POLICY "items_select" ON items FOR SELECT USING (user_has_list_access(list_id));
DROP POLICY IF EXISTS "items_insert" ON items;
CREATE POLICY "items_insert" ON items FOR INSERT WITH CHECK (user_has_list_access(list_id));
DROP POLICY IF EXISTS "items_update" ON items;
CREATE POLICY "items_update" ON items FOR UPDATE USING (user_has_list_access(list_id));
DROP POLICY IF EXISTS "items_delete" ON items;
CREATE POLICY "items_delete" ON items FOR DELETE USING (user_has_list_access(list_id));

-- 6. Quick sanity check — should return only YOUR lists
SELECT id, name, is_personal, owner_id
FROM lists
ORDER BY is_personal DESC, created_at;
