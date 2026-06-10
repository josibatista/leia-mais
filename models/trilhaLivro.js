const mongoose = require("mongoose");

const TrilhaLivro = new mongoose.Schema({
    trilhaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trilha',
        required: true
    },
    livroId: {
        type: Number,
        required: true
    },
    ordem: {
        type: Number,
        required: false
    }
});

TrilhaLivro.index(
    { trilhaId: 1, livroId: 1 },
    { unique: true }
);

module.exports = mongoose.model("TrilhaLivro", TrilhaLivro, "TrilhaLivro");
