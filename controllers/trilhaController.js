const mongo = require('../config/db_mongoose');

module.exports = {
    async postTrilha(req, res) {
        try {
            let { tema, descricao, nivelDificuldade, xp, liberada, obras } = req.body;

            tema = tema?.trim();
            descricao = descricao?.trim();

            if (!tema) {
                return res.status(422).json({ error: 'O campo tema é obrigatório' });
            }

            if (!nivelDificuldade) {
                return res.status(422).json({ error: 'O campo nível de dificuldade é obrigatório' });
            }

            if (!xp) {
                return res.status(422).json({ error: 'O campo xp é obrigatório' });
            }

            const trilha = await mongo.Trilha.create({
                tema,
                descricao,
                nivelDificuldade,
                xp
            });

            const getOrCreateObra = async (obraInput) => {
                if (obraInput.obraId) {
                    return obraInput.obraId;
                }

                const obra = await mongo.Obra.create({
                    titulo: obraInput.titulo,
                    tipo: obraInput.tipo,
                    autores: obraInput.autores,
                    descricao: obraInput.descricao,
                    link: obraInput.link
                });

                return obra._id;
            };

            if (obras && obras.length > 0) {

                const obrasRelacionadas = [];

                for (const item of obras) {
                    const obraId = await getOrCreateObra(item);

                    obrasRelacionadas.push({
                        trilhaId: trilha._id,
                        obraId,
                        ordem: item.ordem
                    });
                }

                const ids = obrasRelacionadas.map(r => r.obraId.toString());
                const obrasDuplicadas = ids.filter((id, index) => ids.indexOf(id) !== index);

                if (obrasDuplicadas.length > 0) {
                    return res.status(400).json({
                        error: 'Obras duplicadas na trilha'
                    });
                }

                await mongo.TrilhaObra.insertMany(obrasRelacionadas);
            }

            return res.status(201).json({
                message: 'Trilha criada com sucesso',
                trilha
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao criar trilha' });
        }
    },
    async putTrilha(req, res) {
        try {
            const id = req.params.id;
            let { tema, descricao, nivelDificuldade, xp, liberada, obras } = req.body;

            tema = tema?.trim();
            descricao = descricao?.trim();

            const trilha = await mongo.Trilha.findById(id);

            if (!trilha) {
                return res.status(404).json({ error: 'Trilha não encontrada' });
            }

            if (tema === '') {
                return res.status(422).json({ error: 'O campo tema não pode ser vazio' });
            }

            if (nivelDificuldade === '') {
                return res.status(422).json({ error: 'O campo nível de dificuldade não pode ser vazio' });
            }

            if (xp === '') {
                return res.status(422).json({ error: 'O campo xp não pode ser vazio' });
            }

            const mudouTema = tema !== undefined && tema !== trilha.tema;
            const mudouDescricao = descricao !== undefined && descricao !== trilha.descricao;
            const mudouNivel = nivelDificuldade !== undefined && nivelDificuldade !== trilha.nivelDificuldade;
            const mudouXp = xp !== undefined && xp !== trilha.xp;

            const temMudancaTrilha =
                mudouTema || mudouDescricao || mudouNivel || mudouXp;

            const obrasAtuais = await mongo.TrilhaObra.find({ trilhaId: id });

            const obrasAtuaisIds = obrasAtuais
                .map(o => o.obraId.toString())
                .sort();

            const novasObrasIds = Array.isArray(obras)
                ? obras.map(o => o.obraId).filter(Boolean).sort()
                : [];

            const obrasMudaram =
                JSON.stringify(obrasAtuaisIds) !== JSON.stringify(novasObrasIds);

            if (!temMudancaTrilha && !obrasMudaram) {
                return res.status(400).json({
                    error: 'Nenhuma alteração foi realizada'
                });
            }

            const trilhaAtualizada = await mongo.Trilha.findByIdAndUpdate(
                id,
                {
                    ...(mudouTema && { tema }),
                    ...(mudouDescricao && { descricao }),
                    ...(mudouNivel && { nivelDificuldade }),
                    ...(mudouXp && { xp })
                },
                { new: true }
            );

            const getOrCreateObra = async (obraInput) => {
                if (obraInput.obraId) return obraInput.obraId;

                const obra = await mongo.Obra.create({
                    titulo: obraInput.titulo,
                    tipo: obraInput.tipo,
                    autores: obraInput.autores,
                    descricao: obraInput.descricao,
                    link: obraInput.link
                });

                return obra._id;
            };

            if (Array.isArray(obras)) {

                const ids = obras.map(o => o.obraId || o.titulo);
                const duplicadas = ids.filter((id, i) => ids.indexOf(id) !== i);

                if (duplicadas.length > 0) {
                    return res.status(400).json({
                        error: 'Obras duplicadas na trilha'
                    });
                }

                await mongo.TrilhaObra.deleteMany({ trilhaId: id });

                const relacoes = [];

                for (const item of obras) {
                    const obraId = await getOrCreateObra(item);

                    relacoes.push({
                        trilhaId: id,
                        obraId,
                        ordem: item.ordem
                    });
                }

                await mongo.TrilhaObra.insertMany(relacoes);
            }

            return res.status(200).json({
                message: 'Trilha atualizada com sucesso',
                trilha: trilhaAtualizada
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar trilha' });
        }
    },
    async deleteObraTrilha(req, res) {
        try {
            const { trilhaId, obraId } = req.params;

            const trilhaObra = await mongo.TrilhaObra.deleteOne({
                trilhaId,
                obraId
            });

            if (trilhaObra.deletedCount === 0) {
                return res.status(404).json({ error: 'Relação não encontrada' });
            }

            res.status(200).json({ 
                message: 'Obra removida da trilha'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao remover obra' });
        }
    },
    async deleteTrilha(req, res) {
        try {
            const { id } = req.params;
            const trilha = await mongo.Trilha.findById(id);

            if (!trilha) {
                return res.status(404).json({ error: 'Trilha não encontrada' });
            }

            await mongo.TrilhaObra.deleteMany({ 
                trilhaId: id 
            });

            await mongo.Trilha.deleteOne({
                _id: id 
            });

            res.status(200).json({
                message: 'Trilha deletada com sucesso',
                trilhaId: id
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar trilha' });
        }
    }
};