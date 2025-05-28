import React from 'react';
import { X, Download, Zap, Gauge, Eye, EyeOff } from 'lucide-react';
import { exportChatData } from '../utils/exportData';
import { useAnimation } from '../context/AnimationContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { isAnimationsEnabled, toggleAnimations, animationSpeed, setAnimationSpeed } = useAnimation();
  
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
      isAnimationsEnabled ? 'animate-fade-in' : ''
    }`}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 p-6 shadow-xl relative ${
        isAnimationsEnabled ? 'animate-modal-in' : ''
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-space text-gray-900 dark:text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>        <div className="space-y-6">
          {/* Animation Settings */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap size={16} className="text-purple-500" />
              Animation Settings
            </h3>
            
            {/* Animation Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isAnimationsEnabled ? (
                    <Eye size={16} className="text-green-500" />
                  ) : (
                    <EyeOff size={16} className="text-gray-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable Animations
                  </span>
                </div>
                <button
                  onClick={toggleAnimations}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    isAnimationsEnabled 
                      ? 'bg-purple-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      isAnimationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Toggle smooth animations and transitions throughout the app
              </p>
              
              {/* Animation Speed */}
              {isAnimationsEnabled && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Gauge size={16} className="text-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Animation Speed
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {(['slow', 'normal', 'fast'] as const).map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setAnimationSpeed(speed)}
                        className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 ${
                          animationSpeed === speed
                            ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {speed.charAt(0).toUpperCase() + speed.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Adjust the speed of animations and transitions
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
            <button
              onClick={exportChatData}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#9e00ff] hover:bg-[#8300d4] text-white rounded-lg transition-colors"
            >
              <Download size={16} />
              Export Chat Data
            </button>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Download all your conversation history and usage data
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Preferences</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              More settings coming soon...
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">About</h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
              <p>Version 3.2.0 (Beta)</p>
              <p>Powered by ModelA 8-Pro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
