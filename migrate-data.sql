-- ============================================================
-- Smart List - Data Migration Script
-- Run in: Supabase Dashboard > SQL Editor > New query
-- Migrates: Volpin family list + Dan's personal items
-- ============================================================

DO $$
DECLARE
  dan_id       UUID;
  personal_id  UUID;
  volpin_id    UUID;

  -- Volpin list folders (old UUID → new folder ID)
  f_drinks      UUID;   -- 2d44aea0 שתייה
  f_spices      UUID;   -- 1d9f1398 תבלינים
  f_tools       UUID;   -- 157b900a כלים
  f_canned      UUID;   -- bc511187 שימורים
  f_dryfruit    UUID;   -- 19871061 פירות יבשים
  f_cleaning    UUID;   -- 0ce6fe58 ניקיון
  f_misc        UUID;   -- 20c68768 שונות
  f_dairy       UUID;   -- cefa6922 מוצרי חלב
  f_fruits      UUID;   -- 560bf1c0 פירות
  f_pantry      UUID;   -- 97f7c57c מזווה
  f_sweets      UUID;   -- d619727e ממתקים
  f_pharmacy    UUID;   -- 93c37f0c בית מרקחת
  f_sauces      UUID;   -- 8d9f0ff5 רטבים
  f_suppl       UUID;   -- 9ae5a852 תוספי מזון
  f_cars        UUID;   -- 2614eb2e מכוניות
  f_frozen      UUID;   -- 518f1001 קפוא
  f_veggies     UUID;   -- 0b9589a4 ירקות
  f_meat        UUID;   -- f9f213f2 בשר

  -- Personal list folders
  fp_tasks      UUID;   -- f9583a1f משימות
  fp_veggies    UUID;   -- bf1f70b7 ירקות
  fp_fruits     UUID;   -- 19993f47 פירות
BEGIN

  -- ── 1. Locate Dan's profile ───────────────────────────────
  SELECT id INTO dan_id FROM profiles WHERE email = 'danvolpin@gmail.com';
  IF dan_id IS NULL THEN
    RAISE EXCEPTION 'Profile for danvolpin@gmail.com not found';
  END IF;

  -- ── 2. Locate Dan's personal list ─────────────────────────
  SELECT id INTO personal_id FROM lists WHERE owner_id = dan_id AND is_personal = true;
  IF personal_id IS NULL THEN
    RAISE EXCEPTION 'Personal list not found — log in once to create it';
  END IF;

  -- ── 3. Guard: abort if already migrated ───────────────────
  IF EXISTS (SELECT 1 FROM lists WHERE share_code = 'UAW4XD') THEN
    RAISE EXCEPTION 'Volpin list already exists (UAW4XD). Migration already ran.';
  END IF;

  -- ── 4. Create Volpin family list ──────────────────────────
  INSERT INTO lists (owner_id, name, share_code, is_personal)
    VALUES (dan_id, 'Volpin', 'UAW4XD', false)
    RETURNING id INTO volpin_id;

  -- ── 5. Create folders for Volpin list ─────────────────────
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'שתייה')        RETURNING id INTO f_drinks;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'תבלינים')      RETURNING id INTO f_spices;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'כלים')         RETURNING id INTO f_tools;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'שימורים')      RETURNING id INTO f_canned;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'פירות יבשים')  RETURNING id INTO f_dryfruit;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'ניקיון')       RETURNING id INTO f_cleaning;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'שונות')        RETURNING id INTO f_misc;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'מוצרי חלב')    RETURNING id INTO f_dairy;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'פירות')        RETURNING id INTO f_fruits;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'מזווה')        RETURNING id INTO f_pantry;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'ממתקים')       RETURNING id INTO f_sweets;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'בית מרקחת')    RETURNING id INTO f_pharmacy;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'רטבים')        RETURNING id INTO f_sauces;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'תוספי מזון')   RETURNING id INTO f_suppl;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'מכוניות')      RETURNING id INTO f_cars;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'קפוא')         RETURNING id INTO f_frozen;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'ירקות')        RETURNING id INTO f_veggies;
  INSERT INTO folders (list_id, name) VALUES (volpin_id, 'בשר')          RETURNING id INTO f_meat;

  -- Personal list folders
  INSERT INTO folders (list_id, name) VALUES (personal_id, 'משימות') RETURNING id INTO fp_tasks;
  INSERT INTO folders (list_id, name) VALUES (personal_id, 'ירקות')  RETURNING id INTO fp_veggies;
  INSERT INTO folders (list_id, name) VALUES (personal_id, 'פירות')  RETURNING id INTO fp_fruits;

  -- ── 6. Insert Volpin items ─────────────────────────────────
  --  columns: list_id, folder_id, name, quantity, is_favorite, is_purchased
  INSERT INTO items (list_id, folder_id, name, quantity, is_favorite, is_purchased) VALUES

    -- ── No folder (including client category labels) ──
    (volpin_id, NULL, 'Pasta',                      '500g',    false, false),
    (volpin_id, NULL, 'אורז לבן',                   '2 כוסות', false, false),
    (volpin_id, NULL, 'חזה עוף חתוך לקוביות',       '500 גרם', false, false),
    (volpin_id, NULL, 'Mebasem sherutim',            '1',       false, false),
    (volpin_id, NULL, 'Pizza',                       '1',       false, false),
    (volpin_id, NULL, '1--ierakot',                  '1',       false, false),
    (volpin_id, NULL, '2--perot',                    '1',       false, true),
    (volpin_id, NULL, '3--kirur',                    '1',       false, true),
    (volpin_id, NULL, '4--basar',                    '1',       false, true),
    (volpin_id, NULL, '5--kfuim',                    '1',       false, true),
    (volpin_id, NULL, '6--shimurim',                 '1',       false, true),
    (volpin_id, NULL, '7--lejem',                    '1',       false, true),
    (volpin_id, NULL, '8--shtiah',                   '1',       false, true),
    (volpin_id, NULL, '9--kashim',                   '1',       false, true),

    -- ── שתייה ──
    (volpin_id, f_drinks, 'Beer',                   '6',  true,  true),
    (volpin_id, f_drinks, 'Bira weihenstephaner',   '4',  false, true),
    (volpin_id, f_drinks, 'Anabin tarkiz',          '1',  false, true),
    (volpin_id, f_drinks, 'Tarkiz tea diet',        '1',  false, true),
    (volpin_id, f_drinks, 'Petel tarkiz',           '1',  false, true),
    (volpin_id, f_drinks, 'Tirosh laban',           '1',  false, true),
    (volpin_id, f_drinks, 'Cafe nes',               '1',  false, true),
    (volpin_id, f_drinks, 'Cafe lelo cafein',       '1',  false, true),
    (volpin_id, f_drinks, 'קפסולות קפה',             '1',  false, true),
    (volpin_id, f_drinks, 'תרכיז דיאט',              '1',  false, true),
    (volpin_id, f_drinks, 'Zero',                   '1',  false, true),
    (volpin_id, f_drinks, 'Iain kidush',            '1',  false, true),
    (volpin_id, f_drinks, 'קולה',                   '6',  false, true),
    (volpin_id, f_drinks, 'Tirosh',                 '1',  false, true),

    -- ── תבלינים ──
    (volpin_id, f_spices, 'Avkat ginger',           '1', false, true),
    (volpin_id, f_spices, 'Avkat marak',            '1', false, true),
    (volpin_id, f_spices, 'Pereg',                  '1', false, true),
    (volpin_id, f_spices, 'Sumsum',                 '1', false, true),
    (volpin_id, f_spices, 'Zatar',                  '1', false, true),
    (volpin_id, f_spices, 'Egos muskat',            '1', false, true),
    (volpin_id, f_spices, 'Curry',                  '1', false, true),
    (volpin_id, f_spices, 'Basilicum iabesh',       '1', false, true),
    (volpin_id, f_spices, 'Shamir',                 '1', false, true),
    (volpin_id, f_spices, 'Curcum',                 '1', false, true),
    (volpin_id, f_spices, 'Cinamon maklot',         '1', false, true),
    (volpin_id, f_spices, 'Cinamon',                '1', false, true),
    (volpin_id, f_spices, 'Batzal shvavim',         '1', false, true),
    (volpin_id, f_spices, 'Shum gvishi',            '1', false, true),
    (volpin_id, f_spices, 'Paprika grusa',          '1', false, true),
    (volpin_id, f_spices, 'Paprika',                '1', false, true),
    (volpin_id, f_spices, 'Melaj limon',            '1', false, true),
    (volpin_id, f_spices, 'Pilpel',                 '1', false, true),
    (volpin_id, f_spices, 'Petrozilia',             '1', false, true),

    -- ── כלים ──
    (volpin_id, f_tools, 'Toster',                  '1', false, true),
    (volpin_id, f_tools, 'Mfsek l menora',          '1', false, true),
    (volpin_id, f_tools, 'Isolirband',              '1', false, true),
    (volpin_id, f_tools, 'Mefatzel katzar',         '1', false, true),
    (volpin_id, f_tools, 'Mabreguim',               '1', false, true),
    (volpin_id, f_tools, 'Sheka 240',               '1', false, true),
    (volpin_id, f_tools, 'Kadurei sifolus',         '1', false, true),

    -- ── שימורים ──
    (volpin_id, f_canned, 'Ananas kufsa',           '1', false, true),
    (volpin_id, f_canned, 'Rekes agvaniot',         '1', false, true),
    (volpin_id, f_canned, 'Rezek tapuaj etz',       '1', false, true),
    (volpin_id, f_canned, 'Salat perot',            '1', false, true),
    (volpin_id, f_canned, 'Salmon mehushan',        '1', false, true),
    (volpin_id, f_canned, 'Salmon canola',          '1', false, true),
    (volpin_id, f_canned, 'Melafafon jamutz',       '1', false, true),
    (volpin_id, f_canned, 'Zeitim',                 '1', false, true),
    (volpin_id, f_canned, 'anchovies',              '1', false, true),
    (volpin_id, f_canned, 'sardinim',               '1', false, true),
    (volpin_id, f_canned, 'tuna jarifa',            '1', false, true),
    (volpin_id, f_canned, 'tuna',                   '1', false, true),
    (volpin_id, f_canned, 'palmitos',               '1', false, true),

    -- ── פירות יבשים ──
    (volpin_id, f_dryfruit, 'Tiras popcorn',        '1', false, true),
    (volpin_id, f_dryfruit, 'Pekan',                '1', false, true),
    (volpin_id, f_dryfruit, 'Tmarim',               '1', false, true),
    (volpin_id, f_dryfruit, 'Shezifim',             '1', false, true),
    (volpin_id, f_dryfruit, 'Teenim',               '1', false, true),
    (volpin_id, f_dryfruit, 'Mishmish',             '1', false, true),
    (volpin_id, f_dryfruit, 'Shkedim',              '1', false, true),
    (volpin_id, f_dryfruit, 'Pistukim',             '1', false, true),
    (volpin_id, f_dryfruit, 'Grinei Dlaat',         '1', false, true),
    (volpin_id, f_dryfruit, 'Jamutziot',            '1', false, true),
    (volpin_id, f_dryfruit, 'Egos melej',           '1', false, true),
    (volpin_id, f_dryfruit, 'Tzimukim',             '1', false, true),

    -- ── ניקיון ──
    (volpin_id, f_cleaning, 'Niar bad mitvaj',      '1', false, true),
    (volpin_id, f_cleaning, 'Deodorant',            '1', false, true),
    (volpin_id, f_cleaning, 'Merakej kvisa',        '1', false, true),
    (volpin_id, f_cleaning, 'Malbin kvisa',         '1', false, true),
    (volpin_id, f_cleaning, 'Sabon kvisa',          '1', false, true),
    (volpin_id, f_cleaning, 'Ritzpas',              '1', false, true),
    (volpin_id, f_cleaning, 'Economica',            '1', false, true),
    (volpin_id, f_cleaning, 'Barbaz sherutim',      '1', false, true),
    (volpin_id, f_cleaning, 'Mebasem sherutim',     '1', false, true),
    (volpin_id, f_cleaning, 'Niar toilet',          '1', false, true),
    (volpin_id, f_cleaning, 'Sabon idaim',          '1', false, true),
    (volpin_id, f_cleaning, 'Shampoo',              '1', false, true),
    (volpin_id, f_cleaning, 'Colgate',              '1', false, true),

    -- ── שונות ──
    (volpin_id, f_misc, 'Kfafot jad pamiot',        '1', false, true),
    (volpin_id, f_misc, 'Matliot lajot',            '1', false, true),
    (volpin_id, f_misc, 'Matliot tzeubot',          '1', false, true),
    (volpin_id, f_misc, 'Menorot jalash',           '1', false, true),
    (volpin_id, f_misc, 'Menorot jazak',            '1', false, true),
    (volpin_id, f_misc, 'Nerot shabat',             '1', false, true),
    (volpin_id, f_misc, 'Dio 653 color',            '1', false, true),
    (volpin_id, f_misc, 'Dio 653 blak',             '1', false, true),
    (volpin_id, f_misc, 'Pirex 2l',                 '2', false, true),
    (volpin_id, f_misc, 'Parches codos',            '1', false, true),

    -- ── מוצרי חלב ──
    (volpin_id, f_dairy, 'Muzzarella',              '1', false, true),
    (volpin_id, f_dairy, 'Bulgarit',                '1', false, true),
    (volpin_id, f_dairy, 'Levane',                  '1', false, true),
    (volpin_id, f_dairy, 'Gvina levana',            '1', false, true),
    (volpin_id, f_dairy, 'Cotag',                   '1', false, true),
    (volpin_id, f_dairy, 'Yogurt colagen',          '1', false, true),
    (volpin_id, f_dairy, 'Yogurt pro',              '3', false, true),
    (volpin_id, f_dairy, 'Greek yogurt',            '1', false, true),
    (volpin_id, f_dairy, 'Tehina',                  '1', false, true),
    (volpin_id, f_dairy, 'Jumus',                   '1', false, true),
    (volpin_id, f_dairy, 'ביצים',                   '1', false, true),
    (volpin_id, f_dairy, 'Margarina',               '1', false, true),
    (volpin_id, f_dairy, 'Jema',                    '1', false, true),
    (volpin_id, f_dairy, 'Parmesan',                '1', false, true),
    (volpin_id, f_dairy, 'Gauda',                   '1', false, true),
    (volpin_id, f_dairy, 'Emeq',                    '1', false, true),
    (volpin_id, f_dairy, 'Yogourt',                 '1', false, true),
    (volpin_id, f_dairy, 'Milk',                    '1', false, true),

    -- ── פירות ──
    (volpin_id, f_fruits, 'Kiwi',                   '1', false, true),
    (volpin_id, f_fruits, 'Clementina',             '1', false, true),
    (volpin_id, f_fruits, 'Nectarina',              '1', false, true),
    (volpin_id, f_fruits, 'Afarsemon',              '1', false, true),
    (volpin_id, f_fruits, 'Afarsek',                '1', false, true),
    (volpin_id, f_fruits, 'Eshkoliot',              '1', false, true),
    (volpin_id, f_fruits, 'Tapuzim',                '1', false, true),
    (volpin_id, f_fruits, 'Bananot',                '1', false, true),
    (volpin_id, f_fruits, 'Tapuaj etz',             '1', false, true),
    (volpin_id, f_fruits, 'Agasim',                 '1', false, true),
    (volpin_id, f_fruits, 'Anabim',                 '1', false, true),

    -- ── מזווה ──
    (volpin_id, f_pantry, 'Ores',                   '1', false, true),
    (volpin_id, f_pantry, 'Shkedei marak',          '1', false, true),
    (volpin_id, f_pantry, 'Krutonim',               '1', false, true),
    (volpin_id, f_pantry, 'Creckerim',              '1', false, true),
    (volpin_id, f_pantry, 'Avkat uga iomuledet',    '1', false, true),
    (volpin_id, f_pantry, 'Chocolit',               '1', false, true),
    (volpin_id, f_pantry, 'Shmarim',                '1', false, true),
    (volpin_id, f_pantry, 'Melaj gas',              '1', false, true),
    (volpin_id, f_pantry, 'Melaj',                  '1', false, true),
    (volpin_id, f_pantry, 'Soda le shtia',          '1', false, true),
    (volpin_id, f_pantry, 'Sucar jum',              '1', false, true),
    (volpin_id, f_pantry, 'Sucar',                  '1', false, true),
    (volpin_id, f_pantry, 'Pirurei lejem',          '1', false, true),
    (volpin_id, f_pantry, 'Kemaj lejem',            '1', false, true),
    (volpin_id, f_pantry, 'Kemaj male',             '1', false, true),
    (volpin_id, f_pantry, 'Kemaj ragil',            '1', false, true),
    (volpin_id, f_pantry, 'Salat peirot',           '1', false, true),
    (volpin_id, f_pantry, 'Rekez tpuaj etz',        '1', false, true),
    (volpin_id, f_pantry, 'לחם',                    '1', false, true),
    (volpin_id, f_pantry, 'חמאת בוטנים',            '1', false, true),
    (volpin_id, f_pantry, 'Pitot',                  '1', false, true),
    (volpin_id, f_pantry, 'Jalot',                  '4', false, true),

    -- ── ממתקים ──
    (volpin_id, f_sweets, 'Oznei aman',                          '1', false, true),
    (volpin_id, f_sweets, 'Sufganiot',                           '1', false, true),
    (volpin_id, f_sweets, 'Ugiut chocolat tapuz',                '1', false, true),
    (volpin_id, f_sweets, 'Waflot',                              '1', false, true),
    (volpin_id, f_sweets, 'Oreo',                                '1', false, true),
    (volpin_id, f_sweets, 'Oreo',                                '1', false, true),
    (volpin_id, f_sweets, 'Dvash',                               '1', false, true),
    (volpin_id, f_sweets, 'Arizat pesek zman, kifkaf, mekupelet','1', false, true),
    (volpin_id, f_sweets, 'Conitos',                             '1', false, true),
    (volpin_id, f_sweets, 'Capsulot cafe',                       '1', false, true),
    (volpin_id, f_sweets, 'Uga',                                 '1', false, true),
    (volpin_id, f_sweets, 'Rivat jalav',                         '1', false, true),
    (volpin_id, f_sweets, 'Riva',                                '1', false, true),
    (volpin_id, f_sweets, 'Riva',                                '1', false, true),
    (volpin_id, f_sweets, 'Nutela',                              '1', false, true),
    (volpin_id, f_sweets, 'Shajar a ole',                        '1', false, true),
    (volpin_id, f_sweets, 'במב נוגט',                            '4', false, true),
    (volpin_id, f_sweets, 'צ׳יטוס',                              '4', false, false),

    -- ── בית מרקחת ──
    (volpin_id, f_pharmacy, 'Omaprodex',            '1', false, true),
    (volpin_id, f_pharmacy, 'Omega3',               '1', false, true),
    (volpin_id, f_pharmacy, 'Talc primon',          '1', false, true),
    (volpin_id, f_pharmacy, 'Vitamin b12 sjujit',   '1', false, true),
    (volpin_id, f_pharmacy, 'Vitamid d 1000 tipot', '1', false, true),
    (volpin_id, f_pharmacy, 'Velveta',              '1', false, true),
    (volpin_id, f_pharmacy, 'Mishjat sheinaim',     '1', false, true),
    (volpin_id, f_pharmacy, 'Jut dentali',          '1', false, true),
    (volpin_id, f_pharmacy, 'Maklonei kutna',       '1', false, true),
    (volpin_id, f_pharmacy, 'Voltaren',             '1', false, true),
    (volpin_id, f_pharmacy, 'Doje itushim',         '1', false, true),
    (volpin_id, f_pharmacy, 'Mishja le girudim',    '1', false, true),
    (volpin_id, f_pharmacy, 'Mishja le pzaim',      '1', false, true),
    (volpin_id, f_pharmacy, 'Dmaot tipot',          '1', false, true),
    (volpin_id, f_pharmacy, 'Renie',                '1', false, true),
    (volpin_id, f_pharmacy, 'Kalbeten',             '1', false, true),
    (volpin_id, f_pharmacy, 'Tzemer gefen',         '1', false, true),
    (volpin_id, f_pharmacy, 'Plasterim',            '1', false, true),
    (volpin_id, f_pharmacy, 'Mei jamtzan',          '1', false, true),
    (volpin_id, f_pharmacy, 'Alcohol',              '1', false, true),
    (volpin_id, f_pharmacy, 'Strepsils',            '1', false, true),
    (volpin_id, f_pharmacy, 'Neurofen',             '1', false, true),
    (volpin_id, f_pharmacy, 'Acamol sinun',         '1', false, true),
    (volpin_id, f_pharmacy, 'Acamol',               '1', false, true),

    -- ── רטבים ──
    (volpin_id, f_sauces, 'Shkedei marak',          '1', false, true),
    (volpin_id, f_sauces, 'Rotev barbacue',         '1', false, true),
    (volpin_id, f_sauces, 'Rotev soja',             '1', false, true),
    (volpin_id, f_sauces, 'Rotev agvaniot',         '1', false, true),
    (volpin_id, f_sauces, 'Mayones',                '1', false, true),
    (volpin_id, f_sauces, 'Ketshop',                '1', false, true),
    (volpin_id, f_sauces, 'רוטב צ''ילי חריף',       '1', false, true),
    (volpin_id, f_sauces, 'רוטב צ''ילי מתוק',       '1', false, true),
    (volpin_id, f_sauces, 'רוטב ברביקיו',            '1', false, false),
    (volpin_id, f_sauces, 'פלפל שחור',              '1', false, true),
    (volpin_id, f_sauces, 'מלח',                   '1', false, true),
    (volpin_id, f_sauces, 'Shemen zait',            '1', false, true),
    (volpin_id, f_sauces, 'Shemen Canola',          '1', false, true),
    (volpin_id, f_sauces, 'Jometz',                 '1', false, true),

    -- ── תוספי מזון ──
    (volpin_id, f_suppl, 'Ojel dagim',              '1', false, true),
    (volpin_id, f_suppl, 'Omega3 thoro',            '1', false, true),
    (volpin_id, f_suppl, 'Ojel toro mifrakim',      '1', false, true),
    (volpin_id, f_suppl, 'Jisun thoro',             '1', false, true),

    -- ── מכוניות ──
    (volpin_id, f_cars, 'Tipul adom May',           '1', false, true),
    (volpin_id, f_cars, 'Test i10 adom 27-2',       '1', false, true),
    (volpin_id, f_cars, 'Test i10 laban',           '1', false, true),
    (volpin_id, f_cars, 'Test micra',               '1', false, true),
    (volpin_id, f_cars, 'Tipul i10 adom May',       '1', false, true),
    (volpin_id, f_cars, 'Tipul i10 laban',          '1', false, true),
    (volpin_id, f_cars, 'Tipul micra',              '1', false, true),

    -- ── קפוא ──
    (volpin_id, f_frozen, 'Glida',                  '1', false, true),
    (volpin_id, f_frozen, 'Brocoli',                '1', false, true),
    (volpin_id, f_frozen, 'adashim',                '1', false, true),
    (volpin_id, f_frozen, 'krubit',                 '1', false, true),
    (volpin_id, f_frozen, 'tered',                  '1', false, true),
    (volpin_id, f_frozen, 'amnon',                  '1', true,  true),
    (volpin_id, f_frozen, 'salmon',                 '1', false, true),
    (volpin_id, f_frozen, 'pizza',                  '1', false, true),
    (volpin_id, f_frozen, 'shnitzel',               '1', true,  true),
    (volpin_id, f_frozen, 'בורקסים',                '2', false, true),

    -- ── ירקות ──
    (volpin_id, f_veggies, 'כרובית',                '1', false, true),
    (volpin_id, f_veggies, 'Jasa',                  '1', false, true),
    (volpin_id, f_veggies, 'Basilicum',             '1', false, true),
    (volpin_id, f_veggies, 'Avocado',               '1', false, true),
    (volpin_id, f_veggies, 'Shum',                  '1', false, true),
    (volpin_id, f_veggies, 'Petrozilia',            '1', false, true),
    (volpin_id, f_veggies, 'Gezer',                 '1', false, true),
    (volpin_id, f_veggies, 'Pitriot champinion',    '1', false, true),
    (volpin_id, f_veggies, 'Tapuaj adama',          '1', false, true),
    (volpin_id, f_veggies, 'Melafefon',             '1', false, true),
    (volpin_id, f_veggies, 'Agvaniot',              '1', false, true),
    (volpin_id, f_veggies, 'Batata',                '1', false, true),
    (volpin_id, f_veggies, 'Baatzal',               '1', false, true),

    -- ── בשר ──
    (volpin_id, f_meat, 'פילה עוף',                 '1', false, true),
    (volpin_id, f_meat, 'פילה בקר',                 '1', false, true),
    (volpin_id, f_meat, 'jaze off',                 '1', false, true),
    (volpin_id, f_meat, 'mispar4',                  '1', false, true),
    (volpin_id, f_meat, 'mispar2',                  '1', false, true),
    (volpin_id, f_meat, 'pulkes',                   '1', false, true),
    (volpin_id, f_meat, 'antricot',                 '1', false, true),
    (volpin_id, f_meat, 'basar tajun',              '1', false, true),
    (volpin_id, f_meat, 'chorizos',                 '1', false, true),
    (volpin_id, f_meat, 'naknikiot',                '1', false, true),
    (volpin_id, f_meat, 'pargiot',                  '1', false, true),
    (volpin_id, f_meat, 'knafaim',                  '1', false, true),
    (volpin_id, f_meat, 'cinta',                    '1', false, true),
    (volpin_id, f_meat, 'Basar 2',                  '1', false, true),
    (volpin_id, f_meat, 'Of',                       '1', false, true);

  -- ── 7. Insert Dan's personal items ────────────────────────
  INSERT INTO items (list_id, folder_id, name, quantity, is_favorite, is_purchased) VALUES
    -- No folder
    (personal_id, NULL, 'שמפו',                    '1',  false, false),
    (personal_id, NULL, 'גבינה צהובה',             '1',  false, false),
    (personal_id, NULL, 'גרעינים',                  '1',  false, false),
    (personal_id, NULL, 'עוגיות',                   '1',  false, false),
    (personal_id, NULL, 'ריבה',                     '1',  false, false),
    (personal_id, NULL, 'חמאת בוטנים',             '1',  false, false),
    (personal_id, NULL, 'חמאה',                     '1',  false, false),
    (personal_id, NULL, 'שמן קנולה',                '1',  false, false),
    (personal_id, NULL, 'שמן זית',                  '1',  false, false),
    (personal_id, NULL, 'בשר',                      '1',  false, false),
    (personal_id, NULL, 'עוף',                      '1',  false, false),
    (personal_id, NULL, 'תפוח',                     '1',  false, false),
    (personal_id, NULL, 'ביצים',                    '12', true,  true),
    (personal_id, NULL, 'חלב',                      '2L', true,  false),
    (personal_id, NULL, 'שניצל',                    '3',  false, false),
    (personal_id, NULL, 'חלב',                      '1L', false, false),
    (personal_id, NULL, 'Morag',                    '3',  false, true),
    -- משימות folder (f9583a1f)
    (personal_id, fp_tasks, 'קפה לפקל קפה',        '1',  false, true),
    (personal_id, fp_tasks, 'Linkedin',             '1',  false, true),
    (personal_id, fp_tasks, 'כביסה',                '1',  false, true),
    (personal_id, fp_tasks, 'כפפות בדקתלון',        '1',  false, true),
    (personal_id, fp_tasks, 'לטפל בגינה',           '1',  false, true),
    (personal_id, fp_tasks, 'לתקן לאמא כוס',        '1',  false, true),
    (personal_id, fp_tasks, 'קפה בפקל',             '1',  false, true),
    -- ירקות folder (bf1f70b7)
    (personal_id, fp_veggies, 'עגבניה',             '1',  false, false),
    (personal_id, fp_veggies, 'מלפפון',             '1',  false, false),
    -- פירות folder (19993f47)
    (personal_id, fp_fruits, 'בננה',                '1',  false, false);

  RAISE NOTICE 'Migration complete. Volpin list ID: %', volpin_id;

END $$;
