const mongoose = require("mongoose");

const Trilha = new mongoose.Schema({
    tema: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: false
    },
    nivelDificuldade: {
        type: Number,
        enum: {
            values: [1, 2, 3, 4, 5]
        },
        required: true
    },
    xp: {
        type: Number,
        required: true
    },
    liberada: {
        type: Boolean,
        required: false
    }
});
module.exports = mongoose.model("Trilha", Trilha, "Trilha");