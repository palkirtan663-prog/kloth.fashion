/*
  dbErrors.js - pure helpers (no mongoose import) so they are easy to test.
*/

// Remove credentials and query string so a connection string is safe to log.
function redactUri(uri) {
  return String(uri || '')
    .replace(/^(mongodb(?:\+srv)?:\/\/)[^@/]*@/i, '$1***@')
    .replace(/\?.*$/, '');
}

// Turn a low-level connection error into one clear, actionable sentence.
function describeConnectionError(err) {
  const msg = String((err && err.message) || err || '');
  const code = err && (err.code || (err.cause && err.cause.code));

  if (/bad auth|authentication failed|auth failed/i.test(msg) || code === 18 || code === 8000) {
    return 'Authentication failed. Check the database username and password in MONGODB_URI (URL-encode special characters).';
  }
  if (/alert number 80|alert internal error|tlsv1 alert/i.test(msg)) {
    return 'MongoDB Atlas rejected the SSL/TLS connection (SSL alert 80). Your current IP address is not whitelisted in MongoDB Atlas Network Access. Whitelist your IP (or 0.0.0.0/0) in cloud.mongodb.com -> Network Access.';
  }
  if (/querySrv|ENOTFOUND|EAI_AGAIN/i.test(msg) || code === 'ENOTFOUND') {
    return 'The database host could not be found. Check the host name in MONGODB_URI and your internet connection.';
  }
  if (/ECONNREFUSED/i.test(msg) || code === 'ECONNREFUSED') {
    return 'Connection refused. If you use local MongoDB, make sure the MongoDB service is running on that host and port.';
  }
  if (/server selection|timed out|timeout/i.test(msg)) {
    return 'Could not reach the database before the timeout. For Atlas, add your IP address under Network Access; for local MongoDB, make sure mongod is running.';
  }
  if (/invalid scheme|invalid connection string|invalid.*uri/i.test(msg)) {
    return 'MONGODB_URI is not a valid MongoDB connection string.';
  }
  return `Unexpected database error: ${msg || 'unknown error'}`;
}

module.exports = { redactUri, describeConnectionError };
