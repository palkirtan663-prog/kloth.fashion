// AUTHORIZATION guard: the logged-in user must have one of the allowed roles.
// Always mount AFTER authenticate.
const authorize = (...allowed) => (req, res, next) =>
  req.user && allowed.includes(req.user.role)
    ? next()
    : res.status(403).json({ error: 'You do not have permission to do that.' });

module.exports = authorize;
