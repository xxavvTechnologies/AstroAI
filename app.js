import { config } from './config.js';

const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const client = new NLPCloudClient('finetuned-llama-3-70b', '8c066055d1036fe83e7748c722a7fbfaf518e9ef', true);

const SYSTEM_INSTRUCTIONS = ``;

// Enhanced response filters
const RESPONSE_FILTERS = {
    // Enhance space theme naturally
    enhanceSpaceTheme: text => {
        const spaceEmojis = ['🌟', '🚀', '✨', '🌎', '☄️', '🌌', '🌑', '🛸'];
        if (!spaceEmojis.some(emoji => text.includes(emoji))) {
            // Only add emoji if it makes sense contextually
            const spaceKeywords = ['space', 'star', 'planet', 'galaxy', 'cosmos', 'orbit'];
            if (spaceKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
                return `${spaceEmojis[Math.floor(Math.random() * spaceEmojis.length)]} ${text}`;
            }
        }
        return text;
    },
    
    // Improve readability
    improveReadability: text => {
        return text.replace(/\s{2,}/g, ' ')           // Remove extra spaces
                  .replace(/[.!?]+(?=[.!?])/g, '')    // Remove repeated punctuation
                  .replace(/\b(very|really|quite)\s+/g, '') // Remove unnecessary intensifiers
                  .trim();
    },
    
    // Ensure professional tone
    maintainProfessionalism: text => {
        return text.replace(/\b(cool|awesome|amazing|wow|oh my|woah)\b/gi, 'great')
                  .replace(/!{2,}/g, '!')  // Reduce multiple exclamation marks
                  .replace(/\?{2,}/g, '?'); // Reduce multiple question marks
    },
    
    // Format consistency
    formatConsistency: text => {
        return text.replace(/\s+([.,!?])/g, '$1')     // Fix punctuation spacing
                  .replace(/([.,!?])(?=\w)/g, '$1 ')   // Ensure space after punctuation
                  .replace(/\s*\n\s*/g, '\n\n');      // Standardize line breaks
    },

    // Enhance definition formatting
    formatDefinitions: text => {
        return text.replace(/^(\w+)\n\s*: /gm, '$1\n: ');
    },

    // Format warning/info/success blocks
    formatAlertBlocks: text => {
        return text
            .replace(/^>(\s*⚠️[^\n]*)/gm, '<div class="warning-block">$1</div>')
            .replace(/^>(\s*ℹ️[^\n]*)/gm, '<div class="info-block">$1</div>')
            .replace(/^>(\s*✅[^\n]*)/gm, '<div class="success-block">$1</div>');
    },

    // Handle citations
    formatCitations: text => {
        return text.replace(/\[Source: ([^\]]+)\]/g, '<cite class="source">Source: $1</cite>');
    },

    // Clean up table formatting
    formatTables: text => {
        if (text.includes('|')) {
            return text.replace(/^\s*\|/, '|').replace(/\|\s*$/, '|');
        }
        return text;
    }
};

// Modified processing function to apply all filters
function processAIResponse(text) {
    // Apply each filter in sequence
    const processedText = Object.values(RESPONSE_FILTERS).reduce((processed, filter) => {
        return filter(processed);
    }, text);
    
    // Additional post-processing
    return DOMPurify.sanitize(marked.parse(processedText), {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'table', 'thead', 'tbody', 
                      'tr', 'th', 'td', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 
                      'h4', 'hr', 'div', 'span', 'cite', 'details', 'summary'],
        ALLOWED_ATTR: ['class', 'id']
    });
}

// Apply the filters before displaying bot response
function addMessage(text, sender, parseMarkdown = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    // Handle sender parameter as either string or array
    if (Array.isArray(sender)) {
        sender.forEach(className => messageDiv.classList.add(className));
    } else {
        messageDiv.classList.add(`${sender}-message`);
    }
    
    // Process bot messages through filters
    if (sender === 'bot') {
        text = processAIResponse(text);
    }
    
    if (parseMarkdown && sender === 'bot') {
        // Parse markdown and sanitize HTML
        const htmlContent = marked.parse(text);
        const sanitizedHtml = DOMPurify.sanitize(htmlContent);
        messageDiv.innerHTML = sanitizedHtml;
    } else {
        messageDiv.textContent = text;
    }
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    return messageDiv;
}

// Store conversation history in NLPCloud format
let conversationHistory = [
    {
        input: "Hello",
        response: "Hi there! I'm Astro AI. How can I help you today?"
    }
];

const SYSTEM_CONTEXT = 'This is a discussion between a human and an AI assistant. The AI is called Astro and is helpful, friendly, and knowledgeable.';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

const VALID_ACCESS_KEYS = Object.keys(config.ACCESS_KEYS);

// API key management
let accessKey = localStorage.getItem('astroAccessKey');

function checkAccessKey() {
    if (!accessKey || !VALID_ACCESS_KEYS.includes(accessKey)) {
        document.getElementById('access-key-modal').classList.add('active');
        document.getElementById('app-container').style.display = 'none';
        return false;
    }
    return true;
}

async function sendMessage(message, retryCount = 0) {
    if (!checkAccessKey()) return;
    
    addMessage(message, 'user');
    userInput.value = '';
    userInput.disabled = true;

    const typingIndicator = addTypingIndicator();
    
    try {
        const response = await client.chatbot({
            input: message,
            context: SYSTEM_CONTEXT,
            history: conversationHistory
        });

        typingIndicator.remove();
        
        if (response.response) {
            const botResponse = response.response.trim();
            
            if (botResponse.length < 1) {
                throw new Error('Empty response');
            }

            conversationHistory = response.history;
            addMessage(botResponse, 'bot', true);
            
            setTimeout(() => {
                Prism.highlightAllUnder(chatMessages);
                addCopyButtons();
            }, 100);
        } else {
            throw new Error('Unexpected response format');
        }
        
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        
        if (retryCount < RETRY_ATTEMPTS && isRetryableError(error)) {
            window.notifications.warning('Retrying request...', 'RETRY001');
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return sendMessage(message, retryCount + 1);
        }
        
        window.notifications.error(
            'Failed to get response. Please try again.',
            error.response?.status ? `API${error.response.status}` : 'ERR000'
        );
        addMessage('Sorry, I encountered an error. Please try again.', ['bot', 'error']);
    } finally {
        userInput.disabled = false;
        userInput.focus();
    }
}

function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('message', 'bot', 'typing-indicator');
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.classList.add('typing-dot');
        indicator.appendChild(dot);
    }
    chatMessages.appendChild(indicator);
    scrollToBottom();
    return indicator;
}

function addCopyButtons() {
    document.querySelectorAll('.bot-message pre:not(.has-copy-button)').forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';
        
        button.addEventListener('click', async () => {
            const code = block.querySelector('code').textContent;
            await navigator.clipboard.writeText(code);
            button.textContent = 'Copied!';
            setTimeout(() => button.textContent = 'Copy', 2000);
        });
        
        block.classList.add('has-copy-button');
        block.insertBefore(button, block.firstChild);
    });
}

function isRetryableError(error) {
    return error.message.includes('429') || // Rate limit
           error.message.includes('503') || // Service unavailable
           error.message.includes('504');   // Gateway timeout
}

// Modify marked options for better code handling
marked.setOptions({
    highlight: function(code, lang) {
        if (Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
    },
    breaks: true,
    gfm: true
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (message) {
        sendMessage(message);
    }
});

// Add suggestion chips for common queries
const SUGGESTIONS = [
    "What's the weather like today?",
    "Tell me a joke",
    "How do I cook pasta?",
    "What's the capital of France?",
    "How do I improve my resume?",
    "What's the latest news?",
    "How do I stay healthy?",
    "What's the time?",
    "Translate 'hello' to Spanish",
    "How do I meditate?"
];

function addSuggestions() {
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'suggestions';
    
    SUGGESTIONS.forEach(text => {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.textContent = text;
        chip.onclick = () => {
            userInput.value = text;
            sendMessage(text);
        };
        suggestionsDiv.appendChild(chip);
    });
    
    chatMessages.appendChild(suggestionsDiv);
}

// Initialize app
window.onload = async () => {
    const submitButton = document.getElementById('submit-access-key');
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            const inputKey = document.getElementById('access-key-input').value.trim();
            if (inputKey && VALID_ACCESS_KEYS.includes(inputKey)) {
                accessKey = inputKey;
                localStorage.setItem('astroAccessKey', inputKey);
                document.getElementById('access-key-modal').classList.remove('active');
                document.getElementById('app-container').style.display = 'block';
                
                updateChatHeader();
                addMessage("👋 Hi! I'm Astro AI. What would you like to know?", 'bot', true);
                addSuggestions();
                
                if (conversations.length === 0) {
                    createNewConversation();
                }
            } else {
                window.notifications.error('Invalid access key', 'ACCESS002');
            }
        });
    } else {
        console.error('Access key submit button not found');
    }
    
    // Check access key on load
    if (checkAccessKey()) {
        document.getElementById('app-container').style.display = 'block';
        updateChatHeader();
        addMessage("👋 Hi! I'm Astro AI. What would you like to know?", 'bot', true);
        addSuggestions();
        if (conversations.length === 0) {
            createNewConversation();
        }
    }
};

// Terms modal functionality
const termsModal = document.getElementById('terms-modal');
const termsCheckbox = document.getElementById('terms-checkbox');
const acceptTermsButton = document.getElementById('accept-terms');

// Check if terms were accepted
const termsAccepted = localStorage.getItem('termsAccepted');
if (!termsAccepted) {
    termsModal.classList.add('active');
}

termsCheckbox.addEventListener('change', () => {
    acceptTermsButton.disabled = !termsCheckbox.checked;
});

acceptTermsButton.addEventListener('click', () => {
    localStorage.setItem('termsAccepted', 'true');
    termsModal.classList.remove('active');
    devNoticeModal.classList.add('active');
});

// Development notice functionality
const devNoticeModal = document.getElementById('dev-notice-modal');
const acknowledgeDevNoticeBtn = document.getElementById('acknowledge-dev-notice');

// Show dev notice on page load, regardless of previous acknowledgments
window.addEventListener('load', () => {
    // Only show dev notice after terms are accepted
    if (localStorage.getItem('termsAccepted')) {
        devNoticeModal.classList.add('active');
    }
});

// Simply hide the notice when acknowledged, don't store in localStorage
acknowledgeDevNoticeBtn.addEventListener('click', () => {
    devNoticeModal.classList.remove('active');
});

// Conversation management
let conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
let currentConversationId = null;

function createNewConversation() {
    const id = Date.now().toString();
    const conversation = {
        id,
        title: `New Conversation`,
        messages: []
    };
    conversations.push(conversation);
    currentConversationId = id;
    saveConversations();
    updateConversationManager();
    clearChat();
    addMessage("👋 Hi! I'm Astro AI. What would you like to know?", 'bot', true);
    addSuggestions();
    window.notifications.success('Created new conversation', 'CONV001');
}

async function suggestConversationTitle(messages) {
    if (messages.length < 2) return null;
    
    try {
        const contextMessages = messages.slice(0, 4).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
        
        const contextStr = contextMessages
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');
            
        const prompt = `Based on this conversation, suggest a clear, simple title (2-4 words, no emojis, no AI references). Focus on the main topic or question. Examples: "Weather Basics", "Resume Tips", "Python Functions", "History Questions".\n\nConversation:\n${contextStr}\n\nTitle:`;

        const response = await fetch('https://api.textsynth.com/v1/engines/llama3.1_8B_instruct/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.TEXTSYNTH_API_KEY}`
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                system: SYSTEM_INSTRUCTIONS,
                temperature: 0.7,
                max_tokens: 20
            })
        });

        if (!response.ok) return null;
        
        const data = await response.json();
        if (!data.text) return null;
        
        let title = data.text.trim()
            .replace(/["']/g, '')           // Remove quotes
            .replace(/^Title:\s*/i, '')     // Remove "Title:" prefix
            .replace(/[^\w\s-]/g, '')       // Remove special characters and emojis
            .replace(/\b(ai|bot|astro)\b/gi, '')  // Remove AI references
            .split('\n')[0]                 // Take first line
            .trim()
            .replace(/\s+/g, ' ')           // Normalize spaces
            .substring(0, 25);              // Limit length
        
        return title || null;
    } catch (error) {
        console.error('Failed to generate title:', error);
        return null;
    }
}

// Modified sendMessage wrapper to handle title suggestion better
const originalSendMessage = sendMessage;
sendMessage = async (message, retryCount = 0) => {
    await originalSendMessage(message, retryCount);
    
    if (currentConversationId) {
        const conversation = conversations.find(c => c.id === currentConversationId);
        if (conversation) {
            // Update messages
            conversation.messages = Array.from(chatMessages.children)
                .filter(el => el.classList.contains('message'))
                .map(el => ({
                    content: el.textContent,
                    sender: el.classList.contains('user-message') ? 'user' : 'bot',
                    timestamp: Date.now()
                }))
                .filter(msg => !msg.content.includes('typing-indicator')); // Filter out typing indicators
            
            // Try to suggest title after 2 exchanges (4 messages including bot responses)
            if (conversation.title === 'New Conversation' && conversation.messages.length >= 4) {
                const suggestedTitle = await suggestConversationTitle(conversation.messages);
                if (suggestedTitle) {
                    renameConversation(currentConversationId, suggestedTitle);
                }
            }
            
            saveConversations();
            updateConversationManager();
        }
    }
};

function renameConversation(id, newTitle) {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
        conversation.title = newTitle;
        saveConversations();
        updateConversationManager();
        window.notifications.success('Conversation renamed', 'CONV004');
    }
}

// Event listeners for conversation management
document.getElementById('new-conversation-btn')?.addEventListener('click', () => {
    createNewConversation();
    updateConversationManager();
    document.getElementById('conversation-manager').classList.remove('active');
});

document.getElementById('close-manager')?.addEventListener('click', () => {
    document.getElementById('conversation-manager').classList.remove('active');
});

// Initialize first conversation if none exists
if (conversations.length === 0) {
    createNewConversation();
} else {
    updateConversationManager();
}

// Replace the conversation management section with this improved version
function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

// Update loadConversation to handle NLPCloud format
function loadConversation(id) {
    const conversation = conversations.find(c => c.id === id);
    if (!conversation) return;

    currentConversationId = id;
    clearChat();
    
    // Reset conversation history to NLPCloud format
    conversationHistory = conversation.messages.reduce((history, msg, i, arr) => {
        if (msg.sender === 'user' && i + 1 < arr.length && arr[i + 1].sender === 'bot') {
            history.push({
                input: msg.content,
                response: arr[i + 1].content
            });
        }
        return history;
    }, []);
    
    // Add messages to UI
    conversation.messages.forEach(msg => {
        addMessage(msg.content, msg.sender, msg.sender === 'bot');
    });
    
    scrollToBottom(false);
    
    document.getElementById('conversation-manager').classList.remove('active');
    window.notifications.info('Loaded conversation', 'CONV002');
}

// Add this utility function before updateConversationManager
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")  // Fix: Changed /"//g to /"/g
        .replace(/'/g, "&#039;");
}

function updateConversationManager() {
    const list = document.getElementById('conversation-list');
    list.innerHTML = conversations.map(conv => `
        <div class="conversation-item ${conv.id === currentConversationId ? 'active' : ''}" data-id="${conv.id}">
            <div class="conversation-info">
                <div class="conversation-title">${escapeHtml(conv.title)}</div>
                <div class="conversation-meta">
                    ${conv.messages.length} messages · ${new Date(parseInt(conv.id)).toLocaleDateString()}
                </div>
            </div>
            <div class="conversation-actions">
                <button class="conversation-action-btn rename" data-id="${conv.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="conversation-action-btn delete" data-id="${conv.id}" 
                    ${conversations.length <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    list.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => loadConversation(item.dataset.id));
    });

    list.querySelectorAll('.rename').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const conv = conversations.find(c => c.id === btn.dataset.id);
            const newTitle = prompt('Enter new conversation title:', conv.title);
            if (newTitle && newTitle.trim()) {
                renameConversation(conv.id, newTitle.trim());
                updateConversationManager();
            }
        });
    });

    list.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (conversations.length <= 1) return;
            
            if (confirm('Are you sure you want to delete this conversation?')) {
                const index = conversations.findIndex(c => c.id === btn.dataset.id);
                conversations = conversations.filter(c => c.id !== btn.dataset.id);
                
                if (btn.dataset.id === currentConversationId) {
                    currentConversationId = conversations[Math.min(index, conversations.length - 1)].id;
                    loadConversation(currentConversationId);
                }
                
                saveConversations();
                updateConversationManager();
                window.notifications.info('Conversation deleted', 'CONV005');
            }
        });
    });
}

// Update event listeners
document.getElementById('close-manager')?.addEventListener('click', () => {
    document.getElementById('conversation-manager').classList.remove('active');
});

document.getElementById('new-conversation-btn')?.addEventListener('click', () => {
    createNewConversation();
    updateConversationManager();
    document.getElementById('conversation-manager').classList.remove('active');
});

// Add search functionality
document.querySelector('.search-conversations')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.conversation-item').forEach(item => {
        const title = item.querySelector('.conversation-title').textContent.toLowerCase();
        item.style.display = title.includes(searchTerm) ? 'flex' : 'none';
    });
});

// Load conversations on startup
window.addEventListener('load', () => {
    conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    if (conversations.length === 0) {
        createNewConversation();
    } else {
        currentConversationId = conversations[0].id;
        loadConversation(currentConversationId);
    }
});

// Add clearChat function
function clearChat() {
    while (chatMessages.firstChild) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}

// Replace the conversation bar markup with a single manager button
function updateChatHeader() {
    const existingBar = document.querySelector('.conversation-bar');
    if (existingBar) existingBar.remove();
    
    const managerBtn = document.createElement('button');
    managerBtn.className = 'conversation-manager-btn';
    managerBtn.innerHTML = '<i class="fas fa-bars"></i> Conversations';
    managerBtn.addEventListener('click', () => {
        document.getElementById('conversation-manager').classList.add('active');
        updateConversationManager();
    });
    
    chatMessages.parentElement.insertBefore(managerBtn, chatMessages);
}

// Update the initialization code
window.onload = async () => {
    const submitButton = document.getElementById('submit-access-key');
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            const inputKey = document.getElementById('access-key-input').value.trim();
            if (inputKey && VALID_ACCESS_KEYS.includes(inputKey)) {
                accessKey = inputKey;
                localStorage.setItem('astroAccessKey', inputKey);
                document.getElementById('access-key-modal').classList.remove('active');
                document.getElementById('app-container').style.display = 'block';
                
                updateChatHeader();
                addMessage("👋 Hi! I'm Astro AI. What would you like to know?", 'bot', true);
                addSuggestions();
                
                if (conversations.length === 0) {
                    createNewConversation();
                }
            } else {
                window.notifications.error('Invalid access key', 'ACCESS002');
            }
        });
    }
    
    if (checkAccessKey()) {
        document.getElementById('app-container').style.display = 'block';
        updateChatHeader();
        
        conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        if (conversations.length === 0) {
            createNewConversation();
        } else {
            currentConversationId = conversations[0].id;
            loadConversation(currentConversationId);
        }
        
        addMessage("👋 Hi! I'm Astro AI. What would you like to know?", 'bot', true);
        addSuggestions();
    }
};

// Remove old conversation select event listeners
// ...existing code...

// Context Menu Implementation
const contextMenu = document.getElementById('context-menu');
let activeMessage = null;

document.addEventListener('contextmenu', (e) => {
    const messageElement = e.target.closest('.message');
    if (messageElement) {
        e.preventDefault();
        activeMessage = messageElement;
        showContextMenu(e.clientX, e.clientY);
    }
});

document.addEventListener('click', () => {
    hideContextMenu();
});

function showContextMenu(x, y) {
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    
    // Adjust position if menu goes outside viewport
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = `${window.innerWidth - rect.width - 5}px`;
    }
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = `${window.innerHeight - rect.height - 5}px`;
    }
    
    contextMenu.classList.add('active');
}

function hideContextMenu() {
    contextMenu.classList.remove('active');
    activeMessage = null;
}

// Context Menu Actions
document.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        
        if (activeMessage) {
            switch (action) {
                case 'copy':
                    copyMessageContent(activeMessage);
                    break;
                case 'quote':
                    quoteMessage(activeMessage);
                    break;
                case 'select':
                    selectMessageText(activeMessage);
                    break;
                case 'read':
                    readMessageAloud(activeMessage);
                    break;
            }
        }
        
        hideContextMenu();
    });
});

function copyMessageContent(messageElement) {
    const content = messageElement.innerText;
    navigator.clipboard.writeText(content).then(() => {
        window.notifications.success('Message copied to clipboard', 'COPY001');
    }).catch(() => {
        window.notifications.error('Failed to copy message', 'COPY002');
    });
}

function quoteMessage(messageElement) {
    if (!messageElement.classList.contains('bot-message')) return;
    
    const content = messageElement.innerText;
    const quotedText = content.length > 150 ? content.substring(0, 150) + '...' : content;
    
    const quoteWrapper = document.createElement('div');
    quoteWrapper.classList.add('quote-content');
    quoteWrapper.textContent = quotedText;
    
    userInput.focus();
    userInput.value = '';
    
    const lastMessage = chatMessages.lastElementChild;
    if (lastMessage && lastMessage.classList.contains('suggestions')) {
        lastMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'user-message', 'quote-reference');
    messageDiv.appendChild(quoteWrapper);
    chatMessages.appendChild(messageDiv);
    
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    messageElement.classList.add('highlighted');
    setTimeout(() => messageElement.classList.remove('highlighted'), 2000);
}

function selectMessageText(messageElement) {
    const range = document.createRange();
    range.selectNodeContents(messageElement);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function readMessageAloud(messageElement) {
    const text = messageElement.innerText;
    
    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
        window.notifications.error('Text-to-speech not supported in this browser', 'TTS001');
        return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
        messageElement.style.opacity = '0.7';
        window.notifications.info('Reading message...', 'TTS002');
    };
    
    utterance.onend = () => {
        messageElement.style.opacity = '1';
    };
    
    utterance.onerror = () => {
        messageElement.style.opacity = '1';
        window.notifications.error('Failed to read message', 'TTS003');
    };
    
    window.speechSynthesis.speak(utterance);
}

// Add this helper function after the other utility functions
function scrollToBottom(smooth = true) {
    const scrollOptions = {
        top: chatMessages.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
    };
    chatMessages.scrollTo(scrollOptions);
}

// ...rest of existing code...
