const config = {
    AUTH0_DOMAIN: 'auth.novawerks.xxavvgroup.com',
    AUTH0_CLIENT_ID: 'RGfDMp59V4UhqLIBZYwVZqHQwKly3lQ3',
    AUTH0_CALLBACK_URL: window.location.origin,
    HUGGING_FACE_API_KEY: process.env.HUGGING_FACE_TOKEN
};

// Make config available globally
window.config = config;

module.exports = config;