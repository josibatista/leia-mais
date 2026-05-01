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
    },
    async putAutor(req, res) {
        try {
            const id = req.params.id;
            let { biografia, nome } = req.body;

            biografia = biografia?.trim();
            nome = nome?.trim();

            const autor = await db.Autor.findByPk(id);
            if (!autor) {
                return res.status(404).json({ error: 'Autor não encontrado' });
            }

            if (nome === '') {
                return res.status(422).json({ error: 'O campo nome não pode ser vazio' });
            }

            if (nome !== undefined && nome !== autor.nome?.trim()) {
                const nomeAutorExistente = await db.Autor.findOne({
                    where: {
                        nome: {
                            [Op.iLike]: nome
                        },
                        id: {
                            [Op.ne]: id
                        }
                    }
                });

                if (nomeAutorExistente) {
                    return res.status(400).json({ error: 'Nome já cadastrado' });
                }
            }

            await db.Autor.update({
                biografia,
                nome
            }, {
                where: { id }
            });

            const autorAtualizado = await db.Autor.findByPk(id);

            res.status(200).json({
                message: 'Autor atualizado com sucesso',
                autorAtualizado
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar autor' });
        }
    }
}