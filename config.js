require('dotenv').config();

const config = {
    hfToken: process.env.HUGGING_FACE_TOKEN,
    AUTH0_DOMAIN: 'auth.novawerks.xxavvgroup.com',
    AUTH0_CLIENT_ID: 'RGfDMp59V4UhqLIBZYwVZqHQwKly3lQ3',
    AUTH0_CALLBACK_URL: window.location.origin
};

module.exports = config;