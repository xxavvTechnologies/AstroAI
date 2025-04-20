import { hasReachedLimit, updateCharacterUsage } from '../utils/characterLimit';

interface ChatHistory {
  input: string;
  response: string;
}

interface ChatResponse {
  response: string;
  history: ChatHistory[];
}

interface NLPCloudError {
  response?: {
    status?: number;
    data?: {
      detail?: string;
    };
  };
}

export class LimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LimitError';
  }
}

export const sendMessage = async (
  message: string, 
  history: ChatHistory[]
): Promise<ChatResponse> => {
  try {
    if (hasReachedLimit()) {
      throw new LimitError('Daily character limit reached');
    }

    const response = await fetch('https://api.nlpcloud.io/v1/gpu/finetuned-llama-3-70b/chatbot', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_NLPCLOUD_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: message,
        context: 'This is a discussion between a human and an AI assistant. The AI is called Astro and is friendly, helpful, and knowledgeable.',
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
    return data;
  } catch (error: any) {
    if (error instanceof LimitError) {
      throw error;
    }
    console.error('Chat error:', error);
    throw new Error(error.message || 'Failed to send message');
  }
};
