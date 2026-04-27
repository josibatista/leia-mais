const { Op } = require('sequelize');
const db = require('../config/db_sequelize');

module.exports = {
    async postLivro(req, res) {
        try {
           let { titulo, descricao, editora, anoPublicacao, genero, imagemCapa } = req.body;

           titulo = titulo?.trim();
           descricao = descricao?.trim();
           editora = editora?.trim();
           genero = genero?.trim();
           imagemCapa = imagemCapa?.trim();

           if (!titulo) {
            return res.status(422).json({error: 'O campo título é obrigatório'});
           } else {
            const tituloExistente = await db.Livro.findOne({ 
                where: { 
                    titulo: { 
                        [Op.iLike]: titulo 
                    } 
                } 
            });
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
    },
    async putLivro(req, res) {
        try {
            const { id } = req.params;
            let { titulo, descricao, anoPublicacao, editora, genero, imagemCapa } = req.body;

            titulo = titulo?.trim();
            descricao = descricao?.trim();
            editora = editora?.trim();
            genero = genero?.trim();
            imagemCapa = imagemCapa?.trim();

            const idExistente = await db.Livro.findOne({ where: { id } });
            if (!idExistente) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }

            if (titulo === '') {
                return res.status(422).json({ error: 'O campo título não pode ser vazio' });
            }

            if (titulo !== undefined && titulo !== idExistente.titulo.trim()) {
                const tituloExistente = await db.Livro.findOne({ 
                    where: { 
                        titulo: { 
                            [Op.iLike]: titulo 
                        },
                        id: { 
                            [Op.ne]: id 
                        }
                    } 
                });
                if (tituloExistente) {
                    return res.status(400).json({ error: 'Título já cadastrado' });
                }
            }

            if (genero === '') {
                return res.status(422).json({ error: 'O campo gênero não pode ser vazio' });
            }

            if (editora === '') {
                return res.status(422).json({ error: 'O campo editora não pode ser vazio' });
            }

            await db.Livro.update({ 
                titulo, 
                descricao, 
                editora,
                anoPublicacao, 
                genero, 
                imagemCapa 
            },{ 
                where: { id } 
            });

            const livroAtualizado = await db.Livro.findOne({ where: { id } });
            res.status(200).json(livroAtualizado);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar livro' });
        }
    },
    async deleteLivro(req, res) {
        try {
            const { id } = req.params;

            const idExistente = await db.Livro.findOne({ where: { id } });
            if (!idExistente) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }

            await db.Livro.destroy({ where: { id } });

            res.status(200).json({ 
                message: 'Livro deletado com sucesso',
                livroId: idExistente.id
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar livro' });
        }
    }
}