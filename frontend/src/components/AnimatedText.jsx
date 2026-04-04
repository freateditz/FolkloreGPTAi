import React, { useState, useEffect } from 'react';

const AnimatedText = ({ 
  text, 
  className = '', 
  animation = 'typewriter',
  speed = 80,
  delay = 0 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    if (animation === 'typewriter') {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayedText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }, speed);
        return () => clearTimeout(timer);
      }
    } else {
      setDisplayedText(text);
    }
  }, [currentIndex, text, speed, animation, isVisible]);

  const baseTextStyle = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#2D3748',
    transition: 'all 300ms ease-out',
  };

  if (animation === 'splitWords') {
    return (
      <div className={className} style={baseTextStyle}>
        {text.split(' ').map((word, index) => (
          <span
            key={index}
            style={{
              display: 'inline-block',
              transition: 'all 700ms ease-out',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
              transitionDelay: `${delay + index * 100}ms`,
            }}
          >
            {word}&nbsp;
          </span>
        ))}
      </div>
    );
  }

  if (animation === 'splitChars') {
    return (
      <div className={className} style={baseTextStyle}>
        {text.split('').map((char, index) => (
          <span
            key={index}
            style={{
              display: 'inline-block',
              transition: 'all 500ms ease-out',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
              transitionDelay: `${delay + index * 40}ms`,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    );
  }

  const getAnimationStyle = () => {
    if (!isVisible) return { opacity: 0, transform: 'translateY(20px)' };

    return {
      opacity: 1,
      transform: 'translateY(0)',
    };
  };

  return (
    <div
      className={className}
      style={{
        ...baseTextStyle,
        ...getAnimationStyle(),
        transition: 'all 600ms ease-out',
      }}
    >
      {displayedText}
      {animation === 'typewriter' && currentIndex < text.length && (
        <span
          style={{
            display: 'inline-block',
            width: '2px',
            height: '1em',
            backgroundColor: '#6C63FF',
            marginLeft: '2px',
            animation: 'neu-breathe 1s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
};

export default AnimatedText;