// Each function returns { field: translationKey }; the screens translate the keys with t().
export const cleanPhone = (v = '') => v.replace(/[\s.\-()]/g, '');
export const isValidPhone = (v) => /^0[567]\d{8}$/.test(cleanPhone(v));
export const isValidUsername = (v = '') => /^[a-z0-9._]{3,20}$/i.test(v.trim());

export function validateLogin(f) {
  const e = {};
  if (!f.identifier.trim()) e.identifier = 'v.identifier';
  if (!f.password) e.password = 'v.password';
  return e;
}

export function validateProfile(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'v.name';
  if (!isValidUsername(f.username)) e.username = 'v.username';
  if (!isValidPhone(f.phone)) e.phone = 'v.phone';
  return e;
}

export function validateSignup(f) {
  const e = validateProfile(f);
  if (f.password.length < 6) e.password = 'v.passwordMin';
  if (f.confirm !== f.password) e.confirm = 'v.passwordMatch';
  return e;
}
