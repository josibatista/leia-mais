const express = require('express');
const usuarioController = require('../controllers/usuarioController');

const router = express.Router();

//rotas de usuário
//rota para criar usuário
router.post('/cadastrar-usuario', usuarioController.postUsuario);
//rota para buscar todos os usuários
router.get('/usuarios', usuarioController.getUsuarios);
//rota para buscar usuário por id
router.get('/usuarios/:id', usuarioController.getUsuarioById);
//rota para atualizar usuário
router.put('/atualizar-usuario/:id', usuarioController.putUsuario);

module.exports = router;