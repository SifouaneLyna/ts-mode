export const cleanPhone = (v = '') => v.replace(/[\s.\-()]/g, '');
export const isValidPhone = (v) => /^0[567]\d{8}$/.test(cleanPhone(v));
export const isValidUsername = (v = '') => /^[a-z0-9._]{3,20}$/i.test(v.trim());

export function validateLogin(f) {
  const e = {};
  if (!f.identifier.trim()) e.identifier = 'Enter your username or phone number.';
  if (!f.password) e.password = 'Enter your password.';
  return e;
}

export function validateProfile(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Enter your full name.';
  if (!isValidUsername(f.username)) e.username = '3 to 20 characters: letters, numbers, dot or underscore.';
  if (!isValidPhone(f.phone)) e.phone = 'Enter a valid mobile number (e.g. 0555 12 34 56).';
  return e;
}

export function validateSignup(f) {
  const e = validateProfile(f);
  if (f.password.length < 6) e.password = 'At least 6 characters.';
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match.';
  return e;
}
