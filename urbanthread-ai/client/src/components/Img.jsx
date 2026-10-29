import React, { useEffect, useState } from 'react';

/*
  Photo with lazy loading and a graceful fallback.
  If the file is missing or fails to load, a labelled tile is shown instead of a broken-image icon.
  Use eager for above-the-fold images (hero).
*/
export default function Img({ src, alt, label, sublabel, eager = false, width = 800, height = 1000 }) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => { setFailed(!src); }, [src]);

  if (failed) {
    return (
      <div className="imgFallback" role="img" aria-label={alt || label || 'Image unavailable'}>
        <b>{label || 'KLOTH.FASHION'}</b>

        {sublabel && <small>{sublabel}</small>}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt || ''}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
