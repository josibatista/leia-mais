const express = require('express');
const router = express.Router();

const livroController = require('../controllers/livroController');
const autorController = require('../controllers/autorController');
const livroAutorController = require('../controllers/livroAutorController');
const usuarioController = require('../controllers/usuarioController');
const usuarioLivroController = require('../controllers/usuarioLivroController');
const autenticacaoController = require('../controllers/autenticacaoController');
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
router.post('/autores/admin', autenticarToken, checkAdmin, autorController.postAutor);

// autores disponíveis para o select
router.get('/autores/disponiveis', livroAutorController.getAutoresDisponiveis);

router.put('/autores/:id/admin', autenticarToken, checkAdmin, autorController.putAutor);
router.delete('/autores/:id/admin', autenticarToken, checkAdmin, autorController.deleteAutor);

router.get('/autores', autorController.getAutores);
router.get('/autores/:id', autorController.getAutorById);

// Rotas - LivroAutor
// autores de um livro
router.get('/livros/:id/autores', livroAutorController.getAutoresDoLivro);

router.get('/autores/:id/livros', livroAutorController.getLivrosDoAutor);

// vincular autores ao livro
router.post('/livros/:id/autores/admin', autenticarToken, checkAdmin, livroAutorController.vincularAutores);

// desvincular autor específico do livro
router.delete('/livros/:id/autores/:autorId/admin', autenticarToken, checkAdmin, livroAutorController.desvincularAutor);

//rota de login
router.post('/login', autenticacaoController.login);

//rotas de usuário
//rota para criar usuário (público)
router.post('/usuarios', usuarioController.postUsuarioLeitor);
//rota para criar usuário administrador (apenas para administradores)
router.post('/usuarios/admin', autenticarToken, checkAdmin, usuarioController.postUsuarioAdministrador);
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

//rota para
router.post('/usuarios/:id/livros', autenticarToken, usuarioLivroController.postUsuarioLivro);
//rota para atualizar status, páginas lidas ou nota do livro do usuário
router.put('/usuarios/:usuarioId/livros/:livroId', autenticarToken, usuarioLivroController.putUsuarioLivro);
//rota para remover livro da lista do usuário
router.delete('/usuarios/:usuarioId/livros/:livroId', autenticarToken, usuarioLivroController.deleteUsuarioLivro);
//rota para buscar livros do usuário
router.get('/usuarios/:id/livros', autenticarToken, usuarioLivroController.getUsuarioLivro);
//rota para visualizar detalhes do livro do usuário (status, páginas lidas e nota)
router.get('/usuarios/:usuarioId/livros/:livroId', autenticarToken, usuarioLivroController.getUsuarioLivroById);

module.exports = router;