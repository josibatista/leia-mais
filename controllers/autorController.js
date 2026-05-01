const { Op } = require('sequelize');
const db = require('../config/db_sequelize');

module.exports = {

    async postAutor(req, res) {
        try {
            let { biografia, nome } = req.body;

            biografia = biografia?.trim();
            nome = nome?.trim();

            if (!nome) {
                return res.status(422).json({ error: 'O campo nome é obrigatório' });
            }

            const nomeAutorExistente = await db.Autor.findOne({
                where: {
                    nome: {
                        [Op.iLike]: nome
                    }
                }
            });

            if (nomeAutorExistente) {
                return res.status(400).json({ error: 'Autor já cadastrado' });
            }

            const autor = await db.Autor.create({
                biografia,
                nome
            });

            res.status(201).json({
                message: 'Autor criado com sucesso',
                autor
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar autor' });
        }
    }
}