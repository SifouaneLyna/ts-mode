// Product / category text in the visitor's language, falling back to the main text.
export const loc = (item, field, lang) =>
  item?.translations?.[lang]?.[field]?.trim() || item?.[field] || '';
