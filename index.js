// test-manual.js
require('dotenv').config()

const { adicionarLivro, atualizarLivro, deletarLivro, visualizarLivros } = require('./models/livroModel')

const testarAdicionar = async () => {
    const result = await adicionarLivro({
        titulo: 'Dom ',
        descricao: 'Romance de Machado de Assis',
        anoPublicacao: 1899,
        genero: 'Romance',
        imagemCapa: 'https://example.com/capa.jpg',
        editora: 'Art'
    })

    if (result.error) {
        console.error('ERRO AO ADICIONAR:', result.error.message)
    } else {
        console.log('ADICIONADO COM SUCESSO:', result.data)
    }
}

const testarAtualizar = async () => {
    const result = await atualizarLivro({
        id: 4, // ← id do livro que existe no banco
        titulo: 'Dom Casmurro - Edição Revisada',
        descricao: 'Romance de Machado de Assis - Versão atualizada',
        anoPublicacao: 1900,
        genero: 'Romance',
        imagemCapa: 'https://example.com/nova-capa.jpg'
    })

    if (result.error) {
        console.error('ERRO AO ATUALIZAR:', result.error.message)
    } else {
        console.log('ATUALIZADO COM SUCESSO:', result.data)
    }
}

const testarDeletar = async () => {
    const result = await deletarLivro( 3 )

    if (result.error) {
        console.error('ERRO AO DELETAR:', result.error.message)
    } else {
        console.log('DELETADO COM SUCESSO')
    }
}

const testarVisualizar = async () => {
    const result = await visualizarLivros()
    if (result.error) {
        console.error('ERRO AO CONSULTAR LIVROS:', result.error.message)
    } else {
        console.log('LIVROS:', JSON.stringify(result.data, null, 2))
    }
}

const main = async () => {
    //await testarAdicionar()
    //await testarAtualizar()
    //await testarDeletar()
    await testarVisualizar()
}

main()