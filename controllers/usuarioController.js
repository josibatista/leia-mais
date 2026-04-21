const db = require('../config/db_sequelize');
const bcrypt = require('bcrypt');

module.exports = {
    async postUsuario(req, res) {
        try {
            const { nome, email, senha, tipo } = req.body;

            if (!nome) {
                return res.status(422).json({error: 'O campo nome é obrigatório'});
            }

            //validar e-mail
            if (email) {
                //verificar se o email já existe
                const usuarioExistente = await db.Usuario.findOne({ where: { email } });
                if (usuarioExistente) {
                    return res.status(400).json({ error: 'Email já cadastrado' });
                }
            } else {
                return res.status(422).json({error: 'O campo e-mail é obrigatório'});
            }

            //validar senha
            let senhaHash;
            if (senha) {
                //verificar se a senha atende aos critérios de segurança (RNF10)
                if (senha.length < 8) {
                    return res.status(422).json({error: 'A senha deve conter no mínimo 8 caracteres'});
                } else if (!/[a-zA-Z]/.test(senha)) {
                    return res.status(422).json({ error: 'A senha deve conter pelo menos uma letra' });
                } else if (!/\d/.test(senha)) {
                    return res.status(422).json({error: 'A senha deve conter pelo menos um número'});
                } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
                    return res.status(422).json({error: 'A senha deve conter pelo menos um caractere especial'});
                }

                senhaHash = await bcrypt.hash(senha, 10);
            } else {
                return res.status(422).json({error: 'O campo senha é obrigatório'});
            }

            //validar tipo
            const tipos = ['admin', 'usuario'];
            if(tipo) {
                if(!tipos.includes(tipo)) {
                    return res.status(422).json({error: 'O campo tipo deve ser "admin" ou "usuario"'});
                }
            } else {
                return res.status(422).json({error: 'O campo tipo é obrigatório'});
            }

            const usuario = await db.Usuario.create({
                nome,
                email,
                senha: senhaHash,
                tipo
            });

            res.status(201).json(usuario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    },
    async getUsuarios(req, res) {
        try {
            const usuarios = await db.usu
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        }
    }
}