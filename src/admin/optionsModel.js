import { isColorName } from '../utils/attributes';

export const SEP = '\u0001';
export const comboKey = (values) => values.join(SEP);

// variants[] (what the backend stores) -> the editor's friendlier model.
// canonValue / canonName turn synonyms into one word (Rouge -> Red), so the same color is not listed twice;
// the stock of merged rows is added up.
export function optionsFromVariants(variants, canonValue = (x) => x, canonName = (x) => x) {
  const attrsOf = (v) => Object.fromEntries(Object.entries(v.attributes || {}).map(([k, val]) => [canonName(k), canonValue(val)]));
  const rows = variants.map((v) => ({ ...v, attributes: attrsOf(v) }));
  const names = [];
  for (const v of rows) for (const k of Object.keys(v.attributes)) if (!names.includes(k)) names.push(k);
  const options = names.map((name) => ({ name, values: [...new Set(rows.map((v) => v.attributes[name]).filter(Boolean))] }));
  const stock = {};
  const colorImages = {};
  for (const v of rows) {
    const key = comboKey(names.map((n) => v.attributes[n] ?? ''));
    stock[key] = String((Number(stock[key]) || 0) + (Number(v.stockQty) || 0));
    for (const n of names) {
      if (isColorName(n) && v.images?.length && !colorImages[v.attributes[n]]) colorImages[v.attributes[n]] = v.images;
    }
  }
  return { options, stock, colorImages };
}

// all combinations of the options' values, in order: [{color:'Red', size:'S'}, ...]
export function combinations(options) {
  if (!options.length || options.some((o) => o.values.length === 0)) return [];
  return options.reduce(
    (acc, o) => acc.flatMap((a) => o.values.map((v) => [...a, v])),
    [[]],
  );
}

// the editor's model -> variants[] for the backend
export function variantsFromOptions(options, stock, colorImages) {
  return combinations(options).map((vals) => {
    const attributes = Object.fromEntries(options.map((o, i) => [o.name, vals[i]]));
    const colorIdx = options.findIndex((o) => isColorName(o.name));
    return {
      attributes,
      stockQty: Number(stock[comboKey(vals)]) || 0,
      images: colorIdx >= 0 ? colorImages[vals[colorIdx]] || [] : [],
    };
  });
}
