const mongo = require('../config/db_mongoose');
const db = require('../config/db_sequelize');
const { Op } = require('sequelize');

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

            if (obras && obras.length > 0) {
                const ids = obras.filter(o => o.obraId).map(o => o.obraId.toString());
                const duplicadas = ids.filter((id, index) => ids.indexOf(id) !== index);

                if (duplicadas.length > 0) {
                    return res.status(400).json({ error: 'Obras duplicadas na trilha' });
                }

                const titulos = obras.filter(o => !o.obraId).map(o => o.titulo?.trim());
                const titulosDuplicados = titulos.filter((t, i) => titulos.indexOf(t) !== i);

                if (titulosDuplicados.length > 0) {
                    return res.status(400).json({ error: 'Obras com título duplicado na trilha' });
                }
            }

            const trilha = await mongo.Trilha.create({
                tema,
                descricao,
                nivelDificuldade,
                xp,
                liberada
            });

            const getOrCreateObra = async (obraInput) => {
                if (obraInput.obraId) {
                    return obraInput.obraId;
                }

                const autoresIds = await Promise.all(
                    (obraInput.autores || []).map(async (autor) => {
                        const nome = typeof autor === 'string' ? autor.trim() : autor.nome?.trim();
                        if (!nome) throw new Error('Nome do autor inválido.');

                        let autorExistente = await db.Autor.findOne({
                            where: { nome: { [Op.iLike]: nome } }
                        });

                        if (!autorExistente) {
                            autorExistente = await db.Autor.create({ nome });
                        }

                        return Number(autorExistente.id); 
                    })
                );

                const obra = await mongo.Obra.create({
                    titulo: obraInput.titulo,
                    tipo: obraInput.tipo,
                    autores: autoresIds,
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
            const mudouLiberada = liberada !== undefined && liberada !== trilha.liberada;

            const temMudancaTrilha = mudouTema || mudouDescricao || mudouNivel || mudouXp || mudouLiberada;

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
                return res.status(400).json({ error: 'Nenhuma alteração foi realizada' });
            }

            if (Array.isArray(obras)) {
                const ids = obras.filter(o => o.obraId).map(o => o.obraId.toString());
                const duplicadas = ids.filter((id, i) => ids.indexOf(id) !== i);

                if (duplicadas.length > 0) {
                    return res.status(400).json({ error: 'Obras duplicadas na trilha' });
                }

                const titulos = obras.filter(o => !o.obraId).map(o => o.titulo?.trim());
                const titulosDuplicados = titulos.filter((t, i) => titulos.indexOf(t) !== i);

                if (titulosDuplicados.length > 0) {
                    return res.status(400).json({ error: 'Obras com título duplicado na trilha' });
                }
            }

            const trilhaAtualizada = await mongo.Trilha.findByIdAndUpdate(
                id,
                {
                    ...(mudouTema && { tema }),
                    ...(mudouDescricao && { descricao }),
                    ...(mudouNivel && { nivelDificuldade }),
                    ...(mudouXp && { xp }),
                    ...(mudouLiberada && { liberada })
                },
                { new: true }
            );

            const getOrCreateObra = async (obraInput) => {
                if (obraInput.obraId) return obraInput.obraId;

                const autoresIds = await Promise.all(
                    (obraInput.autores || []).map(async (autor) => {
                        const nome = typeof autor === 'string' ? autor.trim() : autor.nome?.trim();
                        if (!nome) throw new Error('Nome do autor inválido.');

                        let autorExistente = await db.Autor.findOne({
                            where: { nome: { [Op.iLike]: nome } }
                        });

                        if (!autorExistente) {
                            autorExistente = await db.Autor.create({ nome });
                        }

                        return Number(autorExistente.id);
                    })
                );

                const obra = await mongo.Obra.create({
                    titulo: obraInput.titulo,
                    tipo: obraInput.tipo,
                    autores: autoresIds, // ✅ IDs numéricos
                    descricao: obraInput.descricao,
                    link: obraInput.link
                });

                return obra._id;
            };

            if (Array.isArray(obras)) {
                const relacoes = [];

                for (const item of obras) {
                    const obraId = await getOrCreateObra(item);

                    relacoes.push({
                        trilhaId: id,
                        obraId,
                        ordem: item.ordem
                    });
                }

                await mongo.TrilhaObra.deleteMany({ trilhaId: id });
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
    },
    async getTrilhas(req, res) {
        try {
            const trilhas = await mongo.Trilha.find();

            if (trilhas.length === 0) {
                return res.status(404).json({ error: 'Nenhuma trilha cadastrada' });
            }

            res.status(200).json(trilhas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao consultar trilhas' });
        }
    },
    async getTrilhasById(req, res) {
        try {
            const id = req.params.id;

            const trilha = await mongo.Trilha.findById(id)

            if (!trilha) {
                return res.status(404).json({ error: 'Trilha não encontrada' });
            }

            res.status(200).json(trilha);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao consultar trilha' })
        }
    }
};