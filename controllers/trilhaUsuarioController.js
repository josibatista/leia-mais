const mongo = require('../config/db_mongoose');
const db = require('../config/db_sequelize');
const { buscarItensDaTrilha } = require('./trilhaController');

function mensagemStatusTrilha(status) {
    const mensagens = {
        'para ler': 'Trilha salva para ler depois.',
        'em andamento': 'Trilha iniciada com sucesso.',
        pausada: 'Trilha pausada com sucesso.',
        concluída: 'Trilha concluída com sucesso.'
    };

    return mensagens[status] || 'Trilha atualizada com sucesso.';
}

async function concluirTrilhaComXp(vinculo, trilhaId, usuarioId) {
    if (vinculo.status === 'concluída') {
        return vinculo;
    }

    vinculo.status = 'concluída';
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

    await vinculo.save();
    return vinculo;
}

async function montarItensComProgresso(usuarioId, trilhaId, itens) {
    const progressosObra = await mongo.TrilhaUsuarioObra.find({
        usuarioId: Number(usuarioId),
        trilhaId,
        concluida: true
    });

    const progressosLivro = await mongo.TrilhaUsuarioLivro.find({
        usuarioId: Number(usuarioId),
        trilhaId,
        concluida: true
    });

    const obrasConcluidas = new Set(progressosObra.map((item) => item.obraId.toString()));
    const livrosConcluidos = new Set(progressosLivro.map((item) => item.livroId.toString()));

    return itens.map((item) => {
        if (item.itemTipo === 'livro') {
            return {
                ...item,
                concluida: livrosConcluidos.has(String(item.id))
            };
        }

        return {
            ...item,
            concluida: obrasConcluidas.has(String(item._id || item.id))
        };
    });
}

function calcularProgresso(itens) {
    const total = itens.length;
    const concluidas = itens.filter((item) => item.concluida).length;
    const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

    return { concluidas, total, percentual };
}

async function atualizarProgressoTrilha(usuarioId, trilhaId, vinculo) {
    const itens = await buscarItensDaTrilha(trilhaId);
    const itensComProgresso = await montarItensComProgresso(usuarioId, trilhaId, itens);
    const progresso = calcularProgresso(itensComProgresso);

    if (progresso.percentual === 100 && progresso.total > 0) {
        await concluirTrilhaComXp(vinculo, trilhaId, usuarioId);
    } else if (progresso.percentual < 100 && vinculo.status === 'concluída') {
        vinculo.status = 'em andamento';
        await vinculo.save();
    }

    return { itensComProgresso, progresso };
}

module.exports = {

    async postTrilhaUsuario(req, res) {
        try {
            const usuarioId = Number(req.params.id);
            const { trilhaId, status: statusBody } = req.body;

            if (Number(req.usuario.id) !== usuarioId) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            if (!trilhaId) {
                return res.status(422).json({ error: 'Informe o trilhaId' });
            }

            const statusPermitidos = ['para ler', 'em andamento', 'pausada', 'concluída'];
            const status = statusBody || 'para ler';

            if (!statusPermitidos.includes(status)) {
                return res.status(422).json({ error: 'Status inválido' });
            }

            const trilha = await mongo.Trilha.findById(trilhaId);
            if (!trilha) {
                return res.status(404).json({ error: 'Trilha não encontrada' });
            }

            const vinculoExistente = await mongo.TrilhaUsuario.findOne({ trilhaId, usuarioId });
            if (vinculoExistente) {
                return res.status(400).json({ error: 'Usuário já está nessa trilha' });
            }

            if (status === 'em andamento') {
                await mongo.TrilhaUsuario.updateOne(
                    { usuarioId, status: 'em andamento' },
                    { $set: { status: 'pausada' } }
                );
            }

            const novaTrilha = await mongo.TrilhaUsuario.create({
                trilhaId,
                usuarioId,
                status
            });

            const mensagens = {
                'para ler': 'Trilha salva com sucesso',
                'em andamento': 'Trilha iniciada com sucesso',
                'pausada': 'Trilha salva com sucesso',
                'concluída': 'Trilha salva com sucesso'
            };

            res.status(201).json({
                message: mensagens[status] || 'Trilha salva com sucesso',
                vinculo: novaTrilha
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao salvar trilha' });
        }
    },

    async putTrilhaUsuario(req, res) {
        const { usuarioId, trilhaId } = req.params;
        const { status } = req.body;

        try {
            const vinculo = await mongo.TrilhaUsuario.findOne({ usuarioId:Number(usuarioId), trilhaId });
            if (!vinculo) {
                return res.status(404).json({ error: 'Não encontramos os dados dessa trilha.' });
            }

            if (status) {
                if (!['para ler', 'em andamento', 'pausada', 'concluída'].includes(status)) {
                    return res.status(422).json({ error: 'Status inválido' });
                }

                if (status === 'em andamento' && vinculo.status !== 'em andamento') {
                    await mongo.TrilhaUsuario.updateOne(
                        { usuarioId: Number(usuarioId), status: 'em andamento', trilhaId: { $ne: trilhaId } },
                        { $set: { status: 'pausada' } }
                    );
                }

                if (status === 'concluída' && vinculo.status !== 'concluída') {
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
            res.json({
                message: status ? mensagemStatusTrilha(status) : 'Trilha atualizada com sucesso.',
                vinculo
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Não foi possível salvar a alteração. Tente novamente.' });
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

            const trilhasComProgresso = await Promise.all(
                vinculos.map(async (vinculo) => {
                    const trilhaRefId = vinculo.trilhaId?._id || vinculo.trilhaId;
                    const itens = await buscarItensDaTrilha(trilhaRefId);
                    const itensComProgresso = await montarItensComProgresso(usuarioId, trilhaRefId, itens);
                    const progresso = calcularProgresso(itensComProgresso);

                    return {
                        ...vinculo.toObject(),
                        progresso
                    };
                })
            );

            res.status(200).json({ trilhas: trilhasComProgresso });
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
                return res.status(404).json({ error: 'Não encontramos os dados dessa trilha.' });
            }

            const itens = await buscarItensDaTrilha(trilhaId);
            const itensComProgresso = await montarItensComProgresso(usuarioId, trilhaId, itens);
            const progresso = calcularProgresso(itensComProgresso);
            const obras = itensComProgresso.filter((item) => item.itemTipo === 'obra');
            const livros = itensComProgresso.filter((item) => item.itemTipo === 'livro');

            res.status(200).json({
                trilha: vinculo,
                obras,
                livros,
                itens: itensComProgresso,
                progresso
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar trilha do usuário' });
        }
    },

    async putTrilhaUsuarioObra(req, res) {
        const { usuarioId, trilhaId, obraId } = req.params;
        const { concluida } = req.body;

        try {
            if (Number(req.usuario.id) !== Number(usuarioId) && req.usuario.tipo !== 'administrador') {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            if (typeof concluida !== 'boolean') {
                return res.status(422).json({ error: 'Informe concluida como boolean' });
            }

            const vinculo = await mongo.TrilhaUsuario.findOne({
                usuarioId: Number(usuarioId),
                trilhaId
            });

            if (!vinculo) {
                return res.status(404).json({ error: 'Não encontramos os dados dessa trilha.' });
            }

            const relacao = await mongo.TrilhaObra.findOne({ trilhaId, obraId });

            if (!relacao) {
                return res.status(404).json({ error: 'Este item não pertence a esta trilha.' });
            }

            await mongo.TrilhaUsuarioObra.findOneAndUpdate(
                { usuarioId: Number(usuarioId), trilhaId, obraId },
                {
                    concluida,
                    dataConclusao: concluida ? new Date() : null
                },
                { upsert: true, new: true }
            );

            const { itensComProgresso, progresso } = await atualizarProgressoTrilha(
                usuarioId,
                trilhaId,
                vinculo
            );

            const vinculoAtualizado = await mongo.TrilhaUsuario.findOne({
                usuarioId: Number(usuarioId),
                trilhaId
            }).populate('trilhaId');

            res.status(200).json({
                message: concluida ? 'Item marcado como concluído.' : 'Item desmarcado.',
                trilha: vinculoAtualizado,
                obras: itensComProgresso.filter((item) => item.itemTipo === 'obra'),
                livros: itensComProgresso.filter((item) => item.itemTipo === 'livro'),
                itens: itensComProgresso,
                progresso
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Não foi possível salvar a alteração. Tente novamente.' });
        }
    },

    async putTrilhaUsuarioLivro(req, res) {
        const { usuarioId, trilhaId, livroId } = req.params;
        const { concluida } = req.body;

        try {
            if (Number(req.usuario.id) !== Number(usuarioId) && req.usuario.tipo !== 'administrador') {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            if (typeof concluida !== 'boolean') {
                return res.status(422).json({ error: 'Informe se o item foi concluído.' });
            }

            const vinculo = await mongo.TrilhaUsuario.findOne({
                usuarioId: Number(usuarioId),
                trilhaId
            });

            if (!vinculo) {
                return res.status(404).json({ error: 'Não encontramos os dados dessa trilha.' });
            }

            const relacao = await mongo.TrilhaLivro.findOne({
                trilhaId,
                livroId: Number(livroId)
            });

            if (!relacao) {
                return res.status(404).json({ error: 'Este item não pertence a esta trilha.' });
            }

            await mongo.TrilhaUsuarioLivro.findOneAndUpdate(
                { usuarioId: Number(usuarioId), trilhaId, livroId: Number(livroId) },
                {
                    concluida,
                    dataConclusao: concluida ? new Date() : null
                },
                { upsert: true, new: true }
            );

            const { itensComProgresso, progresso } = await atualizarProgressoTrilha(
                usuarioId,
                trilhaId,
                vinculo
            );

            const vinculoAtualizado = await mongo.TrilhaUsuario.findOne({
                usuarioId: Number(usuarioId),
                trilhaId
            }).populate('trilhaId');

            res.status(200).json({
                message: concluida ? 'Item marcado como concluído.' : 'Item desmarcado.',
                trilha: vinculoAtualizado,
                obras: itensComProgresso.filter((item) => item.itemTipo === 'obra'),
                livros: itensComProgresso.filter((item) => item.itemTipo === 'livro'),
                itens: itensComProgresso,
                progresso
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Não foi possível salvar a alteração. Tente novamente.' });
        }
    },

    async deleteTrilhaUsuario(req, res) {
        const { usuarioId, trilhaId } = req.params;

        try {
            if (Number(req.usuario.id) !== Number(usuarioId) && req.usuario.tipo !== 'administrador') {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const vinculo = await mongo.TrilhaUsuario.findOneAndDelete({ usuarioId: Number(usuarioId), trilhaId });

            if (!vinculo) {
                return res.status(404).json({ error: 'Não encontramos os dados dessa trilha.' });
            }

            res.status(200).json({ message: 'Trilha removida dos salvos com sucesso.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Não foi possível remover a trilha dos salvos. Tente novamente.' });
        }
    }

};  