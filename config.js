export const config = {
    NLP_CLOUD_MODEL: 'finetuned-llama-3-70b',
    NLP_CLOUD_TOKEN: '8c066055d1036fe83e7748c722a7fbfaf518e9ef',
    TOKEN_LIMITS: {
        'development': { tokens: 15000, refreshHours: 5 },
        'admin': { tokens: 12000, refreshHours: 5 },
        'moderator': { tokens: 10000, refreshHours: 5 },
        'premium': { tokens: 8000, refreshHours: 5 },
        'basic': { tokens: 5000, refreshHours: 5 },
        'trial': { tokens: 3000, refreshHours: 5 },
        'beta': { tokens: 6000, refreshHours: 5 }
    },
    ACCESS_KEYS: {
        'ASTRO-DEV-2025': {
            type: 'development',
            permissions: ['all']
        },
        'ASTRO-BETA-2025': {
            type: 'beta',
            permissions: ['chat', 'history']
        },
        'xAv7K9p2QmN5fL3r': {
            type: 'admin',
            permissions: ['all', 'system', 'debug']
        },
        'Jh8tWs4vE9nY2xD5': {
            type: 'moderator',
            permissions: ['chat', 'history', 'manage_users']
        },
        'bR5kM3pL9wZ7vX4n': {
            type: 'premium',
            permissions: ['chat', 'history', 'templates', 'export']
        },
        'gT2cN8qA6yU4mH9j': {
            type: 'basic',
            permissions: ['chat', 'history_limited']
        },
        'eF9dV5hJ3kP8mW2s': {
            type: 'trial',
            permissions: ['chat']
        }
    }
};

export default config;