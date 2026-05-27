document.addEventListener('DOMContentLoaded', () => {
  protegerRotaAdmin();
  configurarBotaoAdicionarAdmin();
  carregarUsuarios();
});

const API_URL = '/usuarios';

function protegerRotaAdmin() {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!token || !usuario || usuario.tipo !== 'administrador') {
    window.location.href = 'loginAdm.html';
  }
}

function configurarBotaoAdicionarAdmin() {
  const botaoAdicionarAdmin = document.getElementById('lmBotaoAdicionarAdmin');

  if (botaoAdicionarAdmin) {
    botaoAdicionarAdmin.addEventListener('click', () => {
      window.location.href = 'cadastroAdm.html';
    });
  }
}

async function carregarUsuarios() {
  const listaUsuarios = document.getElementById('lmUsuariosLista');
  const token = localStorage.getItem('token');

  try {
    const resposta = await fetch(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!resposta.ok) {
      throw new Error('Erro ao buscar usuários');
    }

    const usuarios = await resposta.json();

    listaUsuarios.innerHTML = '';

    if (!usuarios.length) {
      listaUsuarios.innerHTML = '<p class="lmCadastroMensagem">Nenhum usuário cadastrado.</p>';
      return;
    }

    usuarios.forEach(usuario => {
      const card = document.createElement('article');
      card.classList.add('lmUsuarioCard');

      const tipoUsuario = usuario.tipo === 'administrador' ? 'Administrador' : 'Leitor';
      const classeTipo = usuario.tipo === 'administrador' ? 'lmUsuarioAdmin' : 'lmUsuarioLeitor';

      card.innerHTML = `
        <div>
          <h3>${usuario.nome || usuario.username || 'Usuário sem nome'}</h3>
          <p>${usuario.email || 'E-mail não informado'}</p>
        </div>

        <span class="lmUsuarioTipo ${classeTipo}">
          ${tipoUsuario}
        </span>
      `;

      listaUsuarios.appendChild(card);
    });

  } catch (erro) {
    console.error(erro);
    listaUsuarios.innerHTML = '<p class="lmCadastroMensagem">Erro ao carregar usuários.</p>';
  }
}