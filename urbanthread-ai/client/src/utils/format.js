export const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Descriptive alt text built from the product itself.
export const productAlt = (p) =>
  `${p.name} - ${[p.color, p.category].filter(Boolean).join(' ').toLowerCase()} from Kloth.fashion`;

