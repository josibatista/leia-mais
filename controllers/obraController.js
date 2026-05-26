const { Op } = require('sequelize');
const db = require('../config/db_sequelize');
const mongo = require('../config/db_mongoose');

module.exports = {
    
    async postObra(req, res) {
        try {
            let { titulo, tipo, autores, descricao } = req.body;

            titulo = titulo?.trim();
            descricao = descricao?.trim();

            if (!titulo) {
                return res.status(422).json({ error: 'O campo título é obrigatório' });
            }

            const tituloObraExistente = await mongo.Obra.findOne({
                titulo: { 
                    $regex: new RegExp(`^${titulo}$`, 'i') 
                }
            });
            
            if (tituloObraExistente) {
                return res.status(400).json({ error: 'Título já cadastrado' });
            }

            if (!autores || !Array.isArray(autores) || autores.length === 0) {
                return res.status(400).json({ error: 'Pelo menos um autor é obrigatório.' });
            }

            const autoresIds = await Promise.all(
                autores.map(async (autor) => {
                    const nome = typeof autor === 'string'
                        ? autor.trim()
                        : autor.nome?.trim();

                    if (!nome) throw new Error('Nome do autor inválido.');

                    let autorExistente = await db.Autor.findOne({
                        where: { nome: { [Op.iLike]: nome } }
                    });

                    if (!autorExistente) {
                        autorExistente = await db.Autor.create({ nome });
                    }

                    return autorExistente.id;
                })
            );

            const obra = await mongo.Obra.create({
                titulo,
                tipo,
                autores: autoresIds,
                descricao
            });

            const autoresNomes = await db.Autor.findAll({
                where: { id: autoresIds },
                attributes: ['id', 'nome']
            });

            return res.status(201).json({
                message: 'Obra criada com sucesso',
                obra: {
                    ...obra.toObject(),
                    autores: autoresNomes.map(a => ({ id: a.id, nome: a.nome }))
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar obra' });
        }
    },

    async putObra(req, res) {
        try {
            const id = req.params.id;
            let { titulo, tipo, autores, descricao } = req.body;

            titulo = titulo?.trim();
            descricao = descricao?.trim();

            const obra = await mongo.Obra.findById(id);
            if (!obra) {
                return res.status(404).json({ error: 'Obra não encontrada' });
            }

            if (titulo === '') {
                return res.status(422).json({ error: 'O campo título não pode ser vazio' });
            }

            if (titulo) {
                const tituloObraExistente = await mongo.Obra.findOne({
                    _id: { $ne: id },
                    titulo: {
                        $regex: new RegExp(`^${titulo}$`, 'i')
                    }
                });

                if (tituloObraExistente) {
                    return res.status(400).json({ error: 'Título já cadastrado' });
                }
            }

            let autoresIds = obra.autores;

            if (autores) {
                if (!Array.isArray(autores) || autores.length === 0) {
                    return res.status(400).json({ error: 'Pelo menos um autor é obrigatório.' });
                }

                autoresIds = await Promise.all(
                    autores.map(async (autor) => {
                        const nome = typeof autor === 'string'
                            ? autor.trim()
                            : autor.nome?.trim();

                        if (!nome) throw new Error('Nome do autor inválido.');

                        let autorExistente = await db.Autor.findOne({
                            where: { nome: { [Op.iLike]: nome } }
                        });

                        if (!autorExistente) {
                            autorExistente = await db.Autor.create({ nome });
                        }

                        return autorExistente.id;
                    })
                );
                autoresIds = [...new Set(autoresIds.map(id => id.toString()))];
            }

            const normalizarArray = (arr) => {
                return [...new Set(arr.map(id => id.toString().trim()))].sort();
            };

            const autoresIguais = (novos, atuais) => {
                if (!autores) return true; 

                const a = normalizarArray(novos);
                const b = normalizarArray(atuais);

                if (a.length !== b.length) return false;

                return a.every((val, i) => val === b[i]);
            };

            const mudouTitulo = titulo && titulo !== obra.titulo;
            const mudouTipo = tipo && tipo !== obra.tipo;
            const mudouDescricao = descricao && descricao !== obra.descricao;
            const mudouAutores = autores && !autoresIguais(autoresIds, obra.autores);

            if (!mudouTitulo && !mudouTipo && !mudouDescricao && !mudouAutores) {
                return res.status(400).json({
                    error: 'Nenhuma alteração foi realizada'
                });
            }

            const obraAtualizada = await mongo.Obra.findByIdAndUpdate(
                id,
                {
                    ...(titulo && { titulo }),
                    ...(tipo && { tipo }),
                    ...(descricao && { descricao }),
                    autores: autoresIds
                },
                { new: true }
            );

            const autoresNomes = await db.Autor.findAll({
                where: { id: autoresIds.map(id => id.toString()) },
                attributes: ['id', 'nome']
            });

            res.status(200).json({
                message: 'Obra atualizada com sucesso',
                obra: {
                    ...obraAtualizada.toObject(),
                    autores: autoresNomes.map(a => ({ id: a.id, nome: a.nome }))
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar obra' });
        }
    },
    async deleteObra(req, res) {
        try {
            const id = req.params.id;

            const obra = await mongo.Obra.findByIdAndDelete(id);
        
            if (!obra) {
                return res.status(404).json({ error: 'Obra não encontada' });
            }

            res.status(200).json({
                message: 'Obra deletada com sucesso',
                obraId: id
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar obra' });
        }
    },
    async getObras(req, res) {
        try {
            const obras = await mongo.Obra.find();

            if (obras.length === 0) {
                return res.status(404).json({ error: 'Nenhuma obra cadastrada' });
            }

            const todosAutoresIds = [...new Set(
                obras.flatMap(obra => obra.autores.map(id => id.toString()))
            )];

            const autores = await db.Autor.findAll({
                where: { id: todosAutoresIds },
                attributes: ['id', 'nome']
            });

            const autoresMap = Object.fromEntries(
                autores.map(a => [a.id.toString(), a.nome])
            );

            const obrasComAutores = obras.map(obra => ({
                ...obra.toObject(),
                autores: obra.autores.map(id => ({
                    id: id.toString(),
                    nome: autoresMap[id.toString()] ?? null
                }))
            }));

            res.status(200).json({ obras: obrasComAutores });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao consultar obras' });
        }
    },
    async getObrasById(req, res) {
        try {
            const id = req.params.id;
            const obra = await mongo.Obra.findById(id);

            if (!obra) {
                return res.status(404).json({ error: 'Obra não encontrada' });
            }

            const autores = await db.Autor.findAll({
                where: { id: obra.autores.map(id => id.toString()) },
                attributes: ['id', 'nome']
            });

            const autoresMap = Object.fromEntries(
                autores.map(a => [a.id.toString(), a.nome])
            );

            res.status(200).json({
                obra: {
                    ...obra.toObject(),
                    autores: obra.autores.map(id => ({
                        id: id.toString(),
                        nome: autoresMap[id.toString()] ?? null
                    }))
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao consultar obra' });
        }
    }
}