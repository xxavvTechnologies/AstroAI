import { useState, useEffect, useCallback } from 'react';
import { Message } from '../types/message';

export const useMessageStore = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat-messages');
    const initialMessages = saved ? JSON.parse(saved) : [{
      id: 'welcome-message',
      role: 'assistant',
      content: 'Hello! I\'m Astro. How can I help you today?',
      timestamp: Date.now()
    }];
    
    // Ensure all messages have IDs and timestamps
    return initialMessages.map((msg: Message) => ({
      ...msg,
      id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: msg.timestamp || Date.now()
    }));
  });

  useEffect(() => {
    localStorage.setItem('chat-messages', JSON.stringify(messages));
  }, [messages]);
  
  // Function to edit a message and truncate the conversation
  const editMessageAndTruncate = useCallback((messageId: string, newContent: string) => {
    setMessages(prevMessages => {
      // Find the index of the message to edit
      const messageIndex = prevMessages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex === -1) return prevMessages;
      
      // Create a new array with messages up to the edited message
      const updatedMessages = prevMessages.slice(0, messageIndex + 1);
      
      // Update the content of the edited message
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: newContent
      };
      
      return updatedMessages;
    });
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage;
  }, []);

  // Function to add a test message with canvas content
  const addTestCanvasMessage = useCallback(() => {
    const testCanvasContent = `I've created an example visualization for you:

&& 
# Interactive Canvas Example

\`\`\`javascript
// A simple data visualization example
const data = [12, 19, 3, 5, 2, 3];
const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

// This code would generate a chart with the given data
function createChart(data, labels) {
  console.log('Creating chart with:', { data, labels });
  // Chart creation logic here
  return {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monthly Data',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)'
      }]
    }
  };
}
\`\`\`

Feel free to modify this code or ask me to change it!
&&

You can edit this canvas by clicking the "Edit & Interact" button. This is similar to Claude's canvas feature.`;

    return addMessage({
      role: 'assistant',
      content: testCanvasContent
    });
  }, [addMessage]);

  return { 
    messages, 
    setMessages,
    editMessageAndTruncate,
    addMessage,
    addTestCanvasMessage
  };
};
