const mongoose = require("mongoose");
const dns = require("node:dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]); 

const mongo = {};

mongo.connection = mongoose.connect(process.env.MONGO_DB_URL);

mongo.Obra = require('../models/Obra');
mongo.Trilha = require('../models/Trilha');
mongo.ObraTrilha = require('../model/ObraTrilha');

module.exports = mongo;