import React from 'react';
// Adding empty export to make TypeScript treat this as a module
export {};

interface EditMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
}

const EditMessageModal: React.FC<EditMessageModalProps> = ({ 
  isOpen, 
  onClose, 
  content, 
  onContentChange, 
  onSave 
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold dark:text-white">Edit Message</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Editing this message will restart the conversation from this point.
              All subsequent messages will be removed.
            </p>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full h-40 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Edit your message..."
            />
          </div>

          <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 rounded-md bg-[#9e00ff] text-white hover:bg-[#8300d4] transition-colors"
            >
              Save & Continue from here
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditMessageModal;
