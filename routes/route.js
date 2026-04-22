const express = require('express');
const autenticacaoController = require('../controllers/autenticacaoController');
const usuarioController = require('../controllers/usuarioController');
const autenticarToken = require('../middleware/autenticarToken');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

//rota de login
router.post('/login', autenticacaoController.login);

//rotas de usuário
//rota para criar usuário (público)
router.post('/usuarios', usuarioController.postUsuario);
//rota para buscar todos os usuários (apenas para administradores)
router.get('/usuarios', autenticarToken,checkAdmin, usuarioController.getUsuarios);
//rota para buscar usuário por id (apenas para administradores ou para o próprio usuário)
router.get('/usuarios/:id', autenticarToken, usuarioController.getUsuarioById);
//rota para atualizar usuário (apenas para administradores ou para o próprio usuário)
router.put('/usuarios/:id', autenticarToken, usuarioController.putUsuario);
//rota para deletar usuário (apenas para administradores ou para o próprio usuário)
router.delete('/usuarios/:id', autenticarToken, usuarioController.deleteUsuario);

module.exports = router;