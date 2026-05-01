const express = require('express');
const router = express.Router();

const livroController = require('../controllers/livroController');
const autorController = require('../controllers/autorController');
const autenticarToken = require('../middleware/autenticarToken');
const checkAdmin = require('../middleware/checkAdmin');
const autor = require('../models/autor');

// Rotas - Livro
router.post('/livros/admin', livroController.postLivro);
router.put('/livros/:id/admin', livroController.putLivro);
router.delete('/livros/:id/admin', livroController.deleteLivro);

router.get('/livros', livroController.getLivros);
router.get('/livros/:id', livroController.getLivroById);

/*
// Rotas para administradores, para o próprio usuário ou leitor*
router.get('/livros', livroController.getLivros);
router.get('/livros/:id', livroController.getLivroById);

// Rotas apenas para administradores 
router.post('/livros', autenticarToken, checkAdmin, livroController.postLivro);
router.put('/livros/:id', autenticarToken, checkAdmin, livroController.putLivro);
router.delete('/livros/:id', autenticarToken, checkAdmin, livroController.deleteLivro);
*/

//Rotas - Autor
router.post('/autores/admin', autorController.postAutor);
router.put('/autores/:id/admin', autorController.putAutor);
router.delete('/autores/:id/admin', autorController.deleteAutor);

router.get('/autores', autorController.getAutores);

module.exports = router;