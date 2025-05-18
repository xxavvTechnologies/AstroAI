import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ComponentPropsWithoutRef } from 'react';
import ExternalLinkModal from './ExternalLinkModal';
import SearchResults from './SearchResults';
import SearchIndicator from './SearchIndicator';
import Canvas from './Canvas';
import { extractCanvasContent, replaceCanvasMarkers, CanvasMatch } from '../utils/canvasUtils';

interface MessageContentProps {
  content: string;
  isLoading?: boolean;
  isSearching?: boolean;
  searchResults?: Array<{title: string; link: string; snippet: string}>;
  messageId?: string;
  onCanvasUpdate?: (messageId: string, canvasId: string, newContent: string, prompt?: string) => Promise<void>;
}

const MessageContent: React.FC<MessageContentProps> = ({ 
  content, 
  isLoading, 
  isSearching, 
  searchResults,
  messageId = '',
  onCanvasUpdate
}) => {
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [canvasMatches, setCanvasMatches] = useState<CanvasMatch[]>([]);
  const [processedContent, setProcessedContent] = useState(content);
  const [openCanvasId, setOpenCanvasId] = useState<string | null>(null);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url = e.currentTarget.href;
    setModalUrl(url);
  };

  const handleContinue = () => {
    if (modalUrl) {
      window.open(modalUrl, '_blank', 'noopener,noreferrer');
      setModalUrl(null);
    }
  };
  
  // Process canvas content
  useEffect(() => {
    // Check for canvas markers and extract content
    const matches = extractCanvasContent(content);
    setCanvasMatches(matches);
    
    // Replace canvas markers with placeholders for rendering
    if (matches.length > 0) {
      const newContent = replaceCanvasMarkers(content, matches);
      setProcessedContent(newContent);
    } else {
      setProcessedContent(content);
    }
  }, [content]);
  
  const handleCanvasUpdate = async (canvasId: string, newContent: string, prompt?: string) => {
    if (!messageId || !onCanvasUpdate) return;
    await onCanvasUpdate(messageId, canvasId, newContent, prompt);
  };
  
  // Render a canvas component
  const renderCanvas = (canvasId: string) => {
    const match = canvasMatches.find(m => m.id === canvasId);
    if (!match) return null;
    
    return (
      <Canvas
        key={canvasId}
        id={canvasId}
        content={match.content}
        onUpdate={(id, content, prompt) => handleCanvasUpdate(id, content, prompt)}
        onClose={() => setOpenCanvasId(null)}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex space-x-2">
        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    );
  }

  // Custom component to render canvas markers and replace them with buttons
  const CanvasMarkerRenderer = ({ value }: { value: string }) => {
    // Check if this is a canvas marker
    const canvasRegex = /\{%canvas:(canvas-[\w-]+)%\}/;
    const match = value.match(canvasRegex);
    
    if (match && match[1]) {
      const canvasId = match[1];
      const canvasMatch = canvasMatches.find(m => m.id === canvasId);
      
      if (!canvasMatch) return <>{value}</>;
      
      // If this canvas is open, render the canvas component
      if (openCanvasId === canvasId) {
        return renderCanvas(canvasId);
      }
      
      // Otherwise render a button to open the canvas
      return (
        <div className="my-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 dark:bg-indigo-900 w-6 h-6 rounded-md flex items-center justify-center">
                <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Canvas Content</span>
            </div>
            <button
              onClick={() => setOpenCanvasId(canvasId)}
              className="text-xs bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
            >
              Edit & Interact
            </button>
          </div>
          <div className="mt-2 overflow-hidden text-sm text-gray-600 dark:text-gray-400">
            <div className="line-clamp-2">
              {canvasMatch.content}
            </div>
          </div>
        </div>
      );
    }
    
    return <>{value}</>;
  };

  return (
    <>
      <div className="prose dark:prose-invert max-w-none">
        {/* Split content by canvas markers and process each segment */}
        {processedContent.split(/(\{%canvas:canvas-[\w-]+%\})/).map((segment, index) => {
          if (segment.match(/\{%canvas:canvas-[\w-]+%\}/)) {
            return <CanvasMarkerRenderer key={index} value={segment} />;
          } 
          return (
            <ReactMarkdown
              key={index}
              components={{
                code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  
                  return isInline ? (
                    <code {...props}>
                      {children}
                    </code>
                  ) : (
                    <SyntaxHighlighter
                      style={atomDark}
                      language={(match && match[1]) || 'text'}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                },
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    onClick={handleLinkClick}
                    className="text-[#9e00ff] hover:text-[#8300d4] cursor-pointer"
                  />
                ),
              }}
            >
              {segment}
            </ReactMarkdown>
          );
        })}
      </div>
      <SearchIndicator isSearching={!!isSearching} />
      {searchResults && <SearchResults results={searchResults} />}
      <ExternalLinkModal
        isOpen={!!modalUrl}
        onClose={() => setModalUrl(null)}
        url={modalUrl || ''}
        onContinue={handleContinue}
      />
    </>
  );
};

export default MessageContent;
