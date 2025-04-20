import { useState, useEffect } from 'react';
import { Message } from '../types/message';

export const useMessageStore = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat-messages');
    return saved ? JSON.parse(saved) : [{
      role: 'assistant',
      content: 'Hello! I\'m Astro. How can I help you today?'
    }];
  });

  useEffect(() => {
    localStorage.setItem('chat-messages', JSON.stringify(messages));
  }, [messages]);

  return { messages, setMessages };
};
