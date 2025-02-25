const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.textsynth.com/v1/engines/llama3.1_8B_instruct/chat',
      headers: {
        'Authorization': `Bearer ${process.env.TEXTSYNTH_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: JSON.parse(event.body)
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};