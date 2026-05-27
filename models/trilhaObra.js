const mongoose = require("mongoose");

const TrilhaObra = new mongoose.Schema({
    trilhaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trilha',
        required: true
    },
    obraId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Obra',
        required: true
    },
    ordem: {
        type: Number,
        required: false
    }
});

TrilhaObra.index(
    { trilhaId: 1, obraId: 1 },
    { unique: true }
);

module.exports = mongoose.model("TrilhaObra", TrilhaObra, "TrilhaObra");