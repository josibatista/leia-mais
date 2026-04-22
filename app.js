require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db_sequelize');
const routes = require('./routes/route');

const app = express();

db.sequelize.sync()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.listen(8080, function(){
  console.log("Servidor no http://localhost:8080");
})
