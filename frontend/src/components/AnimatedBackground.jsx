import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      {/* Solid neumorphic base */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#E0E5EC' }}
      />

      {/* Subtle extruded decorative shapes */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-neu-float-slow"
          style={{
            width: `${150 + i * 60}px`,
            height: `${150 + i * 60}px`,
            borderRadius: '50%',
            backgroundColor: '#E0E5EC',
            boxShadow: '12px 12px 24px rgba(163,177,198,0.4), -12px -12px 24px rgba(255,255,255,0.3)',
            left: `${5 + i * 22}%`,
            top: `${15 + i * 18}%`,
            opacity: 0.25,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${12 + i * 3}s`,
          }}
        />
      ))}

      {/* Subtle inset circles */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`inset-${i}`}
          className="absolute animate-neu-float"
          style={{
            width: `${80 + i * 40}px`,
            height: `${80 + i * 40}px`,
            borderRadius: '50%',
            backgroundColor: '#E0E5EC',
            boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.3)',
            right: `${10 + i * 20}%`,
            bottom: `${10 + i * 15}%`,
            opacity: 0.2,
            animationDelay: `${i * 2}s`,
            animationDuration: `${10 + i * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;