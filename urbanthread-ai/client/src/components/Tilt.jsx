import React, { useState } from 'react';

/* 3D tilt effect: the card rotates in 3D following the mouse */
export default function Tilt({ className, children }) {
  const [style, setStyle] = useState({});
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setStyle({
      transform: `perspective(800px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg) scale(1.04)`,
      transition: 'transform .1s ease-out',
      transformStyle: 'preserve-3d',
    });
  };
  const leave = () =>
    setStyle({
      transform: 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)',
      transition: 'transform .5s ease',
      transformStyle: 'preserve-3d',
    });
  return (
    <div className={className} style={style} onMouseMove={move} onMouseLeave={leave}>
      {children}
    </div>
  );
}
