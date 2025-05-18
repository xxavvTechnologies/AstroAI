import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AstroUI from './components/AstroUI';
import LoginPage from './pages/LoginPage';
import WelcomeModal from './components/WelcomeModal';
import FeatureTip from './components/FeatureTip';
import { sendMessage, retryLastMessage, LimitError } from './services/chatService';
import { useMessageStore } from './hooks/useMessageStore';
import { hasReachedLimit } from './utils/characterLimit';
import { modes } from './services/modeService';
import { testCanvasFeature } from './utils/canvasTest';
import type { Mode } from './types/mode';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  const { messages, setMessages, addMessage, editMessageAndTruncate, addTestCanvasMessage } = useMessageStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showFeatureTip, setShowFeatureTip] = useState<'canvas' | 'messageActions' | null>(null);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('astro-welcome-seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  useEffect(() => {
    if (hasReachedLimit()) {
      setIsLimitReached(true);
    }
  }, []);
  
  // Show feature tips if the user hasn't seen them yet
  useEffect(() => {
    const hasSeenCanvasTip = localStorage.getItem('astro-canvas-tip-seen');
    if (!hasSeenCanvasTip && !showWelcome) {
      // Show canvas tip after a delay to not overwhelm new users
      const timer = setTimeout(() => {
        setShowFeatureTip('canvas');
      }, 5000); // 5 seconds after welcome is closed
      
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const handleCloseWelcome = () => {
    localStorage.setItem('astro-welcome-seen', 'true');
    setShowWelcome(false);
  };
  
  const handleDismissFeatureTip = () => {
    if (showFeatureTip === 'canvas') {
      localStorage.setItem('astro-canvas-tip-seen', 'true');
    } else if (showFeatureTip === 'messageActions') {
      localStorage.setItem('astro-message-actions-tip-seen', 'true');
    }
    setShowFeatureTip(null);
  };

  const handleSendMessage = async (message: string, mode: Mode) => {
    // Add user message
    const userMessage = addMessage({ role: 'user', content: message });
    
    try {
      // Add loading assistant message
      const assistantMessage = addMessage({ 
        role: 'assistant', 
        content: '', 
        isLoading: true 
      });
      
      // If in search mode, show searching indicator
      if (mode.id === 'search') {
        setIsSearching(true);
      }
      
      const history = messages
        .reduce((acc: Array<{input: string; response: string}>, curr, i, arr) => {
          if (curr.role === 'user' && i + 1 < arr.length) {
            acc.push({
              input: curr.content,
              response: arr[i + 1].content
            });
          }
          return acc;
        }, []);

      const response = await sendMessage(message, history, mode);
      setIsSearching(false);
      
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = response.response;
          lastMessage.isLoading = false;
        }
        return newMessages;
      });
    } catch (error) {
      setIsSearching(false);
      if (error instanceof LimitError) {
        setIsLimitReached(true);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages.pop(); // Remove loading message
          return newMessages;
        });
        return;
      }
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    }
  };

  const handleCanvasUpdate = async (messageId: string, canvasId: string, newContent: string, prompt?: string) => {
    // Find the message with this ID
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    const message = messages[messageIndex];
    
    if (prompt) {
      // If there's a prompt, we'll add it as a user message and let Astro respond
      // Add the user message
      const userMessage = addMessage({
        role: 'user',
        content: `Please update the canvas with the following request: ${prompt}\n\nCurrent canvas content:\n\`\`\`\n${newContent}\n\`\`\``
      });
      
      // Add a loading assistant message
      const assistantMessage = addMessage({
        role: 'assistant',
        content: '',
        isLoading: true
      });
      
      try {
        // Format chat history
        const history = messages
          .slice(0, -2) // Exclude the last two messages we just added
          .reduce((acc: Array<{input: string; response: string}>, curr, i, arr) => {
            if (curr.role === 'user' && i + 1 < arr.length && arr[i + 1].role === 'assistant') {
              acc.push({
                input: curr.content,
                response: arr[i + 1].content
              });
            }
            return acc;
          }, []);
        
        const mode = modes.general;
        const response = await sendMessage(userMessage.content, history, mode);
        
        // Update the assistant message
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content = response.response;
            lastMessage.isLoading = false;
          }
          return newMessages;
        });
      } catch (error) {
        console.error('Error updating canvas:', error);
        // Remove loading indicator
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0 && newMessages[newMessages.length - 1].isLoading) {
            newMessages[newMessages.length - 1].isLoading = false;
            newMessages[newMessages.length - 1].content = 'Sorry, I encountered an error processing your canvas update request.';
          }
          return newMessages;
        });
      }
    } else {
      // Just update the canvas content directly within the message
      const updatedContent = message.content.replace(
        new RegExp(`&&\\s*[\\s\\S]*?\\s*&&`), 
        `&& ${newContent} &&`
      );
      
      editMessageAndTruncate(messageId, updatedContent);
    }
  };
  
  const handleRetryMessage = async () => {
    // Get the last two messages (user and assistant)
    const lastMessages = messages.slice(-2);
    if (lastMessages.length < 2 || lastMessages[1].role !== 'assistant') {
      return; // Nothing to retry
    }
    
    // Mark the assistant message as loading
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.isLoading = true;
        lastMessage.content = ''; // Clear content while loading
      }
      return newMessages;
    });
    
    try {
      // Format the history for the retry
      const history = messages
        .slice(0, -2) // Exclude the last question-answer pair
        .reduce((acc: Array<{input: string; response: string}>, curr, i, arr) => {
          if (curr.role === 'user' && i + 1 < arr.length) {
            acc.push({
              input: curr.content,
              response: arr[i + 1].content
            });
          }
          return acc;
        }, []);
      
      // Use the last user message
      const userMessage = messages[messages.length - 2];
      const mode = modes.general; // Default to general mode
      
      if (mode.id === 'search') {
        setIsSearching(true);
      }
      
      const response = await retryLastMessage(history, mode);
      setIsSearching(false);
      
      // Update the assistant message with the new response
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = response.response;
          lastMessage.isLoading = false;
        }
        return newMessages;
      });
    } catch (error) {
      setIsSearching(false);
      console.error('Error retrying message:', error);
      
      // Update the message to show error
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = "I'm sorry, there was an error generating a response. Please try again.";
          lastMessage.isLoading = false;
        }
        return newMessages;
      });
    }
  };

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <WelcomeModal 
            isOpen={showWelcome} 
            onClose={handleCloseWelcome} 
            onTestCanvas={addTestCanvasMessage} 
          />
          
          {showFeatureTip && (
            <FeatureTip 
              feature={showFeatureTip} 
              onDismiss={handleDismissFeatureTip} 
            />
          )}
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <AstroUI 
                    onSendMessage={handleSendMessage} 
                    messages={messages} 
                    isLimitReached={isLimitReached}
                    onEditMessage={editMessageAndTruncate}
                    onRetryMessage={handleRetryMessage}
                    onCanvasUpdate={handleCanvasUpdate}
                    isSearching={isSearching}
                  />
                </PrivateRoute>
              } 
            />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
