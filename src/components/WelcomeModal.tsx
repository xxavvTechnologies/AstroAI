import React from 'react';
import { X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <img src="https://d2zcpib8duehag.cloudfront.net/Astro.png" alt="Astro" className="w-8 h-8" />
            <h2 className="text-xl font-bold font-space text-gray-900 dark:text-white">Welcome to Astro</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4 text-gray-600 dark:text-gray-300 font-jakarta">
          <p>
            Welcome to the public beta of Astro! As we continue to improve and enhance the platform, please note that features are subject to change and new capabilities may be added at any time.
          </p>
          <p>
            If you experience any issues with Astro's responsiveness, please check our system status at{' '}
            <a 
              href="https://novasuite.one/status" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#9e00ff] hover:underline"
            >
              novasuite.one/status
            </a>
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#9e00ff] hover:bg-[#8300d4] text-white rounded-lg p-3 font-medium transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
