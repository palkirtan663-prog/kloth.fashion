import { useCallback, useEffect, useState } from 'react';
import { api, getToken, setToken, setUnauthorizedHandler } from '../services/api.js';

// Owns the login session: restores it from the saved token on page load,
// and logs out automatically when the server says the token is invalid or expired.
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => !!getToken());
  const [notice, setNotice] = useState('');

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
      setNotice('Your session has expired. Please log in again.');
    });
    if (!getToken()) return undefined;

    let cancelled = false;
    api('/auth/me')
      .then((d) => { if (!cancelled) setUser(d.user); })
      .catch((e) => {
        if (cancelled) return;
        // 401 already cleared the token via the handler; for network/server errors keep the token
        // so the session can be restored once the API is back.
        if (e.status !== 401) setNotice(e.message);
      })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, []);

  const handleAuth = useCallback(({ token, user: u }) => {
    setToken(token);
    setNotice('');
    setUser(u);
  }, []);

  return { user, checking, notice, handleAuth, logout };
}
