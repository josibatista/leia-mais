const API_URL = 'http://localhost:8080';
const lmApiAutoresUrl = `${API_URL}/autores/admin`;

const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!token || !usuario || usuario.tipo !== 'administrador') {
  alert('Acesso permitido apenas para administradores.');
  window.location.href = 'loginAdm.html';
}

const blFormularioCadastroAutor = document.getElementById('blFormularioCadastroAutor');
const blNomeAutor = document.getElementById('blNomeAutor');
const blBiografiaAutor = document.getElementById('blBiografiaAutor');

function blExibirMensagem(texto, tipo = 'info') {
  let mensagem = document.getElementById('blMensagemCadastroAutor');

  if (!mensagem) {
    mensagem = document.createElement('p');
    mensagem.id = 'blMensagemCadastroAutor';
    mensagem.className = 'blMensagemCadastroAutor';
    blFormularioCadastroAutor.appendChild(mensagem);
  }

  mensagem.textContent = texto;
  mensagem.className = `blMensagemCadastroAutor ${tipo}`;
}

blFormularioCadastroAutor.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const nome = blNomeAutor.value.trim();
  const biografia = blBiografiaAutor.value.trim();

  if (!nome) {
    blExibirMensagem('Preencha nome do autor.', 'erro');
    return;
  }

  try {
    blExibirMensagem('Cadastrando autor...', 'info');

    const resposta = await fetch(lmApiAutoresUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nome,
        biografia
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || 'Erro ao cadastrar autor.');
    }

    blFormularioCadastroAutor.reset();
    blExibirMensagem('Autor cadastrado com sucesso.', 'sucesso');
  } catch (erro) {
    console.error('Erro ao cadastrar autor:', erro);
    blExibirMensagem(erro.message || 'Não foi possível cadastrar o autor.', 'erro');
  }
});