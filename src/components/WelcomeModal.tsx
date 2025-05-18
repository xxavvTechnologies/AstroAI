import React from 'react';
import { X, Rocket, Sparkles, Search, PanelTopOpen } from 'lucide-react';
import VersionBadge from './VersionBadge';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestCanvas?: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onTestCanvas }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <img src="https://d2zcpib8duehag.cloudfront.net/Astro.png" alt="Astro" className="w-8 h-8" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-space text-gray-900 dark:text-white">Welcome to Astro</h2>
                <VersionBadge version="3.1.0" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Exploring the cosmos, one question at a time</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4 text-gray-600 dark:text-gray-300 font-jakarta">
          <p>
            Welcome to Astro v3.1.0! We've improved your cosmic AI assistant with enhanced features and a more immersive experience.
          </p>
          
          <div className="mt-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" /> What's new in v3.1.0:
            </h3>
            <ul className="mt-2 space-y-2 ml-5 list-disc">
              <li><strong>New Flagship Model - ModelA 8-Pro</strong> - Our most advanced AI model yet</li>
              <li><strong>New Canvas Feature</strong> - Edit and interact with code and content directly</li>
              <li>Added copy and retry functions to Astro's messages</li>
              <li>Added message editing and conversation rollback</li>
              <li>Added feedback system for improved interactions</li>
              <li>Added new export data feature in settings</li>
              <li>Added conversation modes feature with 6 default options</li>
              <li>Retired ModelA 8</li>
              <li>Minor UI improvements</li>
              <li><strong>Experimental</strong> - Astro Search features powered by Nova Search integration</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <PanelTopOpen size={16} className="text-indigo-500" /> Interactive Canvas Feature:
            </h3>
            <p className="text-sm mt-2">
              The new Canvas feature lets you interact with code and content directly in Astro. 
              When Astro replies with content between double ampersands <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">&&</code>, 
              it will be displayed as an interactive canvas that you can edit, copy, or download.
            </p>
          </div>
          
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

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {onTestCanvas && (
            <button
              onClick={() => {
                onTestCanvas();
                onClose();
              }}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 font-medium transition-colors"
            >
              <PanelTopOpen size={18} />
              <span>Try Canvas Feature</span>
            </button>
          )}
          <button
            onClick={onClose}
            className={`flex-1 bg-[#9e00ff] hover:bg-[#8300d4] text-white rounded-lg p-3 font-medium transition-colors ${onTestCanvas ? '' : 'w-full'}`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
