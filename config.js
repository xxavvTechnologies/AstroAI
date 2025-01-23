const config = {
    // Use environment variables or fallback to empty string
    HUGGING_FACE_API_KEY: '', // DO NOT put API key here
    AUTH0_DOMAIN: 'auth.novawerks.xxavvgroup.com',
    AUTH0_CLIENT_ID: 'RGfDMp59V4UhqLIBZYwVZqHQwKly3lQ3',
    AUTH0_CALLBACK_URL: window.location.origin
};

// Try to load API key from environment if available
if (typeof process !== 'undefined' && process.env) {
    config.HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_TOKEN || '';
}

// Function to set API key at runtime
config.setApiKey = function(key) {
    this.HUGGING_FACE_API_KEY = key;
};

// Make config available globally
window.config = config;

module.exports = config;