const mongoose = require("mongoose");

const Obra = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: true,
        enum: [
            'Antologia',
            'Artigo',
            'Autobiografia',
            'Biografia',
            'Carta',
            'Coletânea',
            'Conto',
            'Crônica',
            'Diário',
            'Ensaio',
            'Literatura infantil',
            'Literatura juvenil',
            'Livro',
            'Memórias',
            'Novela',
            'Peça teatral',
            'Poema',
            'Poesia',
            'Quadrinho / HQ',
            'Resenha',
            'Outro'
        ]
    },
    autores: [{
        type: Number,
        required: true
    }],
    descricao: {
        type: String,
        required: false
    }
});
module.exports = mongoose.model("Obra", Obra, "Obra");