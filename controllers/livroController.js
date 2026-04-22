const { adicionarLivro, atualizarLivro, deletarLivro, visualizarLivros } = require('../models/livroModel')


exports.adicionarLivro = async (req, res) => {
    const { titulo, descricao, anoPublicacao, genero, imagemCapa } = req.body;
    const livro = await adicionarLivro({ titulo, descricao, anoPublicacao, genero, imagemCapa });
    if (livro.error) {
        res.status(500).json({ error: livro.error.message });
    } else {
        res.status(200).json({ message: 'Livro adicionado com sucesso' });
    }
}// --> VALIDAR ID, POIS IDS NÃO EXISTENTES AINDA SÃO LIDOS (EX: 0 ITEM NA TABELA, NOVO ITEM ~> ID 4 = ERRO)

exports.atualizarLivro = async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, anoPublicacao, genero, imagemCapa } = req.body; // ← extrai do body

    const livro = await atualizarLivro({ id, titulo, descricao, anoPublicacao, genero, imagemCapa }); // ← passa o id
    if (livro.error) {
        return res.status(500).json({ error: livro.error.message });
    } else {
        return res.status(200).json({ message: 'Livro atualizado com sucesso' });
    }

  //adicionar validação se id do autor mudou (ator selecionado)
}// IF ID EXISTE, ELSE ERRO

exports.deletarLivro = async (req, res) => {
    const { id } = req.params;
    const livro = await deletarLivro( id );
    if (livro.error) {
        res.status(500).json({ error: livro.error.message });
    } else {
        res.status(200).json({ message: 'Livro deletado com sucesso' });
    }
}// IF ID EXISTE, ELSE ERRO

exports.visualizarLivros = async (req, res) => {
  const livros = await visualizarLivros();
  if (livros.error) {
        res.status(500).json({ error: livros.error.message });
    } else {
        res.status(200).json({ data: livros.data });
    }
}