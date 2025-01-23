const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

const SYSTEM_INSTRUCTIONS = `You are Astro AI, an advanced AI assistant created by NovaAI & xxavvTechnologies. While you have special expertise in science, technology, and astronomy, you're a versatile assistant capable of helping with any topic.

Key traits:
- Knowledgeable across all subjects
- Creative and thoughtful in responses
- Able to explain complex topics simply
- Friendly and conversational
- Honest about limitations
- Focused on providing accurate information

You can:
- Answer questions on any topic
- Help with analysis and problem-solving
- Provide code examples with explanations
- Assist with writing and editing
- Engage in casual conversation
- Share knowledge about space, science, and beyond

Format your responses using markdown when appropriate:
- Use code blocks with language tags
- Create structured lists and tables
- Add emphasis for important points
- Include helpful links when relevant

Remember: While space and technology are your specialties, you're a general-purpose assistant ready to help with any task.`;

// Store conversation history
let conversationHistory = [];

// Initialize with system instructions
conversationHistory.push({
    role: "system",
    content: SYSTEM_INSTRUCTIONS
});

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

async function sendMessage(message, retryCount = 0) {
    if (!window.auth.isAuthenticated()) {
        window.notifications.error('Please login to continue', 'AUTH001');
        document.getElementById('auth-modal').classList.add('active');
        return;
    }
    
    if (!message.trim()) {
        window.notifications.warning('Please enter a message', 'INPUT001');
        return;
    }
    
    addMessage(message, 'user');
    userInput.value = '';
    userInput.disabled = true;

    const typingIndicator = addTypingIndicator();
    
    try {
        // Format conversation for context
        conversationHistory.push({
            role: "user",
            content: message
        });

        // Create conversation prompt
        const contextPrompt = `${SYSTEM_INSTRUCTIONS}\n\nConversation:\n` + 
            conversationHistory
                .filter(msg => msg.role !== "system")
                .slice(-6) // Keep last 6 messages for context
                .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
                .join('\n') + '\nAssistant:';
        
        const response = await fetch('https://api-inference.huggingface.co/models/google/gemma-2-2b-it', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.HUGGING_FACE_API_KEY}`
            },
            body: JSON.stringify({
                inputs: contextPrompt,
                parameters: {
                    max_new_tokens: 800, // Increased from 250
                    temperature: 0.7,
                    top_p: 0.95,
                    do_sample: true,
                    return_full_text: false,
                    repetition_penalty: 1.2
                }
            })
        });

        if (!response.ok) {
            const errorCodes = {
                401: 'API001',
                429: 'API002',
                500: 'API003',
                503: 'API004'
            };
            throw new Error(`API error: ${response.status}|${errorCodes[response.status] || 'API000'}`);
        }

        const data = await response.json();
        typingIndicator.remove();
        
        let botResponse;
        if (Array.isArray(data) && data[0] && typeof data[0].generated_text === 'string') {
            botResponse = data[0].generated_text.trim();
            
            if (botResponse.length < 1) {
                throw new Error('Empty response');
            }

            // Add bot response to history
            conversationHistory.push({
                role: "assistant",
                content: botResponse
            });
        } else {
            throw new Error('Unexpected response format');
        }
        
        addMessage(botResponse, 'bot', true);
        
        // Highlight code blocks
        setTimeout(() => {
            Prism.highlightAllUnder(messageDiv);
            addCopyButtons();
        }, 100);
        
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        
        const [errorMessage, errorCode] = error.message.split('|');
        
        if (retryCount < RETRY_ATTEMPTS && isRetryableError(error)) {
            window.notifications.warning('Retrying request...', 'RETRY001');
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return sendMessage(message, retryCount + 1);
        }
        
        window.notifications.error(
            'Failed to get response. Please try again.',
            errorCode || 'ERR000'
        );
        addMessage('Sorry, I encountered an error. Please try again.', ['bot', 'error']);
    } finally {
        userInput.disabled = false;
        userInput.focus();
    }
}

function addMessage(text, sender, parseMarkdown = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    // Handle sender parameter as either string or array
    if (Array.isArray(sender)) {
        sender.forEach(className => messageDiv.classList.add(className));
    } else {
        messageDiv.classList.add(`${sender}-message`);
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
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
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
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
    "Tell me about black holes",
    "Help me debug this code",
    "Explain quantum computing",
    "Write a creative story",
    "Give me life advice",
    "Teach me something new"
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

// Update window.onload to handle auth initialization
window.onload = async () => {
    try {
        // Wait for Auth0 to initialize
        await window.auth.init();
        
        if (!window.auth.isAuthenticated()) {
            document.getElementById('auth-modal').classList.add('active');
            document.getElementById('app-container').style.display = 'none';
            
            // Setup login button
            document.getElementById('auth0-login').addEventListener('click', () => {
                window.auth.login();
            });
            return;
        }

        // User is authenticated, show app
        document.getElementById('auth-modal').classList.remove('active');
        document.getElementById('app-container').style.display = 'block';

        // Initialize chat
        addMessage("👋 Hi! I'm Astro AI. What would you like to know?", 'bot', true);
        addSuggestions();

        if (conversations.length === 0) {
            createNewConversation();
        } else {
            updateConversationSelect();
        }

    } catch (err) {
        console.error("Error initializing app:", err);
        addMessage('Error initializing the application. Please try again.', ['bot', 'error']);
    }
};

// Terms modal functionality
const termsModal = document.getElementById('terms-modal');
const termsCheckbox = document.getElementById('terms-checkbox');
const acceptTermsButton = document.getElementById('accept-terms');
const conversationSelect = document.getElementById('conversation-select');
const newChatBtn = document.getElementById('new-chat-btn');
const deleteChatBtn = document.getElementById('delete-chat-btn');

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
        title: `Conversation ${conversations.length + 1}`,
        messages: []
    };
    conversations.push(conversation);
    currentConversationId = id;
    saveConversations();
    updateConversationSelect();
    clearChat();
    addMessage("👋 Hi! I'm Astro AI. What would you like to know?", 'bot', true);
    addSuggestions();
    window.notifications.success('Created new conversation', 'CONV001');
}

function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

function updateConversationSelect() {
    conversationSelect.innerHTML = '<option value="">Select a conversation</option>';
    conversations.forEach(conv => {
        const option = document.createElement('option');
        option.value = conv.id;
        option.textContent = conv.title;
        option.selected = conv.id === currentConversationId;
        conversationSelect.appendChild(option);
    });
}

function clearChat() {
    chatMessages.innerHTML = '';
    conversationHistory = [{ role: "system", content: SYSTEM_INSTRUCTIONS }];
}

function loadConversation(id) {
    try {
        const conversation = conversations.find(c => c.id === id);
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        currentConversationId = id;
        clearChat();
        conversation.messages.forEach(msg => {
            addMessage(msg.content, msg.sender, msg.sender === 'bot');
        });
        window.notifications.info('Loaded conversation', 'CONV002');
    } catch (error) {
        window.notifications.error('Failed to load conversation', 'CONV003');
    }
}

// Update sendMessage function to save messages
const originalSendMessage = sendMessage;
sendMessage = async (message, retryCount = 0) => {
    await originalSendMessage(message, retryCount);
    if (currentConversationId) {
        const conversation = conversations.find(c => c.id === currentConversationId);
        if (conversation) {
            conversation.messages = Array.from(chatMessages.children)
                .filter(el => el.classList.contains('message'))
                .map(el => ({
                    content: el.textContent,
                    sender: el.classList.contains('user-message') ? 'user' : 'bot'
                }));
            saveConversations();
        }
    }
};

// Event listeners for conversation management
newChatBtn.addEventListener('click', createNewConversation);

deleteChatBtn.addEventListener('click', () => {
    if (currentConversationId) {
        conversations = conversations.filter(c => c.id !== currentConversationId);
        saveConversations();
        updateConversationSelect();
        createNewConversation();
    }
});

conversationSelect.addEventListener('change', (e) => {
    if (e.target.value) {
        loadConversation(e.target.value);
    }
});

// Initialize first conversation if none exists
if (conversations.length === 0) {
    createNewConversation();
} else {
    updateConversationSelect();
}

// Listen for messages from Nova login window
window.addEventListener('message', function(event) {
    // Verify origin
    if (event.origin !== 'https://account.nova.xxavvgroup.com') return;
    
    // Handle auth success
    if (event.data.type === 'nova-auth-success') {
        localStorage.setItem('novaToken', event.data.token);
        isAuthenticated = true;
        document.getElementById('auth-modal').classList.remove('active');
        document.getElementById('app-container').style.display = 'block';
        
        // Initialize app
        addMessage("👋 Hi! I'm Astro AI. What would you like to know?", 'bot', true);
        addSuggestions();
        if (conversations.length === 0) {
            createNewConversation();
        }
    }
});
