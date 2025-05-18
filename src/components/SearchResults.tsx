import React from 'react';
import { ExternalLink, Search } from 'lucide-react';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface SearchResultsProps {
  results: SearchResult[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  if (!results.length) return null;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Search Results
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Search size={12} />
          <span>Powered by Brave Search</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <a
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#9e00ff] hover:text-[#8300d4] font-medium mb-1"
            >
              {result.title}
              <ExternalLink size={14} />
            </a>
            <p className="text-sm text-gray-600 dark:text-gray-400">{result.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
