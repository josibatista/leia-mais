require('dotenv').config();
const express = require('express');
const db = require('./config/db_sequelize');

const app = express();
app.use(express.json());

const livroRoutes = require('./routes/route');
app.use(livroRoutes);

const PORT = process.env.PORT || 3000;

db.sequelize.authenticate()
    .then(() => {
        console.log('Banco de dados conectado.');
        return db.sequelize.sync({ alter: false });
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Erro ao conectar no banco:', err);
    });