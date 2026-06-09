const mongoose = require("mongoose");

const TrilhaUsuarioObra = new mongoose.Schema({
    usuarioId: {
        type: Number,
        required: true
    },
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
    concluida: {
        type: Boolean,
        required: true,
        default: false
    },
    dataConclusao: {
        type: Date,
        required: false
    }
});

TrilhaUsuarioObra.index(
    { usuarioId: 1, trilhaId: 1, obraId: 1 },
    { unique: true }
);

module.exports = mongoose.model("TrilhaUsuarioObra", TrilhaUsuarioObra, "TrilhaUsuarioObra");