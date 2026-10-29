const mongoose = require('mongoose');

// Rejects malformed ids with 400 before they reach the database.
const validateObjectId = (param = 'id') => (req, res, next) =>
  mongoose.isValidObjectId(req.params[param]) && String(req.params[param]).length === 24
    ? next()
    : res.status(400).json({ error: 'Invalid ID.' });

module.exports = validateObjectId;
