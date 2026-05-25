const { Op } = require('sequelize');
const db = require('../config/db_sequelize');
const mongo = require('../config/db_mongoose');

module.exports = {

    async postObra(req, res) {
        try {
            let { titulo, tipo, autores, descricao, link } = req.body;

            titulo = titulo?.trim();
            descricao = descricao?.trim();
            link = link?.trim();

            if (!titulo) {
                return res.status(422).json({error: 'O campo título é obrigatório' });
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
                descricao,
                link,
            });

            return res.status(201).json({
                message: 'Obra criada com sucesso',
                obra
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar obra' });
        }
    }
}