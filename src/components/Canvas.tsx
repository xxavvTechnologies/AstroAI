import React, { useState, useRef, useEffect } from 'react';
import { Edit, Copy, Download, X, RefreshCw, Undo, Sparkles, Code, FileText, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showPrompt, setShowPrompt] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [originalContent, setOriginalContent] = useState(content);
  const [canvasType, setCanvasType] = useState<'code' | 'text' | 'data'>('text');

  useEffect(() => {
    // Auto-detect content type
    if (content.includes('```') || content.includes('function') || content.includes('class ') || content.includes('import ')) {
      setCanvasType('code');
    } else if (content.includes('|') && content.includes('-') && content.split('\n').length > 3) {
      setCanvasType('data');
    } else {
      setCanvasType('text');
    }
  }, [content]);

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
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(canvasContent);
      // Add visual feedback here if desired
    } catch (error) {
      console.error('Failed to copy:', error);
    }
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
  const getCanvasIcon = () => {
    switch (canvasType) {
      case 'code': return <Code size={16} className="text-blue-500" />;
      case 'data': return <FileText size={16} className="text-green-500" />;
      default: return <Edit size={16} className="text-purple-500" />;
    }
  };
  const getCanvasTypeLabel = () => {
    switch (canvasType) {
      case 'code': return 'Code Canvas';
      case 'data': return 'Data Canvas';
      default: return 'Text Canvas';
    }
  };

  const getPreviewText = () => {
    if (isExpanded) return canvasContent;
    
    const lines = canvasContent.split('\n');
    if (lines.length <= 4) return canvasContent;
    
    return lines.slice(0, 4).join('\n') + '\n...';
  };

  const shouldShowExpandButton = () => {
    const lines = canvasContent.split('\n');
    return lines.length > 4 || canvasContent.length > 300;
  };

  return (
    <div className="canvas-container bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl backdrop-blur-sm">
      {/* Enhanced Header */}
      <div className="canvas-header bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="canvas-icon-container bg-white dark:bg-gray-700 rounded-lg p-2 shadow-sm">
            {getCanvasIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
              {getCanvasTypeLabel()}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Interactive • Editable • AI-Enhanced
            </p>
          </div>
        </div>        
        <div className="flex items-center gap-1">
          {!editMode ? (
            <>
              <button 
                onClick={handleCopy} 
                className="canvas-action-btn group"
                title="Copy content"
              >
                <Copy size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
              </button>
              <button 
                onClick={handleDownload} 
                className="canvas-action-btn group"
                title="Download content"
              >
                <Download size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-green-500 transition-colors" />
              </button>
              <button 
                onClick={handleEdit} 
                className="canvas-action-btn group"
                title="Edit content"
              >
                <Edit size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-purple-500 transition-colors" />
              </button>
              <button 
                onClick={() => setShowPrompt(!showPrompt)} 
                className="canvas-action-btn group"
                title="AI Enhancement"
              >
                <Sparkles size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-yellow-500 transition-colors" />
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <button 
                onClick={onClose} 
                className="canvas-action-btn group"
                title="Close canvas"
              >
                <X size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleCancel} 
                className="canvas-cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="canvas-save-btn"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
              <button 
                onClick={handleRestore} 
                className="canvas-action-btn group"
                title="Restore to original"
              >
                <Undo size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-orange-500 transition-colors" />
              </button>
            </>
          )}
        </div>      </div>

      {/* Enhanced Content Area */}
      <div className="canvas-content p-6">
        {editMode ? (
          <div className="canvas-editor">
            <textarea 
              ref={textareaRef}
              className="canvas-textarea w-full min-h-[300px] p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y font-mono text-sm leading-relaxed shadow-inner"
              value={canvasContent}
              onChange={(e) => setCanvasContent(e.target.value)}
              placeholder="Enter your content here..."
            />
          </div>        ) : (
          <div className={`canvas-display ${canvasType === 'code' ? 'code-style' : canvasType === 'data' ? 'data-style' : 'text-style'}`}>
            <div className="canvas-preview-container">
              <pre className="canvas-pre whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-x-auto">
                {getPreviewText()}
              </pre>
              
              {shouldShowExpandButton() && (
                <div className="canvas-preview-actions mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50">                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="canvas-expand-btn text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 flex items-center gap-2"
                  >
                    {isExpanded ? (
                      <>
                        <span>Show Less</span>
                        <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        <span>Show More</span>
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                  
                  <div className="canvas-stats text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {canvasContent.split('\n').length} lines • {canvasContent.length} characters
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Enhancement Prompt (Collapsible) */}
      {(showPrompt || editMode) && (
        <div className="canvas-footer bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 border-t border-gray-200/50 dark:border-gray-700/50 p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <input 
                type="text" 
                className="canvas-prompt-input w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="✨ Ask Astro to enhance, modify, or improve this canvas..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleUpdatePrompt();
                  }
                }}
              />
            </div>
            <button 
              className="canvas-update-btn px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={handleUpdatePrompt}
              disabled={isUpdating || !userPrompt.trim()}
            >
              {isUpdating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Enhance</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
