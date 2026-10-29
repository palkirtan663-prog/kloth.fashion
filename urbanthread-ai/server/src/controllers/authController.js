const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { validateRegister, validateLogin, normalizeEmail } = require('../utils/validators');
const limiter = require('../middleware/loginLimiter');

const BCRYPT_ROUNDS = 10;
// Keeps login timing similar for unknown emails so attackers cannot probe which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

async function register(req, res) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (limiter.isRegisterLocked(ip)) {
    return res.status(429).json({ error: 'Too many accounts created from this network. Try again later.' });
  }

  const problem = validateRegister(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const email = normalizeEmail(req.body.email);
  if (await User.exists({ email })) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  limiter.recordRegistration(ip);

  // Fields are picked explicitly: a "role" sent in the request body is ignored,
  // so nobody can make themselves an admin through registration.
  // (A duplicate that slips through the check above is caught by the unique index -> 409.)
  const user = await User.create({
    name: req.body.name.trim(),
    email,
    passwordHash: await bcrypt.hash(req.body.password, BCRYPT_ROUNDS),
    role: 'user',
  });

  res.status(201).json({ token: signToken(user.id, req.app.locals.config), user });
}

async function login(req, res) {
  const problem = validateLogin(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const email = normalizeEmail(req.body.email);
  const key = limiter.keyFor(req, email);
  if (limiter.isLocked(key)) {
    return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = await bcrypt.compare(req.body.password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) {
    limiter.recordFailure(key);
    // Same message for "unknown email" and "wrong password".
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  limiter.clear(key);
  res.json({ token: signToken(user.id, req.app.locals.config), user }); // toJSON strips passwordHash
}

async function adminLogin(req, res) {
  const problem = validateLogin(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const email = normalizeEmail(req.body.email);
  const key = limiter.keyFor(req, `admin_${email}`);
  if (limiter.isLocked(key)) {
    return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = await bcrypt.compare(req.body.password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) {
    limiter.recordFailure(key);
    return res.status(401).json({ error: 'Invalid admin email or password.' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access Denied: This account is currently registered as a customer. Please use the "Create / Set Admin Password" option below to grant Administrator access with your chosen password.',
      canPromote: true,
    });
  }

  limiter.clear(key);
  res.json({ token: signToken(user.id, req.app.locals.config), user });
}

async function adminSetup(req, res) {
  const { name, email: rawEmail, password } = req.body;
  if (!rawEmail || !password) {
    return res.status(400).json({ error: 'Store Owner email and password are required.' });
  }

  const email = normalizeEmail(rawEmail);
  const problem = validateLogin({ email, password });
  if (problem) return res.status(400).json({ error: problem });

  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters with letters and numbers.' });
  }

  const key = limiter.keyFor(req, `admin_${email}`);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let user = await User.findOne({ email }).select('+passwordHash');
  if (user) {
    user.role = 'admin';
    user.passwordHash = passwordHash;
    if (name && name.trim()) user.name = name.trim();
    await user.save();
  } else {
    user = await User.create({
      name: (name && name.trim()) || 'Store Owner',
      email,
      passwordHash,
      role: 'admin',
    });
  }

  limiter.clear(key);
  limiter.clear(limiter.keyFor(req, email));

  res.json({
    token: signToken(user.id, req.app.locals.config),
    user,
    message: 'Store Owner credentials configured successfully! You are now authenticated as Administrator.',
  });
}

// Used by the website on page load to restore the session from the saved token.
function me(req, res) {
  res.json({ user: req.user });
}

async function updateProfile(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  if (typeof req.body.name === 'string' && req.body.name.trim().length >= 2) {
    user.name = req.body.name.trim();
  }
  if (typeof req.body.phone === 'string') {
    user.phone = req.body.phone.trim();
  }
  if (req.body.address && typeof req.body.address === 'object') {
    user.address = {
      street: String(req.body.address.street || '').trim(),
      city: String(req.body.address.city || '').trim(),
      state: String(req.body.address.state || '').trim(),
      postalCode: String(req.body.address.postalCode || '').trim(),
    };
  }
  if (req.body.notificationPreferences && typeof req.body.notificationPreferences === 'object') {
    user.notificationPreferences = {
      marketing: Boolean(req.body.notificationPreferences.marketing),
      orderUpdates: Boolean(req.body.notificationPreferences.orderUpdates),
      restocks: Boolean(req.body.notificationPreferences.restocks),
    };
  }

  await user.save();
  res.json({ user });
}

async function changePassword(req, res) {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return res.status(400).json({ error: 'New password must be at least 8 characters with letters and numbers.' });
  }

  const userId = req.user?.id || req.user?._id;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await user.save();

  res.json({ success: true, message: 'Password updated successfully!' });
}

async function resetPassword(req, res) {
  const { email: rawEmail, newPassword } = req.body;
  if (!rawEmail || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }

  const email = normalizeEmail(rawEmail);
  const passProblem = validateLogin({ email, password: newPassword });
  if (passProblem) return res.status(400).json({ error: passProblem });

  if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters with letters and numbers.' });
  }

  let user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    // If resetting from the admin portal, establish the account as admin
    if (req.body.isAdminPortal) {
      user = await User.create({
        name: 'Store Owner',
        email,
        passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS),
        role: 'admin',
      });
      limiter.clear(limiter.keyFor(req, email));
      limiter.clear(limiter.keyFor(req, `admin_${email}`));
      return res.json({ success: true, message: 'Admin account created and password established. You can now sign in.' });
    }
    // Keep timing safe
    await bcrypt.compare(newPassword, DUMMY_HASH);
    return res.status(404).json({ error: 'No account found with this email address.' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  if (req.body.isAdminPortal) {
    user.role = 'admin';
  }
  await user.save();

  // Clear any failed login lock
  limiter.clear(limiter.keyFor(req, email));
  limiter.clear(limiter.keyFor(req, `admin_${email}`));

  res.json({ success: true, message: 'Password has been securely updated. You can now sign in.' });
}

module.exports = { register, login, adminLogin, adminSetup, me, updateProfile, changePassword, resetPassword };
