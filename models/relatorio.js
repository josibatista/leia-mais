const mongoose = require("mongoose");

const Relatorio = new mongoose.Schema({
    numeroLivros: {
        type: Number,
        required: false
    },
    numeroAutores: {
        type: Number,
        required: false
    },
    numeroLeituras: {
        type: Number,
        required: false
    },
    numeroUsuarios: {
        type: Number,
        required: false
    },
    numeroTrilhas: {
        type: Number,
        required: false
    },
    numeroObras: {
        type: Number,
        required: false
    },
    numeroItensConcluidos: {
        type: Number,
        required: false
    },
    paginasLidas: {
        type: Number,
        required: false
    }
});
module.exports = mongoose.model("Relatorio", Relatorio, "Relatorio");