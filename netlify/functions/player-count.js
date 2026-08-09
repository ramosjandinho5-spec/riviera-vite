const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const apiUrl = 'http://198.1.195.241:30120/players.json';

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Permite que qualquer site acesse
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Erro na função player-count:", error); // Adicionado log de erro
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch player count', details: error.message }),
    };
  }
};