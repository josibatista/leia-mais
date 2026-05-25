const db = require('../config/db_sequelize');

module.exports = {

    // Listar autores disponíveis (para o select)
    async getAutoresDisponiveis(req, res) {
        try {
            const autores = await db.Autor.findAll({
                attributes: ['id', 'nome'],
                order: [['nome', 'ASC']]
            });

            if (autores.length === 0) {
                return res.status(200).json({ 
                    message: 'Nenhum autor disponível',
                    autores: [] 
                });
            }

            res.status(200).json({ autores });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao consultar autores' });
        }
    },

    // Vincular 1 ou mais autores a um livro
    async vincularAutores(req, res) {
        try {
            const { id } = req.params;         // livroId
            const { autoresIds } = req.body;   // array de ids: [1, 2, 3]

            if (!autoresIds || !Array.isArray(autoresIds) || autoresIds.length === 0) {
                return res.status(422).json({ error: 'Informe ao menos um autor' });
            }

            const livro = await db.Livro.findByPk(id);
            if (!livro) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }

            // Verifica se todos os autoresIds existem
            const autores = await db.Autor.findAll({
                where: { id: autoresIds }
            });

            if (autores.length !== autoresIds.length) {
                return res.status(404).json({ error: 'Um ou mais autores não encontrados' });
            }

            // addAutors gerado automaticamente pelo belongsToMany
            // não duplica se já existir o vínculo
            await livro.addAutores(autores);

            const livroAtualizado = await db.Livro.findByPk(id, {
                include: [{ 
                    model: db.Autor, 
                    as: 'autores',              
                    attributes: ['id', 'nome'] 
                }]
            });

            res.status(200).json({
                message: 'Autores vinculados com sucesso',
                livro: livroAtualizado
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao vincular autores' });
        }
    },

    // Listar autores vinculados a um livro
    async getAutoresDoLivro(req, res) {
        try {
            const { id } = req.params;

            const livro = await db.Livro.findByPk(id, {
                include: [{
                    model: db.Autor,
                    as: 'autores',              
                    attributes: ['id', 'nome', 'biografia'],
                    through: { attributes: [] }
                }]
            });

            if (!livro) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }

            if (livro.autores.length === 0) {
                return res.status(200).json({ 
                    message: 'Nenhum autor vinculado a este livro',
                    autores: []
                });
            }

            res.status(200).json({ autores: livro.autores });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao consultar autores do livro' });
        }
    },

    async getLivrosDoAutor(req, res) {
        try {
            const { id } = req.params;

            const autor = await db.Autor.findByPk(id, {
                include: [{
                    model: db.Livro,
                    as: 'livros',
                    attributes: ['id', 'titulo', 'editora', 'anoPublicacao', 'genero'],
                    through: { attributes: [] } // oculta campos da tabela pivot
                }]
            });

            if (!autor) {
                return res.status(404).json({ error: 'Autor não encontrado' });
            }

            if (autor.livros.length === 0) {
                return res.status(200).json({
                    message: 'Nenhum livro vinculado a este autor',
                    livros: []
                });
            }

            res.status(200).json({ livros: autor.livros });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao consultar livros do autor' });
        }
    },

    // Desvincular autor de um livro
    async desvincularAutor(req, res) {
        try {
            const { id, autorId } = req.params;

            const livro = await db.Livro.findByPk(id);
            if (!livro) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }

            const autor = await db.Autor.findByPk(autorId);
            if (!autor) {
                return res.status(404).json({ error: 'Autor não encontrado' });
            }

            const vinculo = await db.LivroAutor.findOne({
                where: { livroId: id, autorId }
            });

            if (!vinculo) {
                return res.status(404).json({ error: 'Vínculo não encontrado' });
            }

            await livro.removeAutores(autor);

            res.status(200).json({ message: 'Autor desvinculado com sucesso' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao desvincular autor' });
        }
    }

}