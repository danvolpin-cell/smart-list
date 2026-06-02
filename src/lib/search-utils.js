// ── Hebrew ↔ Latin transliteration ──────────────────────────────────────────

const HE_TO_LAT = {
  'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h',
  'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'i',
  'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm', 'ם': 'm',
  'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': '', 'פ': 'p',
  'ף': 'f', 'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r',
  'ש': 'sh', 'ת': 't',
}

// Hebrew niqqud (vowel marks) — strip these
const NIQQUD = /[ְ-ׇ]/g

export function hebrewToLatin(text) {
  return text
    .replace(NIQQUD, '')
    .split('')
    .map(c => HE_TO_LAT[c] ?? c)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function isHebrew(text) {
  return /[א-ת]/.test(text)
}

// ── Hebrew ↔ English grocery dictionary ─────────────────────────────────────

const SYNONYMS = {
  // Proteins
  'chicken':       ['עוף', 'תרנגול', 'of', 'ofot', 'tirnogol'],
  'עוף':           ['chicken', 'poultry', 'of'],
  'תרנגול':        ['chicken'],
  'beef':          ['בשר', 'basar'],
  'בשר':           ['beef', 'meat'],
  'fish':          ['דג', 'dag'],
  'דג':            ['fish'],
  'salmon':        ['סלמון', 'salamon'],
  'סלמון':         ['salmon'],
  'tuna':          ['טונה', 'tona'],
  'טונה':          ['tuna'],
  'egg':           ['ביצה', 'ביצים', 'beitza', 'beitzim'],
  'eggs':          ['ביצים', 'ביצה', 'beitzim'],
  'ביצים':         ['eggs', 'egg'],
  'ביצה':          ['egg'],
  // Dairy
  'milk':          ['חלב', 'jalav', 'halav'],
  'חלב':           ['milk'],
  'cheese':        ['גבינה', 'gvina'],
  'גבינה':         ['cheese'],
  'butter':        ['חמאה', 'jema', 'hema'],
  'חמאה':          ['butter'],
  'yogurt':        ['יוגורט', 'yogourt'],
  'יוגורט':        ['yogurt', 'yoghurt'],
  'cream':         ['שמנת', 'shamenet'],
  'שמנת':          ['cream'],
  'cottage':       ['קוטג', 'kotej'],
  'קוטג':          ['cottage'],
  // Produce
  'tomato':        ['עגבנייה', 'עגבנייה', 'agvaniya'],
  'עגבנייה':       ['tomato'],
  'עגבניה':        ['tomato'],
  'cucumber':      ['מלפפון', 'melafafon'],
  'מלפפון':        ['cucumber'],
  'carrot':        ['גזר', 'gezer'],
  'גזר':           ['carrot'],
  'onion':         ['בצל', 'batzal'],
  'בצל':           ['onion'],
  'garlic':        ['שום', 'shum'],
  'שום':           ['garlic'],
  'potato':        ['תפוח אדמה', 'tapuach adama', 'batata'],
  'תפוח אדמה':    ['potato'],
  'pepper':        ['פלפל', 'pilpel'],
  'פלפל':          ['pepper'],
  'lettuce':       ['חסה', 'jasa'],
  'חסה':           ['lettuce'],
  'mushroom':      ['פטרייה', 'פיטריה', 'pitriya'],
  'פטרייה':        ['mushroom'],
  'avocado':       ['אבוקדו', 'avokado'],
  'אבוקדו':        ['avocado'],
  'broccoli':      ['ברוקולי', 'brokoli'],
  'ברוקולי':       ['broccoli'],
  'cauliflower':   ['כרובית', 'krubit'],
  'כרובית':        ['cauliflower'],
  'spinach':       ['תרד', 'tered'],
  'תרד':           ['spinach'],
  'zucchini':      ['קישוא', 'kishu'],
  'קישוא':         ['zucchini'],
  // Fruit
  'apple':         ['תפוח', 'tapuach', 'tapuaj'],
  'תפוח':          ['apple'],
  'banana':        ['בננה', 'banana'],
  'בננה':          ['banana'],
  'orange':        ['תפוז', 'tapuz'],
  'תפוז':          ['orange'],
  'grape':         ['ענב', 'ענבים', 'anav', 'anavim'],
  'ענבים':         ['grapes', 'grape'],
  'strawberry':    ['תות', 'tut'],
  'תות':           ['strawberry'],
  'watermelon':    ['אבטיח', 'avatiach'],
  'אבטיח':         ['watermelon'],
  'melon':         ['מלון', 'melon'],
  'מלון':          ['melon'],
  'lemon':         ['לימון', 'limon'],
  'לימון':         ['lemon'],
  'kiwi':          ['קיווי', 'kiwi'],
  // Bread & Grains
  'bread':         ['לחם', 'lechem', 'lejem'],
  'לחם':           ['bread'],
  'rice':          ['אורז', 'orez', 'ores'],
  'אורז':          ['rice'],
  'pasta':         ['פסטה', 'pesta'],
  'פסטה':          ['pasta'],
  'flour':         ['קמח', 'kemach', 'kemaj'],
  'קמח':           ['flour'],
  'pita':          ['פיתה', 'pita'],
  'פיתה':          ['pita'],
  // Pantry
  'oil':           ['שמן', 'shemen'],
  'שמן':           ['oil'],
  'salt':          ['מלח', 'melach', 'melaj'],
  'מלח':           ['salt'],
  'sugar':         ['סוכר', 'sukar', 'sucar'],
  'סוכר':          ['sugar'],
  'honey':         ['דבש', 'dvash'],
  'דבש':           ['honey'],
  'tahini':        ['טחינה', 'tejina'],
  'טחינה':         ['tahini'],
  'hummus':        ['חומוס', 'homus', 'jumus'],
  'חומוס':         ['hummus'],
  // Drinks
  'water':         ['מים', 'mayim'],
  'מים':           ['water'],
  'juice':         ['מיץ', 'mitz'],
  'מיץ':           ['juice'],
  'coffee':        ['קפה', 'kafe'],
  'קפה':           ['coffee'],
  'tea':           ['תה', 'te'],
  'תה':            ['tea'],
  'beer':          ['בירה', 'bira'],
  'בירה':          ['beer'],
  'wine':          ['יין', 'iain', 'yayin'],
  'יין':           ['wine'],
  'cola':          ['קולה', 'cola'],
  'קולה':          ['cola'],
  // Cleaning
  'soap':          ['סבון', 'sabon'],
  'סבון':          ['soap'],
  'shampoo':       ['שמפו', 'shampoo'],
  'שמפו':          ['shampoo'],
  'toilet paper':  ['נייר טואלט', 'niar toilet'],
  'נייר טואלט':   ['toilet paper'],
  // Condiments
  'ketchup':       ['קטשופ', 'ketshop'],
  'קטשופ':         ['ketchup'],
  'mayonnaise':    ['מיונז', 'mayones'],
  'מיונז':         ['mayonnaise', 'mayo'],
  'mustard':       ['חרדל', 'hardal'],
  'חרדל':          ['mustard'],
}

// ── Main function: expand query into all searchable variants ─────────────────

export function expandQuery(query) {
  const q = query.trim().toLowerCase()
  const terms = new Set([q])

  // 1. Add synonym expansions
  for (const [key, vals] of Object.entries(SYNONYMS)) {
    if (key.toLowerCase().includes(q) || q.includes(key.toLowerCase())) {
      vals.forEach(v => terms.add(v.toLowerCase()))
    }
    // Check if any synonym matches
    if (vals.some(v => v.toLowerCase().includes(q) || q.includes(v.toLowerCase()))) {
      terms.add(key.toLowerCase())
      vals.forEach(v => terms.add(v.toLowerCase()))
    }
  }

  // 2. If query is Hebrew, add Latin transliteration
  if (isHebrew(q)) {
    terms.add(hebrewToLatin(q))
  }

  return [...terms]
}

// Build searchable text for an item (used to enrich the Fuse index)
export function buildSearchText(item) {
  const name = item.name
  const parts = [name]

  // Add transliteration if Hebrew
  if (isHebrew(name)) {
    parts.push(hebrewToLatin(name))
  }

  // Add synonyms
  const nameLower = name.toLowerCase()
  for (const [key, vals] of Object.entries(SYNONYMS)) {
    if (nameLower === key.toLowerCase() || nameLower.includes(key.toLowerCase())) {
      parts.push(...vals)
    }
  }

  return parts.join(' ')
}
