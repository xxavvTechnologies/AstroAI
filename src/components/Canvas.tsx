import React, { useState, useRef } from 'react';
import { Edit, Copy, Download, X, RefreshCw, Undo } from 'lucide-react';
import './Canvas.css';

interface CanvasProps {
  content: string;
  id: string;
  onUpdate: (id: string, content: string, prompt?: string) => Promise<void>;
  onClose: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ content, id, onUpdate, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const [canvasContent, setCanvasContent] = useState(content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [originalContent, setOriginalContent] = useState(content);

  const handleEdit = () => {
    setEditMode(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(canvasContent.length, canvasContent.length);
      }
    }, 0);
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(id, canvasContent);
      setOriginalContent(canvasContent);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update canvas:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setCanvasContent(originalContent);
    setEditMode(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(canvasContent);
  };

  const handleDownload = () => {
    const blob = new Blob([canvasContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astro-canvas-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdatePrompt = async () => {
    if (!userPrompt.trim()) return;

    setIsUpdating(true);
    try {
      await onUpdate(id, canvasContent, userPrompt);
      setUserPrompt('');
    } catch (error) {
      console.error('Failed to update canvas with prompt:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRestore = () => {
    setCanvasContent(originalContent);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-full max-w-3xl mx-auto my-4">
      {/* Canvas Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 dark:bg-indigo-900 w-6 h-6 rounded-md flex items-center justify-center">
            <Edit size={14} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Astro Canvas</span>
        </div>
        
        <div className="flex items-center gap-2">
          {!editMode ? (
            <>
              <button 
                onClick={handleCopy} 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                title="Copy content"
              >
                <Copy size={14} className="text-gray-500 dark:text-gray-400" />
              </button>
              <button 
                onClick={handleDownload} 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                title="Download content"
              >
                <Download size={14} className="text-gray-500 dark:text-gray-400" />
              </button>
              <button 
                onClick={handleEdit} 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                title="Edit content"
              >
                <Edit size={14} className="text-gray-500 dark:text-gray-400" />
              </button>
              <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                title="Close canvas"
              >
                <X size={14} className="text-gray-500 dark:text-gray-400" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleCancel} 
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded transition-colors flex items-center gap-1"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
              <button 
                onClick={handleRestore} 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                title="Restore to original"
              >
                <Undo size={14} className="text-gray-500 dark:text-gray-400" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Canvas Content */}
      <div className="p-4">
        {editMode ? (
          <textarea 
            ref={textareaRef}
            className="w-full min-h-[200px] p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={canvasContent}
            onChange={(e) => setCanvasContent(e.target.value)}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
            {canvasContent}
          </pre>
        )}
      </div>

      {/* Canvas Footer - Prompt for updates */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Ask Astro to modify or improve this canvas..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleUpdatePrompt();
              }
            }}
          />
          <button 
            className="px-3 py-1 bg-[#9e00ff] hover:bg-[#8300d4] text-white rounded transition-colors flex items-center gap-1"
            onClick={handleUpdatePrompt}
            disabled={isUpdating || !userPrompt.trim()}
          >
            {isUpdating ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Update</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
