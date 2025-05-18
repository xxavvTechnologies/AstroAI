interface FeedbackData {
  messageId: string;
  isPositive: boolean;
  timestamp: number;
  userId?: string;
  content?: string;
}

const submitFeedback = async (data: FeedbackData): Promise<boolean> => {
  try {
    // Netlify form submission format
    const formData = new FormData();
    formData.append('form-name', 'message-feedback');
    formData.append('messageId', data.messageId);
    formData.append('isPositive', data.isPositive.toString());
    formData.append('timestamp', data.timestamp.toString());
    
    if (data.userId) {
      formData.append('userId', data.userId);
    }
    
    if (data.content) {
      formData.append('content', data.content);
    }

    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData as any).toString()
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return false;
  }
};

export { submitFeedback };
export type { FeedbackData };
