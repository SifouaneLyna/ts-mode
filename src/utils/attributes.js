// Product options (color, size...) are stored once, in one language. This dictionary shows them in the
// visitor's language. A word typed in ANY of the three languages is recognised, so "Rouge", "Red" and "أحمر"
// are the same word. Words that aren't here stay as typed, and the owner can add translations in the admin.

// [English, French, Arabic]
const NAMES = [
  ['Color', 'Couleur', 'اللون'], ['Size', 'Taille', 'المقاس'], ['Length', 'Longueur', 'الطول'],
  ['Material', 'Matière', 'الخامة'], ['Style', 'Style', 'النمط'],
];
const COLORS = [
  ['Black', 'Noir', 'أسود'], ['White', 'Blanc', 'أبيض'], ['Red', 'Rouge', 'أحمر'], ['Blue', 'Bleu', 'أزرق'],
  ['Navy', 'Bleu marine', 'كحلي'], ['Sky blue', 'Bleu ciel', 'سماوي'], ['Green', 'Vert', 'أخضر'], ['Olive', 'Olive', 'زيتي'],
  ['Khaki', 'Kaki', 'كاكي'], ['Mint', 'Menthe', 'نعناعي'], ['Yellow', 'Jaune', 'أصفر'], ['Mustard', 'Moutarde', 'خردلي'],
  ['Pink', 'Rose', 'وردي'], ['Fuchsia', 'Fuchsia', 'فوشيا'], ['Coral', 'Corail', 'مرجاني'], ['Peach', 'Pêche', 'خوخي'],
  ['Purple', 'Violet', 'بنفسجي'], ['Lilac', 'Lilas', 'ليلكي'], ['Orange', 'Orange', 'برتقالي'], ['Brown', 'Marron', 'بني'],
  ['Camel', 'Camel', 'جملي'], ['Beige', 'Beige', 'بيج'], ['Cream', 'Crème', 'كريمي'], ['Ivory', 'Ivoire', 'عاجي'],
  ['Nude', 'Nude', 'نيود'], ['Grey', 'Gris', 'رمادي'], ['Gold', 'Doré', 'ذهبي'], ['Silver', 'Argenté', 'فضي'],
  ['Burgundy', 'Bordeaux', 'بوردو'], ['Turquoise', 'Turquoise', 'تركوازي'], ['Multicolor', 'Multicolore', 'متعدد الألوان'],
];
const SIZE_WORDS = [
  ['One size', 'Taille unique', 'مقاس واحد'], ['Small', 'Petit', 'صغير'], ['Medium', 'Moyen', 'متوسط'], ['Large', 'Grand', 'كبير'],
];
export const SIZE_SUGGESTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46', '48'];

// lower case, no accents, no Arabic diacritics, one kind of alef
export const normalize = (s) =>
  String(s ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/\s+/g, ' ');

const LANGS = ['en', 'fr', 'ar'];
const toConcept = ([en, fr, ar]) => ({ en, fr, ar });
export const BUILTIN = { names: NAMES.map(toConcept), colors: COLORS.map(toConcept), sizeWords: SIZE_WORDS.map(toConcept) };

function buildIndex(custom = []) {
  const index = new Map();
  const add = (concept) => LANGS.forEach((l) => concept[l] && index.set(normalize(concept[l]), concept));
  [...BUILTIN.names, ...BUILTIN.colors, ...BUILTIN.sizeWords].forEach(add);
  // the owner's own words win over the built-in ones
  custom.forEach((c) => {
    const filled = LANGS.find((l) => c[l]);
    if (!filled) return;
    add({ en: c.en || c[filled], fr: c.fr || c[filled], ar: c.ar || c[filled] });
  });
  return index;
}

// Returns { name(word), value(word), known(word), conceptOf(word) } for one language
export function makeTranslator(lang, custom) {
  const index = buildIndex(custom);
  const word = (w) => {
    const c = index.get(normalize(w));
    return c ? c[lang] || c.en : w;
  };
  return {
    name: word,
    value: word,
    known: (w) => index.has(normalize(w)),
    // the English form (used as the stored value for known words)
    canonical: (w) => index.get(normalize(w))?.en ?? String(w).trim(),
    joinValues: (attributes) => Object.values(attributes || {}).map(word).join(' / '),
    entries: (attributes) => Object.entries(attributes || {}).map(([k, v]) => [word(k), word(v)]),
  };
}

export const isColorName = (name) => ['color', 'colour', 'couleur', 'اللون', 'لون'].includes(normalize(name));
export const isSizeName = (name) => ['size', 'taille', 'المقاس', 'مقاس'].includes(normalize(name));

// Sizes (S, M, XL, 38...) look the same in every language: no need to ask for a translation
export const isUniversalWord = (w) => /^(x{0,3}[sl]|m|\d+([.,]\d+)?)$/i.test(String(w).trim());
