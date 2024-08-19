const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());

app.use(express.json());

app.post('/predict', async (req, res) => {
    console.log('Recebida solicitação para /predict');
    console.log('Corpo da solicitação:', req.body);
    res.json({ choices: [{ text: '0,1' }] });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/data', (req, res) => {
    res.json({ message: 'Dados de exemplo' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});