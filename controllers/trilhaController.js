const mongo = require('../config/db_mongoose');
const db = require('../config/db_sequelize');
const { Op } = require('sequelize');

async function buscarObrasDaTrilha(trilhaId) {
    const relacoes = await mongo.TrilhaObra.find({ trilhaId }).sort({ ordem: 1 });

    if (relacoes.length === 0) {
        return [];
    }

    const obraIds = relacoes.map((relacao) => relacao.obraId);
    const obras = await mongo.Obra.find({ _id: { $in: obraIds } });
    const obrasMap = Object.fromEntries(obras.map((obra) => [obra._id.toString(), obra]));

    const todosAutoresIds = [...new Set(
        obras.flatMap((obra) => obra.autores.map((id) => id.toString()))
    )];

    const autores = todosAutoresIds.length > 0
        ? await db.Autor.findAll({
            where: { id: todosAutoresIds },
            attributes: ['id', 'nome']
        })
        : [];

    const autoresMap = Object.fromEntries(
        autores.map((autor) => [autor.id.toString(), autor.nome])
    );

    return relacoes
        .map((relacao) => {
            const obra = obrasMap[relacao.obraId.toString()];

            if (!obra) {
                return null;
            }

            return {
                ...obra.toObject(),
                ordem: relacao.ordem,
                autores: obra.autores.map((id) => ({
                    id: id.toString(),
                    nome: autoresMap[id.toString()] ?? null
                }))
            };
        })
        .filter(Boolean);
}

async function buscarLivrosDaTrilha(trilhaId) {
    const relacoes = await mongo.TrilhaLivro.find({ trilhaId }).sort({ ordem: 1 });

    if (relacoes.length === 0) {
        return [];
    }

    const livroIds = relacoes.map((relacao) => Number(relacao.livroId));
    const livros = await db.Livro.findAll({
        where: { id: livroIds },
        attributes: ['id', 'titulo', 'imagemCapa', 'genero', 'paginas']
    });

    const livrosMap = Object.fromEntries(livros.map((livro) => [livro.id.toString(), livro]));

    return relacoes
        .map((relacao) => {
            const livro = livrosMap[relacao.livroId.toString()];

            if (!livro) {
                return null;
            }

            return {
                ...livro.toJSON(),
                ordem: relacao.ordem,
                itemTipo: 'livro',
                tipoItem: 'Livro'
            };
        })
        .filter(Boolean);
}

async function buscarItensDaTrilha(trilhaId) {
    const obras = (await buscarObrasDaTrilha(trilhaId)).map((obra) => ({
        ...obra,
        itemTipo: 'obra',
        tipoItem: 'Obra'
    }));

    const livros = await buscarLivrosDaTrilha(trilhaId);

    return [...obras, ...livros].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
}

async function contarItensPorTrilhas(trilhaIds) {
    if (!trilhaIds.length) {
        return {};
    }

    const [obrasPorTrilha, livrosPorTrilha] = await Promise.all([
        mongo.TrilhaObra.aggregate([
            { $match: { trilhaId: { $in: trilhaIds } } },
            { $group: { _id: '$trilhaId', total: { $sum: 1 } } },
        ]),
        mongo.TrilhaLivro.aggregate([
            { $match: { trilhaId: { $in: trilhaIds } } },
            { $group: { _id: '$trilhaId', total: { $sum: 1 } } },
        ]),
    ]);

    const contagens = Object.fromEntries(
        trilhaIds.map((id) => [id.toString(), 0]),
    );

    obrasPorTrilha.forEach(({ _id, total }) => {
        contagens[_id.toString()] = (contagens[_id.toString()] || 0) + total;
    });

    livrosPorTrilha.forEach(({ _id, total }) => {
        contagens[_id.toString()] = (contagens[_id.toString()] || 0) + total;
    });

    return contagens;
}

function normalizarRelacoesItens(obras = [], livros = []) {
    const obrasNorm = (obras || [])
        .filter((item) => item.obraId)
        .map((item) => `obra:${item.obraId}:${item.ordem || 0}`)
        .sort();

    const livrosNorm = (livros || [])
        .filter((item) => item.livroId)
        .map((item) => `livro:${item.livroId}:${item.ordem || 0}`)
        .sort();

    return [...obrasNorm, ...livrosNorm].join('|');
}

module.exports = {
    buscarObrasDaTrilha,
    buscarLivrosDaTrilha,
    buscarItensDaTrilha,

    async postTrilha(req, res) {
        try {
            let { tema, descricao, nivelDificuldade, xp, liberada, imagemCapa, obras, livros, dataHora } = req.body;

            tema = tema?.trim();
            descricao = descricao?.trim();
            imagemCapa = imagemCapa?.trim();

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
                liberada,
                dataHora: new Date(),
                ...(imagemCapa && { imagemCapa })
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

            if (livros && livros.length > 0) {
                const ids = livros.filter((item) => item.livroId).map((item) => Number(item.livroId));
                const duplicados = ids.filter((id, index) => ids.indexOf(id) !== index);

                if (duplicados.length > 0) {
                    return res.status(400).json({ error: 'Livros duplicados na trilha' });
                }

                const livrosRelacionados = livros.map((item) => ({
                    trilhaId: trilha._id,
                    livroId: Number(item.livroId),
                    ordem: item.ordem
                }));

                await mongo.TrilhaLivro.insertMany(livrosRelacionados);
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
            let { tema, descricao, nivelDificuldade, xp, liberada, imagemCapa, obras, livros, dataHora } = req.body;

            tema = tema?.trim();
            descricao = descricao?.trim();
            imagemCapa = imagemCapa?.trim();

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
            const mudouImagemCapa = imagemCapa !== undefined && imagemCapa !== (trilha.imagemCapa || '');

            const temMudancaTrilha = mudouTema || mudouDescricao || mudouNivel || mudouXp || mudouLiberada || mudouImagemCapa;

            const obrasAtuais = await mongo.TrilhaObra.find({ trilhaId: id });
            const livrosAtuais = await mongo.TrilhaLivro.find({ trilhaId: id });

            const relacoesAtuais = normalizarRelacoesItens(
                obrasAtuais.map((item) => ({ obraId: item.obraId.toString(), ordem: item.ordem })),
                livrosAtuais.map((item) => ({ livroId: item.livroId, ordem: item.ordem }))
            );

            const relacoesNovas = normalizarRelacoesItens(
                Array.isArray(obras) ? obras : null,
                Array.isArray(livros) ? livros : null
            );

            const itensMudaram = Array.isArray(obras) || Array.isArray(livros)
                ? relacoesAtuais !== relacoesNovas
                : false;

            if (!temMudancaTrilha && !itensMudaram) {
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
                    ...(mudouLiberada && { liberada }),
                    ...(mudouImagemCapa && { imagemCapa }),
                    dataHora: new Date()
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
                    autores: autoresIds, 
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

            if (Array.isArray(livros)) {
                const ids = livros.filter((item) => item.livroId).map((item) => Number(item.livroId));
                const duplicados = ids.filter((id, index) => ids.indexOf(id) !== index);

                if (duplicados.length > 0) {
                    return res.status(400).json({ error: 'Livros duplicados na trilha' });
                }

                const relacoesLivros = livros.map((item) => ({
                    trilhaId: id,
                    livroId: Number(item.livroId),
                    ordem: item.ordem
                }));

                await mongo.TrilhaLivro.deleteMany({ trilhaId: id });
                await mongo.TrilhaLivro.insertMany(relacoesLivros);
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

            await mongo.Trilha.findByIdAndUpdate(trilhaId, { dataHora: new Date() });

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

            await mongo.TrilhaLivro.deleteMany({
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

            const trilhaIds = trilhas.map((trilha) => trilha._id);
            const contagensPorTrilha = await contarItensPorTrilhas(trilhaIds);

            const trilhasComQuantidade = trilhas.map((trilha) => ({
                ...trilha.toObject(),
                quantidadeItens: contagensPorTrilha[trilha._id.toString()] || 0,
            }));

            res.status(200).json(trilhasComQuantidade);
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

            const obras = await buscarObrasDaTrilha(id);
            const livros = await buscarLivrosDaTrilha(id);
            const itens = await buscarItensDaTrilha(id);

            res.status(200).json({
                ...trilha.toObject(),
                obras,
                livros,
                itens
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao consultar trilha' })
        }
    }
};