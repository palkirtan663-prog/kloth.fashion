const mongoose = require('mongoose');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

// AUTHENTICATION guard: the request must carry "Authorization: Bearer <token>".
// The user is loaded from MongoDB on EVERY request, so deleting a user or changing
async function authenticate(req, res, next) {
  const parts = (req.headers.authorization || '').trim().split(/\s+/);
  const scheme = parts[0];
  const token = parts[1];
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Please log in to continue.' });
  }

  let payload;
  try {
    payload = verifyToken(token, req.app.locals.config);
  } catch (e) {
    const expired = e && e.name === 'TokenExpiredError';
    return res
      .status(401)
      .json({ error: expired ? 'Session expired. Please log in again.' : 'Invalid session. Please log in again.' });
  }

  if (!mongoose.isValidObjectId(payload.sub)) {
    return res.status(401).json({ error: 'Invalid session. Please log in again.' });
  }

  // Database errors here are NOT auth failures - they propagate to the error handler (503/500).
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ error: 'This account no longer exists.' });

  req.user = user;
  next();
}

module.exports = authenticate;
