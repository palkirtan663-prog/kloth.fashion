import React, { useState, useRef, useEffect } from 'react';

/**
 * Enhanced 3D Tilt & Continuous Rotation Showcase component
 * - Ambient continuous 3D floating rotation when idle (attracts customer eye)
 * - Real-time responsive 3D cursor tilt with depth on mousemove
 * - 360-degree interactive spin on click
 * - Realistic specular lighting / sheen coordination
 */
export default function Tilt({
  className = '',
  children,
  autoRotate = false,
  maxTilt = 20,
  perspective = 1100,
  onClick,
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [interactiveStyle, setInteractiveStyle] = useState({});
  const [spinDegree, setSpinDegree] = useState(0);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    setIsHovered(true);
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotY = (x * maxTilt * 2).toFixed(2);
    const rotX = (-y * maxTilt * 2).toFixed(2);
    const sheenX = ((x + 0.5) * 100).toFixed(1);
    const sheenY = ((y + 0.5) * 100).toFixed(1);

    setInteractiveStyle({
      transform: `perspective(${perspective}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale3d(1.04, 1.04, 1.04)`,
      transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
      '--sheenX': `${sheenX}%`,
      '--sheenY': `${sheenY}%`,
      '--rotY': `${rotY}deg`,
      '--rotX': `${rotX}deg`,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setInteractiveStyle({
      transform: `perspective(${perspective}px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      '--sheenX': '50%',
      '--sheenY': '50%',
    });
  };

  // 360 Interactive spin capability
  const trigger360Spin = (e) => {
    const nextSpin = spinDegree + 360;
    setSpinDegree(nextSpin);
    setInteractiveStyle({
      transform: `perspective(${perspective}px) rotateY(${nextSpin}deg) scale3d(1.04, 1.04, 1.04)`,
      transition: 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
      '--sheenX': '60%',
      '--sheenY': '40%',
    });
    if (onClick) onClick(e);
  };

  // Combine classes based on auto-rotation mode
  const dynamicClasses = [
    className,
    autoRotate ? 'hero3DAutoRotate' : '',
    isHovered ? 'hero3DIsHovered' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const mergedStyle = {
    transformStyle: 'preserve-3d',
    ...interactiveStyle,
  };

  return (
    <div
      ref={containerRef}
      className={dynamicClasses}
      style={mergedStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={trigger360Spin}
      role="region"
      aria-label="3D Interactive Showcase"
    >
      {children}
    </div>
  );
}
