const db = require('../config/db_sequelize');

module.exports = {
    async postLivro(req, res) {
        try {
           const { titulo, descricao, editora, anoPublicacao, genero, imagemCapa } = req.body;

           if (!titulo) {
            return res.status(422).json({error: 'O campo título é obrigatório'});
           } else {
            const tituloExistente = await db.Livro.findOne({ where: {titulo } })
             if (tituloExistente) {
                return res.status(400).json({ error: 'Título já cadastrado' });
             }
           }

           if (!genero) {
            return res.status(422).json({error: 'O campo gênero é obrigatório'});
           }

           if (!editora) {
            return res.status(422).json({error: 'O campo editora é obrigatório'});
           }

           const livro = await db.Livro.create({
                titulo,
                descricao,
                editora,
                anoPublicacao,
                genero,
                imagemCapa
            });

           res.status(201).json(livro);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar livro' });
        }
    }
}        
