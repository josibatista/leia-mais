const mongoose = require("mongoose");

const TrilhaUsuarioLivro = new mongoose.Schema({
    usuarioId: {
        type: Number,
        required: true
    },
    trilhaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trilha',
        required: true
    },
    livroId: {
        type: Number,
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

TrilhaUsuarioLivro.index(
    { usuarioId: 1, trilhaId: 1, livroId: 1 },
    { unique: true }
);

module.exports = mongoose.model("TrilhaUsuarioLivro", TrilhaUsuarioLivro, "TrilhaUsuarioLivro");
