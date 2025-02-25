const NLPCloudClient = require('nlpcloud');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const client = new NLPCloudClient('finetuned-llama-3-70b', process.env.NLP_CLOUD_TOKEN);
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
      body: JSON.stringify(response)
    };
  } catch (error) {
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