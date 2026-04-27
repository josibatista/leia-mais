const express = require('express');
const livroController = require('../controllers/livroController');

const router = express.Router();

router.post('/livros', livroController.postLivro);
router.put('/livros/:id', livroController.putLivro);

module.exports = router;