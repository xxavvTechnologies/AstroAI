import React, { useState, useEffect } from 'react';
import { Search, Globe, Loader } from 'lucide-react';
import LoadingIndicator from './LoadingIndicator';

interface SearchIndicatorProps {
  isSearching: boolean;
}

const SearchIndicator: React.FC<SearchIndicatorProps> = ({ isSearching }) => {
  const [searchMessages, setSearchMessages] = useState<string[]>([
    'Scanning the web...',
    'Exploring the cosmos...',
    'Gathering information...',
    'Analyzing data...',
    'Searching knowledge bases...'
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (isSearching) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % searchMessages.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isSearching, searchMessages.length]);
  
  if (!isSearching) return null;
  
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md shadow-sm">
      {isSearching ? (
        <>
          <div className="flex-shrink-0">
            <LoadingIndicator size="sm" className="text-indigo-500" />
          </div>
          <div className="flex items-center gap-1">
            <Globe size={12} className="text-indigo-400" />
            <span className="animate-pulse-subtle">{searchMessages[currentIndex]}</span>
          </div>
        </>
      ) : (
        <>
          <Search size={14} />
          <span>Search completed</span>
        </>
      )}
    </div>
  );
};

export default SearchIndicator;
