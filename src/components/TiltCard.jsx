import React, { useRef, useState } from 'react';

// Added 'onClick' to the props!
const TiltCard = ({ children, className = "", onClick }) => {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -2;
    const rotateY = ((x - centerX) / centerX) * 2;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`,
      '--mouse-x': `${x}px`,
      '--mouse-y': `${y}px`
    });
  };

  const handleMouseLeave = () => {
    setStyle({ transform: 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)' });
  };

  return (
    <div 
      ref={cardRef} 
      className={`interactive-card ${className}`} 
      style={{ ...style, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick} /* Passed the onClick handler here */
    >
      {children}
    </div>
  );
};

export default TiltCard;