interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export const performSearch = async (query: string): Promise<SearchResult[]> => {  try {
    // Build URL with query parameters
    const params = new URLSearchParams({
      'q': query,
      'count': '5',
      'search_lang': 'en',
      'country': 'us'
    });
    
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': process.env.REACT_APP_BRAVE_SEARCH_API_KEY || ''
      }
    });

    if (!response.ok) {
      throw new Error(`Brave Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the web search results from Brave API response
    return (data.web?.results || []).map((result: any) => ({
      title: result.title,
      link: result.url,
      snippet: result.description || ''
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};
