import React, { useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';

interface AutoResizeTextareaProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  placeholder?: string;
  className?: string;
  animate?: boolean;
}

const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  onChange,
  onSend,
  placeholder,
  className,
  animate
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    if (animate && textareaRef.current) {
      textareaRef.current.classList.add('animate-pulse');
      setTimeout(() => {
        textareaRef.current?.classList.remove('animate-pulse');
      }, 300);
    }
  }, [animate]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`transition-all duration-200 ease-out ${className}`}
      rows={1}
      style={{ 
        resize: 'none', 
        maxHeight: '200px', 
        overflowY: 'auto',
        transition: 'height 0.2s ease-out'
      }}
    />
  );
};

export default AutoResizeTextarea;
