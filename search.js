const SEARCH_PROVIDERS = {
    ddg: 'https://api.duckduckgo.com',
    wiki: 'https://en.wikipedia.org/w/api.php'
};

export async function safeSearch(query, maxResults = 3) {
    try {
        const apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:8888/.netlify/functions/search'
            : '/.netlify/functions/search';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, maxResults })
        });

        if (!response.ok) {
            throw new Error(`Search failed with status ${response.status}`);
        }

        const results = await response.json();
        return results;

    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// Add a new utility function to process search results
export function processSearchContext(results) {
    if (!results || results.length === 0) return '';
    
    return results
        .map(r => `[Search Result: ${r.title}]\n${r.snippet}\nSource: ${r.url}\n`)
        .join('\n');
}
