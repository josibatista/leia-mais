const express = require('express');
const router = express.Router();

const livroController = require('../controllers/livroController');
const autenticarToken = require('../middlewares/autenticarToken');
const checkAdmin = require('../middlewares/checkAdmin');


router.post('/livros', livroController.postLivro);
router.put('/livros/:id', livroController.putLivro);
router.delete('/livros/:id', livroController.deleteLivro);
router.get('/livros', livroController.getLivros);
router.get('/livros/:id', livroController.getLivroById);

/*
// Rotas apenas para administradores ou para o próprio usuário
router.get('/livros', autenticarToken, livroController.getLivros);
router.get('/livros/:id', autenticarToken, livroController.getLivroById);

// Rotas apenas para administradores 
router.post('/livros', autenticarToken, checkAdmin, livroController.postLivro);
router.put('/livros/:id', autenticarToken, checkAdmin, livroController.putLivro);
router.delete('/livros/:id', autenticarToken, checkAdmin, livroController.deleteLivro);
*/

module.exports = router;