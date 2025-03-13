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

    const response = await client.chatbot({
      input: body.message,
      context: body.context,
      history: body.history
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