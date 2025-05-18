import { hasReachedLimit, updateCharacterUsage } from '../utils/characterLimit';
import { Mode } from '../types/mode';
import { getModeContext } from './modeService';
import { performSearch } from './searchService';

interface ChatHistory {
  input: string;
  response: string;
}

interface ChatResponse {
  response: string;
  history: ChatHistory[];
}

export class LimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LimitError';
  }
}

export const retryLastMessage = async (
  history: ChatHistory[],
  mode: Mode
): Promise<ChatResponse> => {
  if (history.length === 0) {
    throw new Error('No message to retry');
  }
  
  // Get the last message from history
  const lastMessage = history[history.length - 1];
  
  // Remove the last message from history to avoid duplication
  const newHistory = history.slice(0, -1);
  
  // Resend the last message
  return sendMessage(lastMessage.input, newHistory, mode);
};

export const sendMessage = async (
  message: string, 
  history: ChatHistory[],
  mode: Mode
): Promise<ChatResponse> => {
  try {
    if (hasReachedLimit()) {
      throw new LimitError('Daily character limit reached');
    }

    let searchResults: { title: string; link: string; snippet: string; }[] = [];
    
    if (mode.id === 'search') {
      try {
        searchResults = await performSearch(message);
      } catch (error) {
        console.error('Search failed:', error);
        // Continue without search results if search fails
      }
    }

    // Create context with search results for the AI
    let contextWithSearch = getModeContext(mode);
    
    if (searchResults.length > 0) {
      contextWithSearch += '\n\nSearch Results:\n';
      searchResults.forEach((result, index) => {
        contextWithSearch += `\n[${index + 1}] "${result.title}"\nURL: ${result.link}\nDescription: ${result.snippet}\n`;
      });
      contextWithSearch += '\n\nPlease use these search results to provide an informed response to the user query.';
    }

    const response = await fetch('https://api.nlpcloud.io/v1/gpu/finetuned-llama-3-70b/chatbot', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_NLPCLOUD_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: message,
        context: contextWithSearch,
        history
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.response) {
      throw new Error('Invalid response from API');
    }

    updateCharacterUsage(data.response.length);
    // Add search results to the response
    return {
      ...data,
      searchResults
    };
  } catch (error: any) {
    if (error instanceof LimitError) {
      throw error;
    }
    console.error('Chat error:', error);
    throw new Error(error.message || 'Failed to send message');
  }
};
