const axios = require('axios');

exports.handler = async function(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: 'Method Not Allowed'
    };
  }

  try {
    const { query, maxResults = 3 } = JSON.parse(event.body);
    
    // Try DuckDuckGo HTML search first
    try {
      const response = await axios.get(`https://html.duckduckgo.com/html/`, {
        params: { q: query },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const html = response.data;
      const results = extractResults(html, maxResults);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(results)
      };
    } catch (htmlError) {
      // Fallback to DuckDuckGo API
      const fallbackResponse = await axios.get(`https://api.duckduckgo.com/`, {
        params: {
          q: query,
          format: 'json'
        }
      });

      const results = fallbackResponse.data.RelatedTopics
        .slice(0, maxResults)
        .map(topic => ({
          title: topic.Text?.split(' - ')[0] || '',
          snippet: topic.Text || '',
          url: topic.FirstURL || ''
        }));

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(results)
      };
    }
  } catch (error) {
    console.error('Search error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to perform search',
        details: error.message
      })
    };
  }
};

function extractResults(html, maxResults) {
  // Simple HTML parsing using regex (for demo purposes)
  // In production, use a proper HTML parser
  const results = [];
  const resultRegex = /<div class="result">.*?<a class="result__title".*?>(.*?)<\/a>.*?<a class="result__snippet".*?>(.*?)<\/a>.*?<a class="result__url".*?>(.*?)<\/a>/gs;
  
  let match;
  while ((match = resultRegex.exec(html)) !== null && results.length < maxResults) {
    const [_, title, snippet, url] = match;
    results.push({
      title: cleanText(title),
      snippet: cleanText(snippet),
      url: cleanText(url)
    });
  }
  
  return results;
}

function cleanText(text) {
  return text
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .trim();
}
