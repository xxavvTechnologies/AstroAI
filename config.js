export const config = {
    NLP_CLOUD_MODEL: 'finetuned-llama-3-70b',
    NLP_CLOUD_TOKEN: '8c066055d1036fe83e7748c722a7fbfaf518e9ef',
    ACCESS_KEYS: {
        'ASTRO-DEV-2025': {
            type: 'development',
            permissions: ['all']
        },
        'ASTRO-BETA-2025': {
            type: 'beta',
            permissions: ['chat', 'history']
        }
    }
};

export default config;