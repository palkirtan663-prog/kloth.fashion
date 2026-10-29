// Brute-force protection: 5 wrong logins per 15 minutes per IP + email.
// In-memory (resets when the server restarts) - fine for a single-instance deployment.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map();

const keyFor = (req, email) => `${req.ip}|${email}`;

function isLocked(key) {
  const a = attempts.get(key);
  if (!a) return false;
  if (Date.now() - a.first > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return a.count >= MAX_ATTEMPTS;
}

function recordFailure(key) {
  if (attempts.size > 5000) {
    for (const [k, v] of attempts) if (Date.now() - v.first > WINDOW_MS) attempts.delete(k);
  }
  const a = attempts.get(key);
  if (!a || Date.now() - a.first > WINDOW_MS) attempts.set(key, { count: 1, first: Date.now() });
  else a.count += 1;
}

const clear = (key) => attempts.delete(key);
const reset = () => { attempts.clear(); registrations.clear(); };

const MAX_REGISTRATIONS = 15;
const REG_WINDOW_MS = 60 * 60 * 1000;
const registrations = new Map();

function isRegisterLocked(ip) {
  const r = registrations.get(ip);
  if (!r) return false;
  if (Date.now() - r.first > REG_WINDOW_MS) {
    registrations.delete(ip);
    return false;
  }
  return r.count >= MAX_REGISTRATIONS;
}

function recordRegistration(ip) {
  if (registrations.size > 5000) {
    for (const [k, v] of registrations) if (Date.now() - v.first > REG_WINDOW_MS) registrations.delete(k);
  }
  const r = registrations.get(ip);
  if (!r || Date.now() - r.first > REG_WINDOW_MS) registrations.set(ip, { count: 1, first: Date.now() });
  else r.count += 1;
}

module.exports = {
  keyFor,
  isLocked,
  recordFailure,
  clear,
  reset,
  MAX_ATTEMPTS,
  isRegisterLocked,
  recordRegistration,
  MAX_REGISTRATIONS,
};
