const mongoose = require("mongoose");

const Trilha = new mongoose.Schema({
    tema: {
        type: String,
        required: true
    },
    nivelDificuldade: {
        type: Number,
        required: true
    },
    xp: {
        type: Number,
        required: true
    },
    liberada: {
        type: Boolean,
        required: true
    }
});
module.exports = mongoose.model("Trilha", Trilha, "Trilha");