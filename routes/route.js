const express = require('express');
const router = express.Router();

const livroController = require('../controllers/livroController');
const autorController = require('../controllers/autorController');
const livroAutorController = require('../controllers/livroAutorController');
const autenticarToken = require('../middleware/autenticarToken');
const checkAdmin = require('../middleware/checkAdmin');

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

// autores disponíveis para o select
router.get('/autores/disponiveis', livroAutorController.getAutoresDisponiveis);

router.put('/autores/:id/admin', autorController.putAutor);
router.delete('/autores/:id/admin', autorController.deleteAutor);

router.get('/autores', autorController.getAutores);
router.get('/autores/:id', autorController.getAutorById);

// Rotas - LivroAutor
// autores de um livro
router.get('/livros/:id/autores', livroAutorController.getAutoresDoLivro);

router.get('/autores/:id/livros', livroAutorController.getLivrosDoAutor);

// vincular autores ao livro
router.post('/livros/:id/autores/admin', livroAutorController.vincularAutores);

// desvincular autor específico do livro
router.delete('/livros/:id/autores/:autorId/admin', livroAutorController.desvincularAutor);

module.exports = router;