import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ExternalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  onContinue: () => void;
}

const ExternalLinkModal: React.FC<ExternalLinkModalProps> = ({ isOpen, onClose, url, onContinue }) => {
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
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold font-space text-gray-900 dark:text-white">External Link Warning</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You are about to visit an external website. Astro cannot verify the safety of external links.
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 w-full break-all">
            <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">{url}</span>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Go back
            </button>
            <button
              onClick={onContinue}
              className="px-4 py-2 rounded-lg bg-[#9e00ff] hover:bg-[#8300d4] text-white transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalLinkModal;
