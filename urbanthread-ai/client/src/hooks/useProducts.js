import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

// Loads the catalogue from the API (MongoDB). status: 'loading' | 'ready' | 'error'
export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    api('/products')
      .then((d) => {
        if (cancelled) return;
        setProducts(Array.isArray(d) ? d : []);
        setStatus('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setStatus('error');
      });
    return () => { cancelled = true; };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { products, status, error, reload };
}
