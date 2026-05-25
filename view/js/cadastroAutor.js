const lmApiAutoresUrl = `/autores/admin`;

const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!token || !usuario || usuario.tipo !== 'administrador') {
  alert('Acesso permitido apenas para administradores.');
  window.location.href = 'loginAdm.html';
}

const lmCadastroFormularioAutor = document.getElementById('lmCadastroFormularioAutor');
const nomeAutor = document.getElementById('nomeAutor');
const biografiaAutor = document.getElementById('biografiaAutor');
const lmCadastroMensagem = document.getElementById('lmCadastroMensagem');
const lmCadastroBotaoVoltar = document.getElementById('lmCadastroBotaoVoltar');

function lmExibirMensagem(texto, tipo = 'info') {
  lmCadastroMensagem.textContent = texto;
  lmCadastroMensagem.className = `lmCadastroMensagem ${tipo}`;
}

if (lmCadastroBotaoVoltar) {
  lmCadastroBotaoVoltar.addEventListener('click', () => {
    window.location.href = 'cadastroLivros.html';
  });
}

lmCadastroFormularioAutor.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nome = nomeAutor.value.trim();
  const biografia = biografiaAutor.value.trim();

  if (!nome) {
    lmExibirMensagem('Preencha o nome da autora.', 'erro');
    return;
  }

  try {
    lmExibirMensagem('Cadastrando autora...', 'info');

    const resposta = await fetch(lmApiAutoresUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nome,
        biografia
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || 'Erro ao cadastrar autora.');
    }

    lmCadastroFormularioAutor.reset();
    lmExibirMensagem('Autora cadastrada com sucesso.', 'sucesso');
  } catch (erro) {
    console.error('Erro ao cadastrar autora:', erro);
    lmExibirMensagem(erro.message || 'Não foi possível cadastrar a autora.', 'erro');
  }
});