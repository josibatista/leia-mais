const express = require('express');
const usuarioController = require('../controllers/usuarioController');

const router = express.Router();

//rota para criar usuário
router.post('/cadastrar-usuario', usuarioController.postUsuario);

module.exports = router;