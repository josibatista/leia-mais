const mongoose = require("mongoose");

const Obra = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: true
    },
    autor: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: false
    },
    link: {
        type: String,
        required: false
    }
});
module.exports = mongoose.model("Obra", Obra);