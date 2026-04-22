const supabase = require('../config/db.js')

// Admin
const adicionarLivro = async (livro) => {
  const { data, error } = await supabase
    .from('Livro')
    .insert(livro)
    .select()
  return { data, error }
}

const atualizarLivro = async (livro) => {
    const { data, error } = await supabase
        .from('Livro')
        .update({
            titulo: livro.titulo,
            descricao: livro.descricao,
            anoPublicacao: livro.anoPublicacao,
            genero: livro.genero,
            imagemCapa: livro.imagemCapa
        })
        .eq('id', livro.id) // ← id não é atualizado, só usado para filtrar
        .select()
    return { data, error }
}

const deletarLivro = async (id) => {
  const { data, error } = await supabase
    .from('Livro')
    .delete()
    .eq('id', id)
    .select()
  return { data, error }
}

// Público
const visualizarLivros = async () => {
  const { data, error } = await supabase
    .from('Livro')
    .select(`
      id,
      titulo,
      descricao,
      anoPublicacao,
      genero,
      imagemCapa
    `)
  return { data, error }
}

module.exports = { adicionarLivro, atualizarLivro, deletarLivro, visualizarLivros }