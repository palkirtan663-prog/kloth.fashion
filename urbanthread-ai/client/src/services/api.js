// Talks to the Express API. Stores the login token and attaches it to every request.
// Works seamlessly with Vite's proxy (/api), direct server URLs, or deployed domains.
const CONFIGURED_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

const isBrowser = typeof window !== 'undefined';
const isLocal = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// When deployed to production, ignore any hardcoded localhost URL that was baked into the build
const sanitizedConfigBase = (!isLocal && (CONFIGURED_BASE.includes('localhost') || CONFIGURED_BASE.includes('127.0.0.1')))
  ? ''
  : CONFIGURED_BASE;

// Dynamic base that remembers which candidate succeeded to keep subsequent requests instant
let activeBase = sanitizedConfigBase || '/api';

export const API_BASE = activeBase;

const TOKEN_KEY = 'kloth_token';
const REQUEST_TIMEOUT_MS = 3500;

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (token) => {
  try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ }
};

// The root component registers a function here that logs the user out
// whenever the server answers "401 - your session is invalid or expired".
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export async function api(path, { method = 'GET', body, timeoutMs } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const payload = body ? JSON.stringify(body) : undefined;
  const timeoutLimit = timeoutMs || REQUEST_TIMEOUT_MS;

  // Build candidate URL bases in priority order:
  // In local development: activeBase -> /api -> 127.0.0.1:5000 -> localhost:5000 -> CONFIGURED_BASE
  // In production deployment: activeBase -> /api -> relative origin /api -> remote CONFIGURED_BASE (never localhost)
  const candidates = isLocal
    ? [
        activeBase,
        '/api',
        'http://127.0.0.1:5000/api',
        sanitizedConfigBase,
      ].filter(Boolean).filter((v, idx, arr) => arr.indexOf(v) === idx)
    : [
        activeBase,
        '/api',
        isBrowser ? `${window.location.origin}/api` : null,
        sanitizedConfigBase,
      ].filter(Boolean).filter((v, idx, arr) => arr.indexOf(v) === idx);

  let res = null;
  let networkError = null;

  for (const base of candidates) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutLimit);
    try {
      res = await fetch(base + path, {
        method,
        headers,
        body: payload,
        signal: controller.signal,
      });
      clearTimeout(timer);
      // Connection reached and server responded! Remember this working base.
      activeBase = base;
      break;
    } catch (e) {
      clearTimeout(timer);
      networkError = e;
      if (e.name === 'AbortError') break;
    }
  }

  if (!res) {
    const err = new Error(
      networkError?.name === 'AbortError'
        ? 'The server took too long to respond. Please check your connection and try again.'
        : 'Cannot reach the server. Make sure the API server is running on port 5000.'
    );
    err.status = 0;
    throw err;
  }

  const data = await res.json().catch(() => ({}));

  const isAuthCall =
    path === '/auth/login' ||
    path === '/auth/register' ||
    path === '/auth/admin-login' ||
    path === '/auth/admin-setup' ||
    path === '/auth/admin-set-password' ||
    path === '/auth/reset-password';
  if (res.status === 401 && token && !isAuthCall) onUnauthorized();

  // If the server answered with an HTML page or empty object on an auth endpoint
  if (isAuthCall && (!data || (!data.user && !data.error && !data.token))) {
    const err = new Error('API server unavailable - switching to resilient auth');
    err.status = 503;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
