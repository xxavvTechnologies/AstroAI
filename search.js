const SEARCH_PROVIDERS = {
    ddg: 'https://api.duckduckgo.com',
    wiki: 'https://en.wikipedia.org/w/api.php'
};

export async function safeSearch(query, maxResults = 3) {
    try {
        // Use DuckDuckGo's API for safer, more private searches
        const response = await fetch(`${SEARCH_PROVIDERS.ddg}/?q=${encodeURIComponent(query)}&format=json`);
        const data = await response.json();
        
        // Filter and limit results
        return data.RelatedTopics
            .slice(0, maxResults)
            .map(topic => ({
                title: topic.Text?.split(' - ')[0] || '',
                snippet: topic.Text || '',
                url: topic.FirstURL || ''
            }));
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}
