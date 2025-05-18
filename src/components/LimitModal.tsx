import React from 'react';
import { Clock, X } from 'lucide-react';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LimitModal: React.FC<LimitModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 p-6 shadow-xl relative animate-slide-in">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold font-space text-gray-900 dark:text-white">Daily Limit Reached</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm">
            You've reached your daily character limit. Your limit will reset at midnight UTC. Come back tomorrow for more conversations with Astro!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LimitModal;
