import React, { useEffect, useState } from 'react';
import './SpaceBackground.css';

const SpaceBackground: React.FC = () => {
  const [shootingStars, setShootingStars] = useState<JSX.Element[]>([]);
  
  useEffect(() => {
    // Create occasional shooting stars
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        createShootingStar();
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  const createShootingStar = () => {
    const top = Math.random() * window.innerHeight * 0.6;
    const left = Math.random() * window.innerWidth * 0.6;
    const angle = Math.random() * 45;
    const duration = 3 + Math.random() * 4;
    
    const star = (
      <div 
        className="shooting-star" 
        key={`star-${Date.now()}`}
        style={{
          top: `${top}px`,
          left: `${left}px`,
          transform: `rotate(${angle}deg)`,
          animation: `shoot ${duration}s linear forwards`
        }}
      />
    );
    
    setShootingStars(prev => [...prev, star]);
    
    // Remove star from DOM after animation
    setTimeout(() => {
      setShootingStars(prev => prev.filter(s => s !== star));
    }, duration * 1000);
  };
  
  return (
    <div className="space-background absolute inset-0">
      <div className="stars"></div>
      <div className="twinkling"></div>
      {shootingStars}
    </div>
  );
};

export default SpaceBackground;
