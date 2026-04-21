const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db_sequelize');

module.exports = {
    async login(req, res) {
        try {
            const { email, senha } = req.body;

            // busca usuário
            const user = await db.Usuario.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // verifica senha
            const senhaValida = await bcrypt.compare(senha, user.senha);

            if (!senhaValida) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // gera token
            const token = jwt.sign(
                {
                    id: user.id,
                    tipo: user.tipo
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.status(200).json({
                token,
                usuario: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    tipo: user.tipo,
                    imagemPerfil: user.imagemPerfil,
                    xp: user.xp
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({ error: 'Erro ao realizar login' });
        }
    }
};
