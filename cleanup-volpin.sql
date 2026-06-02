-- ============================================================
-- Volpin List Cleanup
-- Run in: Supabase Dashboard > SQL Editor > New query
-- Safe to run once — guards against double-execution
-- ============================================================

DO $$
DECLARE
  v_id      UUID;  -- Volpin list ID
  f_meat    UUID;
  f_pantry  UUID;
  f_frozen  UUID;
  f_spices  UUID;
BEGIN

  -- ── Find Volpin list ──────────────────────────────────────
  SELECT id INTO v_id FROM lists WHERE share_code = 'UAW4XD';
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Volpin list (UAW4XD) not found — has the migration been run?';
  END IF;

  -- ── Resolve folder IDs by name ────────────────────────────
  SELECT id INTO f_meat   FROM folders WHERE list_id = v_id AND name = 'בשר';
  SELECT id INTO f_pantry FROM folders WHERE list_id = v_id AND name = 'מזווה';
  SELECT id INTO f_frozen FROM folders WHERE list_id = v_id AND name = 'קפוא';
  SELECT id INTO f_spices FROM folders WHERE list_id = v_id AND name = 'תבלינים';

  -- ── 1. Delete old-app category-label items ────────────────
  DELETE FROM items
  WHERE list_id = v_id
    AND name IN (
      '1--ierakot', '2--perot', '3--kirur', '4--basar',
      '5--kfuim',   '6--shimurim', '7--lejem', '8--shtiah', '9--kashim'
    );

  -- ── 2. Remove NULL-folder duplicate of Mebasem sherutim ──
  --    (it already exists in ניקיון with a folder)
  DELETE FROM items
  WHERE list_id = v_id
    AND name = 'Mebasem sherutim'
    AND folder_id IS NULL;

  -- ── 3. Remove duplicate Oreo (keep earliest) ─────────────
  DELETE FROM items
  WHERE id IN (
    SELECT id FROM items
    WHERE list_id = v_id AND name = 'Oreo'
    ORDER BY created_at DESC
    LIMIT 1
  );

  -- ── 4. Remove duplicate Riva (keep earliest) ──────────────
  DELETE FROM items
  WHERE id IN (
    SELECT id FROM items
    WHERE list_id = v_id AND name = 'Riva'
    ORDER BY created_at DESC
    LIMIT 1
  );

  -- ── 5. Move uncategorised items into correct folders ──────

  -- Pasta → מזווה
  UPDATE items SET folder_id = f_pantry
  WHERE list_id = v_id AND name = 'Pasta' AND folder_id IS NULL;

  -- אורז לבן → מזווה
  UPDATE items SET folder_id = f_pantry
  WHERE list_id = v_id AND name = 'אורז לבן' AND folder_id IS NULL;

  -- חזה עוף חתוך לקוביות → בשר
  UPDATE items SET folder_id = f_meat
  WHERE list_id = v_id AND name = 'חזה עוף חתוך לקוביות' AND folder_id IS NULL;

  -- Pizza → קפוא
  UPDATE items SET folder_id = f_frozen
  WHERE list_id = v_id AND name = 'Pizza' AND folder_id IS NULL;

  -- ── 6. Add 2 missing items ────────────────────────────────
  INSERT INTO items (list_id, folder_id, name, quantity, is_favorite, is_purchased)
  SELECT v_id, f_spices, 'Dried oregano', '2 tsp', false, true
  WHERE NOT EXISTS (
    SELECT 1 FROM items WHERE list_id = v_id AND name = 'Dried oregano'
  );

  INSERT INTO items (list_id, folder_id, name, quantity, is_favorite, is_purchased)
  SELECT v_id, f_pantry, 'Pasta (Spaghetti or Tagliatelle)', '1.1kg', false, true
  WHERE NOT EXISTS (
    SELECT 1 FROM items WHERE list_id = v_id AND name = 'Pasta (Spaghetti or Tagliatelle)'
  );

  RAISE NOTICE 'Volpin cleanup complete.';
END $$;
