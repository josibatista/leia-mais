const db = require('../config/db_sequelize');
const bcrypt = require('bcrypt');
const codigosRecuperacao = {};

module.exports = {
    
    async postUsuarioLeitor (req, res) {
        try {
            let { nome, email, username, senha, iconePerfil} = req.body;
            nome = nome?.trim();
            email = email?.trim();
            username = username?.trim();

            //validar nome
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

            //validar username
            if (username) {
                //verificar se o username já existe
                const usuarioExistente = await db.Usuario.findOne({ where: { username } });
                if (usuarioExistente) {
                    return res.status(400).json({ error: 'Username já cadastrado' });
                }
            } else {
                return res.status(422).json({ error: 'O campo username é obrigatório' });
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

            const usuario = await db.Usuario.create({
                nome,
                email,
                username,
                senha: senhaHash,
                tipo: 'leitor',
                iconePerfil
            });

            const usuarioCriado = await db.Usuario.findByPk(usuario.id, {
                attributes: { exclude: ['senha'] }
            });

            res.status(201).json(usuarioCriado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    },
    async postUsuarioAdministrador (req, res) {
        try {
            if (req.usuario.tipo !== 'administrador') {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            let { nome, email, username, senha, iconePerfil } = req.body;

            nome = nome?.trim();
            email = email?.trim();
            username = username?.trim();

            //validar nome
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

            //validar username
            if (username) {
                //verificar se o username já existe
                const usuarioExistente = await db.Usuario.findOne({ where: { username } });
                if (usuarioExistente) {
                    return res.status(400).json({ error: 'Username já cadastrado' });
                }
            } else {
                return res.status(422).json({ error: 'O campo username é obrigatório' });
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

            const usuario = await db.Usuario.create({
                nome,
                email,
                username,
                senha: senhaHash,
                tipo: 'administrador',
                iconePerfil
            });

            const usuarioCriado = await db.Usuario.findByPk(usuario.id, {
                attributes: { exclude: ['senha'] }
            });

            res.status(201).json(usuarioCriado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    },
    async getUsuarios(req, res) {
        try {
            const usuarios = await db.Usuario.findAll({
                attributes: { exclude: ['senha'] }
            });
            res.status(200).json(usuarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        }
    },
    async getUsuarioById(req, res) {
        try {

            const id = req.params.id;

            //checagem se está no próprio perfil ou é administrador
            if (req.usuario.tipo !== 'administrador' && String(req.usuario.id) !== String(id)) {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            const usuario = await db.Usuario.findByPk(id, {
                attributes: { exclude: ['senha'] }
            });
            
            if (usuario) {
                res.status(200).json(usuario);
            } else {
                res.status(404).json({ error: 'Usuário não encontrado' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar usuário' });
        }
    },
    async putUsuario(req, res) {
        try {
            const id = req.params.id;

            //checagem se está no próprio perfil ou é administrador
            if (req.usuario.tipo !== 'administrador' && String(req.usuario.id) !== String(id)) {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            const { nome, email, username, senha, iconePerfil } = req.body;

            const dadosAtualizados = {};

            //validar nome
            if (nome) {
                dadosAtualizados.nome = nome;
            }

            //validar e-mail
            if (email) {
                const usuarioExistente = await db.Usuario.findOne({ where: { email } });

                if (usuarioExistente && usuarioExistente.id != id) {
                    return res.status(400).json({ error: 'Email já cadastrado' });
                }

                dadosAtualizados.email = email;
            }

            //validar username
            if (username) {
                const usuarioExistente = await db.Usuario.findOne({ where: { username } });

                if (usuarioExistente && usuarioExistente.id != id) {
                    return res.status(400).json({ error: 'Username já cadastrado' });
                }

                dadosAtualizados.username = username;
            }

            //validar senha
            if (senha) {
                if (senha.length < 8) {
                    return res.status(422).json({ error: 'A senha deve conter no mínimo 8 caracteres' });
                } else if (!/[a-zA-Z]/.test(senha)) {
                    return res.status(422).json({ error: 'A senha deve conter pelo menos uma letra' });
                } else if (!/\d/.test(senha)) {
                    return res.status(422).json({ error: 'A senha deve conter pelo menos um número' });
                } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
                    return res.status(422).json({ error: 'A senha deve conter pelo menos um caractere especial' });
                }

                dadosAtualizados.senha = await bcrypt.hash(senha, 10);
            }

            //validar iconePerfil
            if (iconePerfil !== undefined) {
                if (iconePerfil && typeof iconePerfil !== 'string') {
                    return res.status(422).json({ error: 'O campo iconePerfil deve ser uma string' });
                }
                dadosAtualizados.iconePerfil = iconePerfil;
            }

            //verifica se mandou algo
            if (Object.keys(dadosAtualizados).length === 0) {
                return res.status(400).json({ error: 'Nenhum dado para atualizar' });
            }

            const [updated] = await db.Usuario.update(dadosAtualizados, {
                where: { id }
            });

            if (updated) {
                const usuarioAtualizado = await db.Usuario.findByPk(id, {
                    attributes: { exclude: ['senha'] }
                });
                return res.status(200).json(usuarioAtualizado);
            } else {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    },
    async deleteUsuario(req, res) {
        try {
            const id = req.params.id;

            //checagem se está no próprio perfil ou é administrador
            if (req.usuario.tipo !== 'administrador' && String(req.usuario.id) !== String(id)) {
                return res.status(403).json({ error: 'Acesso negado' });
            }

            const deleted = await db.Usuario.destroy({
                where: { id: req.params.id }
            });
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: 'Usuário não encontrado' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
    },
    async enviarCodigo(req, res) {
        try {
            const { username } = req.body;

            if (!username) {
                return res.status(422).json({ error: 'Informe seu usuário.' });
            }

            const usuario = await db.Usuario.findOne({ where: { username } });

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não existe.' });
            }

            const codigo = Math.floor(100000 + Math.random() * 900000);

            codigosRecuperacao[username] = codigo;

            res.json({
                msg: 'Código gerado com sucesso.',
                codigo
            });

        } catch (error) {
            res.status(500).json({ error: 'Erro ao enviar código' });
        }
    }, 
    async redefinirSenha(req, res) {
        try {
            const { username, codigo, novaSenha } = req.body;

            const usuario = await db.Usuario.findOne({ where: { username } });

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não existe.' });
            }

            const codigoSalvo = codigosRecuperacao[username];

            if (String(codigoSalvo) !== String(codigo)) {
                return res.status(403).json({ error: 'Código inválido' });
            }

            //validar senha
            if (!novaSenha) {
                return res.status(422).json({ error: 'O campo senha é obrigatório' });
            }

            if (novaSenha.length < 8) {
                return res.status(422).json({ error: 'Senha deve ter no mínimo 8 caracteres' });
            }
            if (!/[a-zA-Z]/.test(novaSenha)) {
                return res.status(422).json({ error: 'A senha deve conter pelo menos uma letra' });
            }
            if (!/\d/.test(novaSenha)) {
                return res.status(422).json({ error: 'A senha deve conter pelo menos um número' });
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(novaSenha)) {
                return res.status(422).json({ error: 'A senha deve conter pelo menos um caractere especial' });
            }

            const hash = await bcrypt.hash(novaSenha, 10);

            usuario.senha = hash;
            await usuario.save();

            delete codigosRecuperacao[username];

            res.json({ msg: 'Senha alterada com sucesso' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao redefinir senha' });
        }
    }
}