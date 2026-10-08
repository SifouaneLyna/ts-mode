// Turn what the owner typed (a handle or a full link) into a link
export const waDigits = (n) => { const d = String(n).replace(/\D/g, ''); return d.startsWith('0') ? `213${d.slice(1)}` : d; };
const full = (v, base) => (/^https?:\/\//i.test(v) ? v : base + String(v).replace(/^@/, ''));
export const socialUrl = {
  instagram: (v) => full(v, 'https://instagram.com/'),
  facebook: (v) => full(v, 'https://facebook.com/'),
  tiktok: (v) => (/^https?:\/\//i.test(v) ? v : `https://tiktok.com/@${String(v).replace(/^@/, '')}`),
  whatsapp: (v) => `https://wa.me/${waDigits(v)}`,
};
