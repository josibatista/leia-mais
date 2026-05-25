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
}