/*
  errorHandler.js - one place that turns any thrown error into a safe JSON response.
  Internal details (stack traces, query text, connection strings) are never sent to clients.
*/

const DB_DOWN_NAMES = [
  'MongoServerSelectionError',
  'MongooseServerSelectionError',
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
  'MongoNotConnectedError',
  'MongoServerClosedError',
];

function mapError(err) {
  if (!err) return { status: 500, message: 'Something went wrong on the server.' };

  if (err.type === 'entity.parse.failed') return { status: 400, message: 'Request body is not valid JSON.' };
  if (err.type === 'entity.too.large') return { status: 413, message: 'Request body is too large.' };

  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message).filter(Boolean);
    return { status: 400, message: messages.join(' ') || 'Invalid data.' };
  }

  if (err.name === 'CastError') {
    return { status: 400, message: err.path === '_id' ? 'Invalid ID.' : `Invalid value for "${err.path}".` };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    if (field === 'email') return { status: 409, message: 'An account with this email already exists.' };
    if (field === 'name') return { status: 409, message: 'A product with this name already exists.' };
    return { status: 409, message: 'That value already exists.' };
  }

  if (DB_DOWN_NAMES.includes(err.name) || /buffering timed out|topology (was )?destroyed/i.test(err.message || '')) {
    return { status: 503, message: 'The database is temporarily unavailable. Please try again shortly.' };
  }

  const status = err.status || err.statusCode;
  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return { status, message: err.expose ? err.message : 'Bad request.' };
  }

  return { status: 500, message: 'Something went wrong on the server.' };
}

function notFound(req, res) {
  res.status(404).json({ error: 'Route not found.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const { status, message } = mapError(err);
  if (status >= 500) console.error(`[error] ${req.method} ${req.path}:`, err);
  res.status(status).json({ error: message });
}

module.exports = { errorHandler, notFound, mapError };
