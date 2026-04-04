import React, { useState } from 'react';

const InteractiveCard = ({ 
  children, 
  className = '',
  tiltIntensity = 8,
  hoverScale = 1.02 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePosition({ x, y });
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: '#E0E5EC',
        boxShadow: isHovered
          ? '14px 14px 28px rgba(163,177,198,0.7), -14px -14px 28px rgba(255,255,255,0.6)'
          : '8px 8px 16px rgba(163,177,198,0.7), -8px -8px 16px rgba(255,255,255,0.6)',
        borderRadius: '24px',
        transition: 'all 300ms ease-out',
        transform: isHovered
          ? `perspective(1000px) rotateX(${-mousePosition.y * tiltIntensity}deg) rotateY(${mousePosition.x * tiltIntensity}deg) scale(${hoverScale}) translateY(-4px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)',
        cursor: 'pointer',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
    >
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default InteractiveCard;