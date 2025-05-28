import React from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useAnimation } from '../context/AnimationContext';
import './animations.css';

interface ModeChangeIndicatorProps {
  message: string;
  onClose?: () => void;
}

const ModeChangeIndicator: React.FC<ModeChangeIndicatorProps> = ({ message, onClose }) => {
  const { isAnimationsEnabled } = useAnimation();

  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
        bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full 
        shadow-lg backdrop-blur-sm border border-white/20
        ${isAnimationsEnabled ? 'animate-slide-down animate-pulse-glow' : ''}
        max-w-md mx-auto text-center`}
    >
      <div className="flex items-center justify-center space-x-2">
        <RefreshCw className={`w-4 h-4 ${isAnimationsEnabled ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">{message}</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
};

export default ModeChangeIndicator;
