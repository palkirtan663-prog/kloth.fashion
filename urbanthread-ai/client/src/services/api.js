// Talks to the Express API. Stores the login token and attaches it to every request.
// Works seamlessly with Vite's proxy (/api) or direct server URLs with automatic fallback.
const CONFIGURED_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Dynamic base that remembers which candidate succeeded to keep subsequent requests instant
let activeBase = CONFIGURED_BASE || '/api';

export const API_BASE = activeBase;

const TOKEN_KEY = 'kloth_token';
const REQUEST_TIMEOUT_MS = 25000;

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

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const payload = body ? JSON.stringify(body) : undefined;

  // Build candidate URL bases in priority order:
  // 1. Current working activeBase
  // 2. Vite same-origin proxy '/api'
  // 3. Direct IPv4 'http://127.0.0.1:5000/api'
  // 4. Direct 'http://localhost:5000/api'
  const candidates = [
    activeBase,
    '/api',
    'http://127.0.0.1:5000/api',
    'http://localhost:5000/api',
    CONFIGURED_BASE,
  ].filter(Boolean).filter((v, idx, arr) => arr.indexOf(v) === idx);

  let res = null;
  let networkError = null;

  for (const base of candidates) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
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

  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
