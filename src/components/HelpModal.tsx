import React from 'react';
import { X, MessageCircle, BookOpen, MessagesSquare } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const resources = [
    {
      title: 'Community Forums',
      description: 'Get help from the Nova Suite community',
      icon: <MessageCircle size={20} />,
      url: 'https://forums.novasuite.one'
    },
    {
      title: 'Help Center',
      description: 'Browse our documentation and guides',
      icon: <BookOpen size={20} />,
      url: 'https://tech.xxavvgroup.com/helpcenter'
    },
    {
      title: 'Discord Server',
      description: 'Join our Discord community',
      icon: <MessagesSquare size={20} />,
      url: 'https://discord.com/invite/kVkm8tTtJ2'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 p-6 shadow-xl relative animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-space text-gray-900 dark:text-white">Help & Support</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="text-gray-500 dark:text-gray-400 group-hover:text-[#9e00ff] transition-colors">
                  {resource.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-[#9e00ff] transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {resource.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
