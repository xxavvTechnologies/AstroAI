const NLPCloudClient = require('nlpcloud');

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
    // Initialize NLPCloud client with Node.js syntax
    const client = new NLPCloudClient({
      model: 'finetuned-llama-3-70b',
      token: process.env.NLP_CLOUD_TOKEN || '8c066055d1036fe83e7748c722a7fbfaf518e9ef',
      gpu: true
    });

    const body = JSON.parse(event.body);
    
    // Improve search results processing
    let enhancedContext = body.context;
    if (body.searchResults && body.searchResults.length > 0) {
        const searchContext = body.searchResults
            .map((r, i) => `[Reference ${i + 1}]
Title: "${r.title.trim()}"
Summary: ${r.snippet.trim()}
Source: ${r.url}
---`).join('\n\n');
        
        // Add search results to context with better integration instructions
        enhancedContext = `${body.context}

Based on the user's question, I've found these relevant sources:

${searchContext}

Please incorporate relevant information from these sources in your response when applicable. 
If you use information from a source, cite it as [Reference X]. 
If the search results aren't relevant to the question, ignore them and answer based on your knowledge.

User's question: "${body.message}"`;
    }

    const response = await client.chatbot({
        input: body.message,
        context: enhancedContext,
        history: body.history,
        options: {
            temperature: 0.7,
            max_length: 4000,
            remove_input_from_output: true
        }
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('NLPCloud Error:', error);
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};