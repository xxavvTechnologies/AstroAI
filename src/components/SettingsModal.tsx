import React from 'react';
import { X, Download } from 'lucide-react';
import { exportChatData } from '../utils/exportData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 p-6 shadow-xl relative animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-space text-gray-900 dark:text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
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
              <p>Version 3.1.0 (Beta)</p>
              <p>Powered by ModelA 8-Pro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
