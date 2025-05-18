import React, { useState, useEffect } from 'react';
import { X, PanelTopOpen } from 'lucide-react';

interface FeatureTipProps {
  feature: 'canvas' | 'messageActions';
  onDismiss: () => void;
}

const FeatureTip: React.FC<FeatureTipProps> = ({ feature, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Show after a short delay
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    
    return () => clearTimeout(timeout);
  }, []);
  
  const handleDismiss = () => {
    setIsVisible(false);
    // Let animation complete before removing from DOM
    setTimeout(onDismiss, 300);
  };
  
  if (!isVisible) return null;
  
  // Feature-specific content
  const getContent = () => {
    switch (feature) {
      case 'canvas':
        return {
          title: 'New Canvas Feature',
          description: 'Astro can now create interactive canvas content. Look for the "Edit & Interact" button in Astro\'s responses.',
          icon: <PanelTopOpen size={20} className="text-indigo-500" />
        };
      case 'messageActions':
        return {
          title: 'Message Actions',
          description: 'Hover over Astro\'s messages to copy, retry, or provide feedback.',
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        };
      default:
        return {
          title: 'New Feature',
          description: 'Check out this new feature in Astro v3.1.0!',
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        };
    }
  };
  
  const content = getContent();
  
  return (
    <div 
      className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs transition-all duration-300 ease-out z-50 border border-gray-200 dark:border-gray-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {content.icon}
          <h3 className="font-medium text-gray-800 dark:text-gray-200">{content.title}</h3>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={16} />
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {content.description}
      </p>
      <div className="mt-3 flex justify-end">
        <button 
          onClick={handleDismiss} 
          className="text-xs bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-800/70 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default FeatureTip;
