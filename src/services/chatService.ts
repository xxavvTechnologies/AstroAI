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
  mode: Mode,
  forceSendContext: boolean = false
): Promise<ChatResponse> => {
  if (history.length === 0) {
    throw new Error('No message to retry');
  }
  
  // Get the last message from history
  const lastMessage = history[history.length - 1];
  
  // Remove the last message from history to avoid duplication
  const newHistory = history.slice(0, -1);
  
  // Resend the last message
  return sendMessage(lastMessage.input, newHistory, mode, forceSendContext);
};

export const sendMessage = async (
  message: string, 
  history: ChatHistory[],
  mode: Mode,
  forceSendContext: boolean = false
): Promise<ChatResponse> => {
  try {
    if (hasReachedLimit()) {
      throw new LimitError('Daily character limit reached');
    }

    // Validate message is not empty
    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    let searchResults: { title: string; link: string; snippet: string; }[] = [];
    
    if (mode.id === 'search') {
      try {
        searchResults = await performSearch(message);
      } catch (error) {
        console.error('Search failed:', error);
        // Continue without search results if search fails
      }
    }    // Create context with search results for the AI
    let contextWithSearch = getModeContext(mode);
    
    if (searchResults.length > 0) {
      contextWithSearch += '\n\nSearch Results:\n';
      searchResults.forEach((result, index) => {
        contextWithSearch += `\n[${index + 1}] "${result.title}"\nURL: ${result.link}\nDescription: ${result.snippet}\n`;
      });
      contextWithSearch += '\n\nPlease use these search results to provide an informed response to the user query.';
    }    // Only send system context every 10 messages, on first message, or when explicitly forced (like mode changes)
    const shouldSendContext = history.length === 0 || history.length % 10 === 0 || forceSendContext;
    const contextToSend = shouldSendContext ? contextWithSearch : undefined;// Convert history to the format expected by Claude
    // Only send the last 7 messages (3 exchanges) to save tokens and reduce payload size
    const recentHistory = history.slice(-7);
    const historyForBedrock = recentHistory
      .filter(item => item.input && item.input.trim() && item.response && item.response.trim())
      .map(item => [
        { role: 'user', content: item.input.trim() },
        { role: 'assistant', content: item.response.trim() }
      ]).flat();const requestBody = {
      message: message.trim(),
      context: contextToSend,
      history: historyForBedrock
    };

    console.log('Sending to API:', JSON.stringify(requestBody, null, 2)); // Debug log

    const response = await fetch(`${process.env.REACT_APP_API_GATEWAY_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: `HTTP ${response.status}: ${errorText}` };
      }
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data); // Debug log
    
    if (!data?.generated_text) {
      console.error('Unexpected response format:', data);
      throw new Error('Invalid response from API');
    }updateCharacterUsage(data.generated_text.length);
    
    // Add the new message to history
    const newHistory = [...history, { input: message, response: data.generated_text }];
    
    // Convert response to match existing format
    const chatResponse = {
      response: data.generated_text,
      history: newHistory,
      searchResults
    };

    return chatResponse;
  } catch (error: any) {
    if (error instanceof LimitError) {
      throw error;
    }
    console.error('Chat error:', error);
    throw new Error(error.message || 'Failed to send message');
  }
};
