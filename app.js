console.log('Iniciando servidor...');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db_sequelize');
const mongo_db = require('./config/db_mongoose');
const routes = require('./routes/route'); 

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

const PORT = process.env.PORT || 8080;

db.sequelize.authenticate()
    .then(() => {
        console.log('Banco de dados Supabase conectado.');
        return db.sequelize.sync({ alter: false });
    })
    .then(() => {
        return mongo_db.connection;
    })
    .then(() => {
        console.log('Banco de Dados MongoDB conectado.');
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    })
    .catch((erro) => {
        console.error('Erro ao conectar no banco ou iniciar o servidor:', erro);
    });