const jwt = require('jsonwebtoken');

const signToken = (userId, config) =>
  jwt.sign({ sub: String(userId) }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    algorithm: 'HS256',
  });

const verifyToken = (token, config) =>
  jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });

module.exports = { signToken, verifyToken };
