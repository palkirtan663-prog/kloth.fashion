import React, { useEffect, useState } from 'react';

/*
  Photo with lazy loading, dual-fallback resilience, and graceful failure handling.
  If the primary file is missing or blocked by network, it attempts fallbackSrc,
  then gracefully displays a luxury metallic card fallback without collapsing layout.
*/
export default function Img({
  src,
  fallbackSrc = '',
  alt = '',
  label = 'KLOTH.FASHION',
  sublabel = '',
  eager = false,
  width = 800,
  height = 1000,
  className = '',
}) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc || '');
  const [failed, setFailed] = useState(!src && !fallbackSrc);
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc || '');
    setFailed(!src && !fallbackSrc);
    setTriedFallback(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (fallbackSrc && !triedFallback && currentSrc !== fallbackSrc) {
      setTriedFallback(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setFailed(true);
    }
  };

  if (failed || !currentSrc) {
    return (
      <div className={`imgFallback ${className}`} role="img" aria-label={alt || label || 'Image unavailable'}>
        <div className="imgFallbackContent">
          <span className="imgFallbackAtelierBadge">EST. 2026 · ATELIER</span>
          <b>{label}</b>
          {sublabel && <small>{sublabel}</small>}
          <span className="imgFallbackWatermark">KLOTH.FASHION</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || label || 'Fashion piece'}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
      className={className}
      onError={handleError}
    />
  );
}
