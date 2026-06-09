const mongo = require('../config/db_mongoose');
const db = require('../config/db_sequelize');
const { getTrilhas } = require('./trilhaController');

module.exports = {

    async postTrilhaUsuario(req, res) {
        try {
            const usuarioId = Number(req.params.id);
            const { trilhaId } = req.body;

            // checagem de acesso
            if (Number(req.usuario.id) !== usuarioId) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            if (!trilhaId) {
                return res.status(422).json({ error: 'Informe o trilhaId' });
            }

            const trilha = await mongo.Trilha.findById(trilhaId);
            if (!trilha) {
                return res.status(404).json({ error: 'Trilha não encontrada' });
            }

            // verifica se já está vinculado
            const vinculoExistente = await mongo.TrilhaUsuario.findOne({ trilhaId, usuarioId });
            if (vinculoExistente) {
                return res.status(400).json({ error: 'Usuário já está nessa trilha' });
            }

            await mongo.TrilhaUsuario.updateOne(
                { usuarioId, status: 'em andamento' },
                { $set: { status: 'pausada' } }
            );

            const novaTrilha = await mongo.TrilhaUsuario.create({
                trilhaId,
                usuarioId,
                status: 'em andamento'
            });

            res.status(201).json({
                message: 'Trilha iniciada com sucesso',
                vinculo: novaTrilha
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao iniciar trilha' });
        }
    },

    async putTrilhaUsuario(req, res) {
        const { usuarioId, trilhaId } = req.params;
        const { status } = req.body;

        try {
            const vinculo = await mongo.TrilhaUsuario.findOne({ usuarioId:Number(usuarioId), trilhaId });
            if (!vinculo) {
                return res.status(404).json({ error: 'Vínculo não encontrado' });
            }

            if (status) {
                if (!['em andamento', 'pausada', 'concluída'].includes(status)) {
                    return res.status(422).json({ error: 'Status inválido' });
                }

                if (status === 'em andamento' && vinculo.status !== 'em andamento') {
                    await mongo.TrilhaUsuario.updateOne(
                        { usuarioId: Number(usuarioId), status: 'em andamento', trilhaId: { $ne: trilhaId } },
                        { $set: { status: 'pausada' } }
                    );
                }

                if (status === 'concluída') {
                    vinculo.dataConclusao = new Date();

                    const trilha = await mongo.Trilha.findById(trilhaId);
                    if (trilha) {
                        vinculo.xpGanho = trilha.xp;

                        const usuario = await db.Usuario.findByPk(Number(usuarioId));
                        if (usuario) {
                            usuario.xpTotal = Number(usuario.xpTotal) + trilha.xp;
                            await usuario.save();
                        }
                    }
                }

                vinculo.status = status;
            }

            await vinculo.save();
            res.json({ message: 'Vínculo atualizado com sucesso', vinculo });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar vínculo' });
        }
    },

    async getTrilhasUsuario(req, res) {
        const usuarioId = Number(req.params.id);

        try {
            if (Number(req.usuario.id) !== usuarioId && req.usuario.tipo !== 'administrador') {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const vinculos = await mongo.TrilhaUsuario.find({ usuarioId })
                .populate('trilhaId'); 

            res.status(200).json({ trilhas: vinculos });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar trilhas do usuário' });
        }
    },

    async getTrilhasUsuarioById(req, res) {
        const { usuarioId, trilhaId } = req.params;

        try {
            if (Number(req.usuario.id) !== Number(usuarioId) && req.usuario.tipo !== 'administrador') {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const vinculo = await mongo.TrilhaUsuario.findOne({ usuarioId: Number(usuarioId), trilhaId })
                .populate('trilhaId');

            if (!vinculo) {
                return res.status(404).json({ error: 'Vínculo não encontrado' });
            }

            res.status(200).json({ trilha: vinculo });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar trilha do usuário' });
        }
    }

};  