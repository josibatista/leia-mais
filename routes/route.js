const express = require('express');
const usuarioController = require('../controllers/usuarioController');

const router = express.Router();

//rotas de usuário
//rota para criar usuário
router.post('/cadastrar-usuario', usuarioController.postUsuario);
//rota para buscar todos os usuários
router.get('/usuarios', usuarioController.getUsuarios);

module.exports = router;