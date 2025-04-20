import React from 'react';
import { Brain, Lock, X } from 'lucide-react';

interface ModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModelsModal: React.FC<ModelsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full mx-4 p-6 shadow-xl relative animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-[#9e00ff]" />
            <h2 className="text-xl font-bold font-space text-gray-900 dark:text-white">NovaAI Models</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 text-xs font-medium bg-[#9e00ff] text-white rounded-full">Current</span>
              <h3 className="text-lg font-semibold font-space text-gray-900 dark:text-white">ModelA 8</h3>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400 font-jakarta">
              Our latest and most capable model, powering all of Astro's current capabilities. 
              ModelA 8 excels at understanding context, generating human-like responses, and 
              maintaining coherent long-form conversations.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-semibold font-space text-gray-400 dark:text-gray-500">Future Models</h3>
            </div>
            <p className="mt-2 text-gray-500 dark:text-gray-400 font-jakarta">
              More models are currently in development and will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelsModal;
