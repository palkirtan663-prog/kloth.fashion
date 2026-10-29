/*
  validators.js - input validation shared by controllers and seeds.
  Every function returns an error message string, or null when the input is fine.
*/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLES = ['user', 'admin'];

const normalizeEmail = (email) => String(email).trim().toLowerCase();

function validateEmail(email) {
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 254) {
    return 'Enter a valid email address.';
  }
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string') return 'Password is required.';
  if (password.length < 8 || password.length > 72) return 'Password must be 8 to 72 characters long.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password needs at least one letter and one number.';
  }
  return null;
}

function validateRegister(body) {
  const { name, email, password } = body || {};
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
    return 'Name must be between 2 and 50 characters.';
  }
  return validateEmail(email) || validatePassword(password);
}

function validateLogin(body) {
  const { email, password } = body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !password) {
    return 'Email and password are required.';
  }
  return validateEmail(email);
}

const PRODUCT_FIELDS = ['name', 'price', 'category', 'description', 'image', 'color', 'rating', 'tag', 'sizes', 'stock', 'gender', 'gallery'];
function pickProductFields(body) {
  const out = {};
  for (const key of PRODUCT_FIELDS) {
    if (body && body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
  ROLES,
  EMAIL_RE,
  normalizeEmail,
  validateEmail,
  validatePassword,
  validateRegister,
  validateLogin,
  pickProductFields,
  escapeRegex,
};
