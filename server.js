import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import https from 'https';

const app = express();
const port = 3001; // Porta para o nosso backend

// Configuração do CORS para permitir requisições do seu frontend
const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'https://dancing-lokum-006c3a.netlify.app'
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Agente HTTPS para ignorar a validação do certificado SSL (para certificados autoassinados)
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

const serverIp = '198.1.195.241';
const serverPort = '30120';
const playersUrl = `https://${serverIp}:${serverPort}/players.json`;
const infoUrl = `https://${serverIp}:${serverPort}/info.json`;

app.get('/api/server/status', async (req, res) => {
    try {
        // Faz as duas requisições em paralelo para mais eficiência
        const [playersResponse, infoResponse] = await Promise.all([
            fetch(playersUrl, { agent: httpsAgent, timeout: 5000 }),
            fetch(infoUrl, { agent: httpsAgent, timeout: 5000 })
        ]);

        // Verifica se ambas as requisições foram bem-sucedidas
        if (!playersResponse.ok || !infoResponse.ok) {
            // Se uma delas falhar, retorna um erro indicando que o servidor pode estar offline
            return res.status(500).json({
                online: false,
                error: 'Failed to fetch data from FiveM server. It might be offline.'
            });
        }

        const playersData = await playersResponse.json();
        const infoData = await infoResponse.json();

        // Monta o objeto de resposta final com os dados tratados
        const response = {
            online: true,
            players: Array.isArray(playersData) ? playersData.length : 0,
            maxPlayers: infoData?.vars?.sv_maxclients ? parseInt(infoData.vars.sv_maxclients, 10) : 0,
            hostname: infoData?.vars?.sv_projectName || 'N/A',
            map: infoData?.vars?.mapname || 'N/A',
            gameType: infoData?.vars?.gamename || 'N/A',
        };

        res.json(response);

    } catch (error) {
        // Captura erros de rede, timeouts, etc.
        console.error('Error fetching FiveM server status:', error);
        res.status(500).json({
            online: false,
            error: 'Internal server error while fetching FiveM status.'
        });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});