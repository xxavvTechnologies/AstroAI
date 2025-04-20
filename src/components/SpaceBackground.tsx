import React from 'react';
import './SpaceBackground.css';

const SpaceBackground: React.FC = () => {
  return (
    <div className="space-background absolute inset-0">
      <div className="stars"></div>
      <div className="twinkling"></div>
    </div>
  );
};

export default SpaceBackground;
