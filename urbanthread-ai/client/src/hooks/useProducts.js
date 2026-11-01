import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts.js';

// Loads the catalogue from the API (MongoDB) with resilient client-side fallback
export default function useProducts() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [status, setStatus] = useState('ready');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api('/products')
      .then((d) => {
        if (cancelled) return;
        if (Array.isArray(d) && d.length > 0) {
          setProducts(d);
        } else if (!products || products.length === 0) {
          setProducts(FALLBACK_PRODUCTS);
        }
        setStatus('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        if (!products || products.length === 0) {
          setProducts(FALLBACK_PRODUCTS);
        }
        setStatus('ready');
      });
    return () => { cancelled = true; };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { products, status, error, reload };
}
