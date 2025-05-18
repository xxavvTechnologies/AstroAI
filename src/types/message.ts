export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  timestamp?: number;
  isCopied?: boolean;
  receivedFeedback?: 'positive' | 'negative';
}
