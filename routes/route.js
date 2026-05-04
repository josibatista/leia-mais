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
const autenticacaoController = require('../controllers/autenticacaoController');
const usuarioController = require('../controllers/usuarioController');

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
//rotas para recuperação de senha (envio de código e redefinição de senha)
router.post('/esqueci-senha', usuarioController.enviarCodigo);
router.put('/redefinir-senha', usuarioController.redefinirSenha);

module.exports = router;