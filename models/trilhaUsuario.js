const mongoose = require("mongoose");

const TrilhaUsuario = new mongoose.Schema({
    trilhaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trilha',
        required: true
    },
    usuarioId: {
        type: Number, 
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['para ler', 'em andamento', 'pausada', 'concluída'],
        default: 'para ler'
    },
    dataInicio: {
        type: Date,
        default: Date.now
    },
    dataConclusao: {
        type: Date,
        required: false
    },
    xpGanho: {
        type: Number,
        required: false,
        default: 0
    }
});

TrilhaUsuario.index(
    { trilhaId: 1, usuarioId: 1 },
    { unique: true } 
);

module.exports = mongoose.model("TrilhaUsuario", TrilhaUsuario, "TrilhaUsuario");