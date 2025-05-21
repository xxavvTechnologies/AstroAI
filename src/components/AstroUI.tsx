import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, FileText, Mic, Settings, Moon, Sun, LogOut, Brain, Clock, Menu, UserCog, HelpCircle, BadgeCheck, Edit } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AutoResizeTextarea from './AutoResizeTextarea';
import MessageContent from './MessageContent';
import { Message } from '../types/message';
import SettingsModal from './SettingsModal';
import ModelsModal from './ModelsModal';
import HelpModal from './HelpModal';
import EditMessageModal from './EditMessageModal';
import { getRemainingCharacters } from '../utils/characterLimit';
import LimitModal from './LimitModal';
import { useState as useModeState } from 'react';
import { modes } from '../services/modeService';
import type { Mode, ModeId } from '../types/mode';
import VersionBadge from './VersionBadge';
import MessageActions from './MessageActions';
import { submitFeedback } from '../services/feedbackService';
import './animations.css';

interface AstroUIProps {
  onSendMessage: (message: string, mode: Mode) => Promise<void>;
  messages: Message[];
  isLimitReached: boolean;
  isSearching?: boolean;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRetryMessage?: () => Promise<void>;
  onCanvasUpdate?: (messageId: string, canvasId: string, newContent: string, prompt?: string) => Promise<void>;
}

const AstroUI: React.FC<AstroUIProps> = ({ onSendMessage, messages, isLimitReached, isSearching, onEditMessage, onRetryMessage, onCanvasUpdate }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [remainingChars, setRemainingChars] = useState(getRemainingCharacters());
  const [showLimitModal, setShowLimitModal] = useState(isLimitReached);
  const [currentMode, setCurrentMode] = useModeState<Mode>(modes.general);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touchX = e.touches[0].clientX;
      if (touchX < 20 && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingChars(getRemainingCharacters());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setShowLimitModal(isLimitReached);
  }, [isLimitReached]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === '') return;
    
    try {
      await onSendMessage(userInput, currentMode);
      setUserInput('');
    } catch (error) {
      // Let App.tsx handle the error
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setIsAnimating(true);
    setUserInput((prev) => {
      const newValue = prev ? `${prev}\n${prompt}` : prompt;
      return newValue;
    });
    setTimeout(() => setIsAnimating(false), 300);
  };
  
  const handleCopyMessage = (messageId: string) => {
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };
  
  const handleRetryMessage = async () => {
    if (onRetryMessage) {
      try {
        await onRetryMessage();
      } catch (error) {
        console.error('Failed to retry message:', error);
      }
    }
  };
  
  const handleFeedback = async (messageId: string, isPositive: boolean) => {
    try {
      // Find the message content
      const message = messages.find(m => m.id === messageId);
      if (!message) return;
      
      await submitFeedback({
        messageId,
        isPositive,
        timestamp: Date.now(),
        userId: user?.id,
        content: message.content.slice(0, 500) // Limit content length
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const renderModeSelector = () => (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Conversation Modes</h3>
      {Object.values(modes).map((mode) => (
        <button
          key={mode.id}
          onClick={() => {
            setCurrentMode(mode);
            setIsModeMenuOpen(false);
          }}
          className={`w-full flex items-center gap-3 py-2 px-3 rounded-md transition-colors ${
            currentMode.id === mode.id
              ? 'bg-[#9e00ff]/10 text-[#9e00ff]'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span className="text-lg">{mode.icon}</span>
          <div className="text-left">
            <div className="text-sm font-medium">{mode.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{mode.description}</div>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className={`flex min-h-screen h-[100dvh] ${isDarkMode ? 'dark' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 to-indigo-900/5 pointer-events-none" />
        
        {/* Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-20 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Mobile Responsive */}
        <div className={`fixed md:relative w-64 md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full z-30 transition-transform duration-300 ease-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`} ref={sidebarRef}>
          <div className="p-4 flex items-center space-x-2">
            <div className="w-8 h-8">
              <img src="https://d2zcpib8duehag.cloudfront.net/Astro.png" alt="Astro" className="w-full h-full" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg font-space">Astro</span>
                <VersionBadge version="3.1.0" className="animate-pulse-subtle" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Your cosmic AI assistant</span>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsModelsOpen(true)}
              className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <Brain size={16} />
              <span className="text-sm dark:text-gray-300">Models</span>
            </button>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {renderModeSelector()}
          </div>

          {/* Profile section at bottom with settings */}
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <HelpCircle size={16} />
              <span className="text-sm dark:text-gray-300">Help & Support</span>
            </button>
            <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={toggleDarkMode}>
              {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
              <span className="text-sm dark:text-gray-300">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
              <Settings size={16} />
              <span className="text-sm dark:text-gray-300">Settings</span>
            </div>

            {/* User Profile */}
            <div className="relative mt-4 pt-4 border-t border-gray-200 dark:border-gray-700" ref={profileRef}>
              <div 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="h-10 w-10 rounded-full bg-[#9e00ff]/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-[#9e00ff]">
                    {user?.email?.[0].toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium dark:text-white truncate">{user?.email || 'Anonymous'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Nova ID</div>
                </div>
              </div>

              {isProfileOpen && (
                <div className="absolute bottom-[120%] left-0 right-0 mx-4 z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <a 
                      href="https://account.novasuite.one" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <UserCog size={16} className="text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Manage Account</span>
                    </a>
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <LogOut size={16} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative min-h-0">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Menu size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
                <div className="md:hidden">
                  <img src="https://d2zcpib8duehag.cloudfront.net/Astro.png" alt="Astro" className="w-8 h-8" />
                </div>
                <div className="text-xl font-semibold font-space dark:text-white group-hover:text-[#9e00ff] transition-colors">
                  Astro
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full font-jakarta flex items-center gap-1">
                  <span>ModelA 8-Pro</span>
                  <BadgeCheck size={12} className="text-[#9e00ff]" />
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-white dark:bg-gray-900" ref={chatContainerRef}>
            {messages.map((message, index) => (
              <div 
                key={message.id || index} 
                className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative group message-container">
                  <div 
                    className={`max-w-3xl rounded-lg p-4 animate-slide-in message-transition ${
                      message.role === 'user' 
                        ? 'bg-[#9e00ff] text-white' 
                        : 'bg-transparent text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <MessageContent 
                      content={message.content} 
                      isLoading={message.isLoading} 
                      isSearching={index === messages.length - 1 && isSearching}
                      messageId={message.id}
                      onCanvasUpdate={onCanvasUpdate}
                    />
                  </div>
                  
                  {message.role === 'user' && message.id && (
                    <button
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Edit message"
                      onClick={() => {
                        setEditingMessageId(message.id || null);
                        setEditedContent(message.content);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit size={14} />
                    </button>
                  )}
                  
                  {message.role === 'assistant' && message.id && !message.isLoading && (
                    <MessageActions 
                      messageId={message.id}
                      content={message.content}
                      onCopy={() => handleCopyMessage(message.id || '')}
                      onRetry={handleRetryMessage}
                      onFeedback={handleFeedback}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-900 p-2 md:p-4 flex justify-center space-x-2 animate-fade-in overflow-x-auto">
            {/* Make buttons scrollable on mobile */}
            <div className="flex space-x-2 pb-2 md:pb-0 snap-x snap-mandatory">
              <button 
                onClick={() => handleQuickAction("Can you summarize the key points from our conversation?")}
                className="snap-center shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-2 px-4 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#9e00ff]/50 flex items-center gap-2 transition-all duration-200 ease-out scale-transition group"
              >
                <FileText size={16} className="group-hover:text-[#9e00ff] transition-colors" />
                <span className="dark:text-gray-300 group-hover:text-[#9e00ff] transition-colors whitespace-nowrap">Summarize chat</span>
              </button>
              <button 
                onClick={() => handleQuickAction("Let's brainstorm some ideas about")}
                className="snap-center shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-2 px-4 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#9e00ff]/50 flex items-center gap-2 transition-all duration-200 ease-out scale-transition group"
              >
                <MessageSquare size={16} className="group-hover:text-[#9e00ff] transition-colors" />
                <span className="dark:text-gray-300 group-hover:text-[#9e00ff] transition-colors whitespace-nowrap">Brainstorm</span>
              </button>
              <button 
                onClick={() => handleQuickAction("What did we discuss in our last conversation?")}
                className="snap-center shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-2 px-4 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#9e00ff]/50 flex items-center gap-2 transition-all duration-200 ease-out scale-transition group"
              >
                <Clock size={16} className="group-hover:text-[#9e00ff] transition-colors" />
                <span className="dark:text-gray-300 group-hover:text-[#9e00ff] transition-colors whitespace-nowrap">Chat history</span>
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 md:p-4 bg-white dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className={`relative ${isLimitReached ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex-1 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex flex-col hover:border-[#9e00ff]/50 focus-within:border-[#9e00ff]/50 transition-colors relative">
                  <div className="px-4 py-3">
                    <AutoResizeTextarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onSend={() => handleSubmit(new Event('submit') as any)}
                      placeholder="Message Astro..."
                      className="w-full outline-none bg-transparent dark:text-white transition-all duration-200"
                      animate={isAnimating}
                    />
                  </div>
                  
                  {userInput.trim() !== '' && (
                    <button 
                      type="submit" 
                      className="absolute right-2 bottom-2 text-[#9e00ff] hover:text-[#8300d4] p-2 rounded-lg transition-all duration-200 opacity-50 hover:opacity-100"
                      aria-label="Send message"
                    >
                      <Send size={16} />
                    </button>
                  )}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 flex items-center px-3 py-2">
                    <button 
                      type="button" 
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-400 p-1 rounded-md"
                    >
                      <Mic size={16} />
                    </button>
                    <div className="flex-1 text-xs text-center text-gray-400">
                      Press Enter to send
                    </div>
                  </div>
                </div>
                {isLimitReached && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Daily limit reached
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Astro can make mistakes. Double-check important information.</span>
                <span>{Math.max(remainingChars, 0).toLocaleString()} characters remaining today</span>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <ModelsModal 
        isOpen={isModelsOpen}
        onClose={() => setIsModelsOpen(false)}
      />
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
      <LimitModal 
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
      <EditMessageModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        content={editedContent}
        onContentChange={setEditedContent}
        onSave={() => {
          if (editingMessageId && onEditMessage && editedContent.trim()) {
            onEditMessage(editingMessageId, editedContent);
            setIsEditModalOpen(false);
            setEditingMessageId(null);
          }
        }}
      />
    </>
  );
};

export default AstroUI;
