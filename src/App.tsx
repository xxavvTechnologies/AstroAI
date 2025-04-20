import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AstroUI from './components/AstroUI';
import LoginPage from './pages/LoginPage';
import WelcomeModal from './components/WelcomeModal';
import { sendMessage, LimitError } from './services/chatService';
import { useMessageStore } from './hooks/useMessageStore';
import { hasReachedLimit } from './utils/characterLimit';

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
  const { messages, setMessages } = useMessageStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);

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

  const handleCloseWelcome = () => {
    localStorage.setItem('astro-welcome-seen', 'true');
    setShowWelcome(false);
  };

  const handleSendMessage = async (message: string) => {
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '', 
        isLoading: true 
      }]);
      
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

      const response = await sendMessage(message, history);
      
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

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />
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
