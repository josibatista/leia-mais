const db = require('../config/db_sequelize');

module.exports = {
    //criar associação entre usuário e livro
    async postUsuarioLivro(req, res) {
        try {
            const { usuarioId, livroId, status, paginasLidas, nota } = req.body;
            
            //checar se o usuário autenticado é o mesmo do usuárioId ou se é admin
            if (String(req.usuario.id) !== String(req.params.id) && req.usuario.tipo !== 'administrador') {
                return res.status(403).json({ error: 'Acesso negado. Você só pode adicionar livros à sua própria lista' });
            }

            if (!usuarioId || !livroId) {
                return res.status(422).json({ error: 'Informe os campos usuarioId e livroId' });
            }

            //validar status
            const statusValido = ['para ler', 'lendo', 'lido'];
            if (status && !statusValido.includes(status)) {
                return res.status(422).json({ error: 'Status inválido. Use: para ler, lendo ou lido'});
            }

            const usuario = await db.Usuario.findByPk(usuarioId);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            const livro = await db.Livro.findByPk(livroId);
            if (!livro) {
                return res.status(404).json({ error: 'Livro não encontrado' });
            }

            const vinculoExistente = await db.UsuarioLivro.findOne({
                where: { usuarioId, livroId }
            });
            if (vinculoExistente) {
                return res.status(400).json({ error: 'Livro já adicionado à lista do usuário' });
            }

            await db.UsuarioLivro.create({ usuarioId, livroId, status, paginasLidas, nota });

            const usuarioAtualizado = await db.Usuario.findByPk(usuarioId, {
                include: [{
                    model: db.Livro,
                    as: 'livros',
                    attributes: ['id', 'titulo'],
                    through: { attributes: ['status', 'paginasLidas', 'nota'] } 
                }]
            });
            
            res.status(200).json({
                message: 'Livro vinculado ao usuário com sucesso',
                usuario: usuarioAtualizado
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao vincular livro ao usuário' });
        }
    },
    //atualizar status, páginas lidas ou nota do livro do usuário
    async putUsuarioLivro(req, res) {
        try {
            const { usuarioId, livroId } = req.params;
            const { status, paginasLidas, nota } = req.body;

            //checar se o usuário autenticado é o mesmo do usuárioId ou se é admin
            if (String(req.usuario.id) !== String(usuarioId) && req.usuario.tipo !== 'administrador') {
                return res.status(403).json({ error: 'Acesso negado. Você só pode atualizar livros da sua própria lista' });
            }

            const vinculo = await db.UsuarioLivro.findOne({
                where: { usuarioId, livroId }
            });

            if (!vinculo) {
                return res.status(404).json({ error: 'Vínculo entre usuário e livro não encontrado' });
            }

            if (status) {
                const statusValido = ['para ler', 'lendo', 'lido'];
                if (!statusValido.includes(status)) {
                    return res.status(422).json({ error: 'Status inválido. Use: para ler, lendo ou lido'});
                }
                vinculo.status = status;
            }

            if (paginasLidas !== undefined) {
                if (isNaN(paginasLidas) || paginasLidas < 0) {
                    return res.status(422).json({ error: 'Páginas lidas deve ser um número inteiro positivo' });
                }
                const statusAtual = status || vinculo.status;
                if (statusAtual !== 'lendo') {
                    return res.status(422).json({ error: 'Páginas lidas só pode ser atualizado com status "lendo"' });
                }
                vinculo.paginasLidas = paginasLidas;
            }

            if (nota !== undefined) {
                if (isNaN(nota) || nota < 1 || nota > 5) {
                    return res.status(422).json({ error: 'Nota deve ser um número inteiro entre 1 e 5' });
                }
                const statusAtual = status || vinculo.status;
                if (statusAtual !== 'lido') {
                    return res.status(422).json({ error: 'Nota só pode ser atribuída a livros com status "lido"' });
                }
                vinculo.nota = nota;
            }

            await vinculo.save();

            const usuarioAtualizado = await db.Usuario.findByPk(usuarioId, {
                include: [{
                    model: db.Livro,
                    as: 'livros',
                    attributes: ['id', 'titulo'],
                    through: { attributes: ['status', 'paginasLidas', 'nota'] } 
                }]
            });

            res.status(200).json({
                message: 'Informações do livro do usuário atualizadas com sucesso',
                usuario: usuarioAtualizado
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar informações do livro do usuário' });
        }
    },
    //remover livro da lista do usuário
    async deleteUsuarioLivro(req, res) {
        try {
            const { usuarioId, livroId } = req.params;

            //checar se o usuário autenticado é o mesmo do usuárioId ou se é admin
            if (String(req.usuario.id) !== String(usuarioId) && req.usuario.tipo !== 'administrador') {
                return res.status(403).json({ error: 'Acesso negado. Você só pode remover livros da sua própria lista' });
            }

            const vinculo = await db.UsuarioLivro.findOne({
                where: { usuarioId, livroId }
            });

            if (!vinculo) {
                return res.status(404).json({ error: 'Vínculo entre usuário e livro não encontrado' });
            }

            await vinculo.destroy();

            res.status(200).json({ message: 'Livro removido da lista do usuário com sucesso' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao remover livro da lista do usuário' });
        }
    },
    //buscar livros do usuário
    async getLivrosDoUsuario(req, res) {
        try {
            const { id } = req.params;

            //checar se o usuário autenticado é o mesmo do id ou se é admin
            if (String(req.usuario.id) !== String(id) && req.usuario.tipo !== 'administrador') {
                return res.status(403).json({ error: 'Acesso negado. Você só pode acessar sua própria lista de livros' });
            }

            const usuario = await db.Usuario.findByPk(id, {
                include: [{
                    model: db.Livro,
                    as: 'livros',
                    attributes: ['id', 'titulo'],
                    through: { attributes: ['status', 'paginasLidas', 'nota'] } 
                }]
            });

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            res.status(200).json({ livros: usuario.livros });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar livros do usuário' });
        }
    }
}