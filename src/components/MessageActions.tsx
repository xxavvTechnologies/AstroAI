import React, { useState } from 'react';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import './MessageActions.css';

interface MessageActionsProps {
  messageId: string;
  content: string;
  onCopy: () => void;
  onRetry: () => void;
  onFeedback: (messageId: string, isPositive: boolean) => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  content,
  onCopy,
  onRetry,
  onFeedback
}) => {
  const [showFeedbackSent, setShowFeedbackSent] = useState<'positive' | 'negative' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (isPositive: boolean) => {
    onFeedback(messageId, isPositive);
    setShowFeedbackSent(isPositive ? 'positive' : 'negative');
    setTimeout(() => setShowFeedbackSent(null), 3000);
  };

  if (showFeedbackSent) {
    return (
      <div className="absolute -bottom-10 right-2 bg-white dark:bg-gray-800 shadow-md rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 feedback-confirmation z-10">
        {showFeedbackSent === 'positive' ? (
          <>
            <ThumbsUp size={12} className="text-green-500" />
            <span>Thank you for your feedback!</span>
          </>
        ) : (
          <>
            <ThumbsDown size={12} className="text-amber-500" />
            <span>Thank you for your feedback!</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="message-actions">
      <button 
        onClick={handleCopy}
        className="message-action-button"
        aria-label="Copy message"
      >
        <Copy size={14} className={copied ? "text-green-500" : "text-gray-500 dark:text-gray-400"} />
        <span className="action-tooltip">{copied ? "Copied!" : "Copy"}</span>
      </button>
      
      <button 
        onClick={onRetry}
        className="message-action-button"
        aria-label="Regenerate response"
      >
        <RefreshCw size={14} className="text-gray-500 dark:text-gray-400" />
        <span className="action-tooltip">Retry</span>
      </button>
      
      <div className="message-action-divider"></div>
      
      <button 
        onClick={() => handleFeedback(true)}
        className="message-action-button"
        aria-label="Rate response as helpful"
      >
        <ThumbsUp size={14} className="text-gray-500 dark:text-gray-400" />
        <span className="action-tooltip">Helpful</span>
      </button>
      
      <button 
        onClick={() => handleFeedback(false)}
        className="message-action-button"
        aria-label="Rate response as not helpful"
      >
        <ThumbsDown size={14} className="text-gray-500 dark:text-gray-400" />
        <span className="action-tooltip">Not helpful</span>
      </button>
    </div>
  );
};

export default MessageActions;
