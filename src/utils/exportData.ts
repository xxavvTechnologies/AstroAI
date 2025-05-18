export const exportChatData = () => {
  const messages = localStorage.getItem('chat-messages');
  const usage = localStorage.getItem('astro-character-usage');
  
  const exportData = {
    messages: messages ? JSON.parse(messages) : [],
    usage: usage ? JSON.parse(usage) : null,
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `astro-chat-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
