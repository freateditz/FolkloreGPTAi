import React from 'react';

const FloatingElements = () => {
  // Subtle neumorphic floating shapes — no colored icons, just shadow orbs
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Small floating extruded dots */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`dot-${i}`}
          className="absolute"
          style={{
            width: `${12 + i * 4}px`,
            height: `${12 + i * 4}px`,
            borderRadius: '50%',
            backgroundColor: '#E0E5EC',
            boxShadow: '3px 3px 6px rgba(163,177,198,0.5), -3px -3px 6px rgba(255,255,255,0.4)',
            left: `${8 + i * 16}%`,
            top: `${25 + i * 10}%`,
            opacity: 0.35,
            animation: `neu-float ${6 + i * 1.5}s ease-in-out ${i * 0.8}s infinite`,
          }}
        />
      ))}

      {/* Small floating inset dots */}
      {[...Array(4)].map((_, i) => (
        <div
          key={`inset-dot-${i}`}
          className="absolute"
          style={{
            width: `${10 + i * 3}px`,
            height: `${10 + i * 3}px`,
            borderRadius: '50%',
            backgroundColor: '#E0E5EC',
            boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.5), inset -2px -2px 4px rgba(255,255,255,0.4)',
            right: `${10 + i * 18}%`,
            bottom: `${20 + i * 14}%`,
            opacity: 0.3,
            animation: `neu-float-slow ${8 + i * 2}s ease-in-out ${i * 1.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;