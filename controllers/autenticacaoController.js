const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db_sequelize');
const secretKey = process.env.JWT_SECRET;
const { Op } = require('sequelize');

module.exports = {
    
    async login(req, res) {
        try {
            let { login, senha } = req.body;

            if (login) {
                login = login?.trim();
            }

            //verifica se o usuário existe
            const usuario = await db.Usuario.findOne({
                where: {
                    [Op.or]: [
                        { email: login },
                        { username: login }
                    ]
                }
            });

            if (!usuario) {
                return res.status(401).json({
                    error: 'Usuário não encontrado'
                });
            }
            
            //verifica se a senha está correta
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ error: 'Senha incorreta' });
            }

            const token = generateToken(usuario);

            //retorna o token e dados básicos
            res.status(200).json({
                token,
                usuario: {
                    id: usuario.id,
                    username: usuario.username,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipo: usuario.tipo
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao processar login' });
        }
    }
};

function generateToken(usuario) {
    const payload = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: '180m' });
    return token;
}