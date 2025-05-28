import React, { createContext, useContext, useState, useEffect } from 'react';

type AnimationContextType = {
  isAnimationsEnabled: boolean;
  toggleAnimations: () => void;
  animationSpeed: 'slow' | 'normal' | 'fast';
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
};

const AnimationContext = createContext<AnimationContextType>({
  isAnimationsEnabled: true,
  toggleAnimations: () => {},
  animationSpeed: 'normal',
  setAnimationSpeed: () => {},
});

export const AnimationProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAnimationsEnabled, setIsAnimationsEnabled] = useState(() => {
    const saved = localStorage.getItem('animationsEnabled');
    // Check for system preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return saved ? JSON.parse(saved) : !prefersReducedMotion;
  });

  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>(() => {
    const saved = localStorage.getItem('animationSpeed');
    return saved ? (saved as 'slow' | 'normal' | 'fast') : 'normal';
  });

  useEffect(() => {
    localStorage.setItem('animationsEnabled', JSON.stringify(isAnimationsEnabled));
    
    // Add/remove animation class to document
    if (isAnimationsEnabled) {
      document.documentElement.classList.add('animations-enabled');
      document.documentElement.classList.remove('animations-disabled');
    } else {
      document.documentElement.classList.add('animations-disabled');
      document.documentElement.classList.remove('animations-enabled');
    }
    
    // Set animation speed class
    document.documentElement.classList.remove('animation-slow', 'animation-normal', 'animation-fast');
    document.documentElement.classList.add(`animation-${animationSpeed}`);
  }, [isAnimationsEnabled, animationSpeed]);

  useEffect(() => {
    localStorage.setItem('animationSpeed', animationSpeed);
  }, [animationSpeed]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && isAnimationsEnabled) {
        setIsAnimationsEnabled(false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isAnimationsEnabled]);

  const toggleAnimations = () => setIsAnimationsEnabled(!isAnimationsEnabled);

  return (
    <AnimationContext.Provider value={{ 
      isAnimationsEnabled, 
      toggleAnimations, 
      animationSpeed, 
      setAnimationSpeed 
    }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};
