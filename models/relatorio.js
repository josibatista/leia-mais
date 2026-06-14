const mongoose = require("mongoose");

const Relatorio = new mongoose.Schema({
    numeroLivros: {
        type: Number,
        required: true
    },
    numeroAutores: {
        type: Number,
        required: true,
    },
    numeroLeituras: {
        type: Number,
        required: true
    },
    numeroUsuarios: {
        type: Number,
        required: true
    },
    numeroTrilhas: {
        type: Number,
        required: true
    },
    numeroObras: {
        type: Number,
        required: true
    },
    numeroItensConcluidos: {
        type: Number,
        required: true
    }
});
module.exports = mongoose.model("Relatorio", Relatorio, "Relatorio");