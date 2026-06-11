document.addEventListener('DOMContentLoaded', function () {
  if (!protegerRotaAdmin()) {
    return;
  }

  lmConfigurarBuscaAutores();
  lmConfigurarModalEdicaoAutor();
  lmConfigurarModalExclusaoAutor();
  lmConfigurarBotaoAdicionarAutor();
  lmCarregarAutores();
});

const lmApiAutoresUrl = '/autores';

let lmAutoresCarregados = [];
let lmAutorEmEdicao = null;
let lmAutorParaExcluir = null;

function lmConfigurarBotaoAdicionarAutor() {
  const botaoAdicionarAutor = document.getElementById('lmBotaoAdicionarAutor');

  if (!botaoAdicionarAutor) return;

  botaoAdicionarAutor.addEventListener('click', function () {
    window.location.href = '/pages/autores/cadastro.html';
  });
}

function lmObterHeadersJson() {
  const token = obterToken();

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

async function lmCarregarAutores() {
  const listaAutores = document.getElementById('lmAutoresLista');

  try {
    const resposta = await fetch(lmApiAutoresUrl);

    if (resposta.status === 404) {
      lmAutoresCarregados = [];
      lmRenderizarAutores([]);
      return;
    }

    if (!resposta.ok) {
      throw new Error('Erro ao carregar autores.');
    }

    const autores = await resposta.json();

    lmAutoresCarregados = Array.isArray(autores)
      ? autores
      : [];

    lmRenderizarAutores(lmAutoresCarregados);

  } catch (erro) {
    console.error('Erro ao carregar autores:', erro);

    listaAutores.innerHTML = `
      <p class="lmCadastroMensagem">
        Erro ao carregar autores.
      </p>
    `;
  }
}

function lmRenderizarAutores(autores) {
  const listaAutores = document.getElementById('lmAutoresLista');

  listaAutores.innerHTML = '';

  if (!Array.isArray(autores) || autores.length === 0) {
    listaAutores.innerHTML = `
      <p class="lmCadastroMensagem">
        Nenhum autor encontrado.
      </p>
    `;
    return;
  }

  autores.forEach(function (autor) {
    listaAutores.appendChild(
      lmCriarCardAutor(autor)
    );
  });
}

function lmCriarCardAutor(autor) {
  const card = document.createElement('article');

  card.classList.add(
    'lmItemLista',
    'lmAutorCard'
  );

  const conteudoAutor = document.createElement('div');
  conteudoAutor.classList.add('lmAutorInfo');

  const nomeAutor = document.createElement('h3');
  nomeAutor.textContent =
    autor.nome || 'Autor sem nome';

  const biografiaAutor = document.createElement('p');
  biografiaAutor.textContent =
    autor.biografia || 'Biografia não informada.';

  conteudoAutor.appendChild(nomeAutor);
  conteudoAutor.appendChild(biografiaAutor);

  const acoesAutor = document.createElement('div');

  acoesAutor.classList.add(
    'lmAutorAcoes'
  );

  const botaoEditar = document.createElement('button');

  botaoEditar.type = 'button';

  botaoEditar.classList.add(
    'lmBotaoAdminIcone'
  );

  botaoEditar.setAttribute(
    'aria-label',
    'Editar autor'
  );

  botaoEditar.innerHTML = `
    <svg class="lmIconeAdminLivro"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round">

      <path d="M12 20h9"></path>

      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z">
      </path>
    </svg>
  `;

  botaoEditar.addEventListener('click', function () {
    lmAbrirModalEdicaoAutor(autor);
  });

  const botaoExcluir = document.createElement('button');

  botaoExcluir.type = 'button';

  botaoExcluir.classList.add(
    'lmBotaoAdminIcone'
  );

  botaoExcluir.setAttribute(
    'aria-label',
    'Excluir autor'
  );

  botaoExcluir.innerHTML = `
    <svg class="lmIconeAdminLivro"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round">

      <polyline points="3 6 5 6 21 6"></polyline>

      <path d="M19 6l-1 14H6L5 6"></path>

      <path d="M10 11v6"></path>

      <path d="M14 11v6"></path>

      <path d="M9 6V4h6v2"></path>
    </svg>
  `;

  botaoExcluir.addEventListener('click', function () {
    lmAbrirModalExclusaoAutor(autor);
  });

  acoesAutor.appendChild(botaoEditar);
  acoesAutor.appendChild(botaoExcluir);

  card.appendChild(conteudoAutor);
  card.appendChild(acoesAutor);

  return card;
}

function lmNormalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function lmConfigurarBuscaAutores() {
  const botaoAbrirBusca = document.getElementById('lmBotaoAbrirBusca');
  const buscaHeader = document.getElementById('lmBuscaHeader');
  const campoBuscaAutores = document.getElementById('lmCampoBuscaAutores');

  if (!botaoAbrirBusca || !buscaHeader || !campoBuscaAutores) {
    return;
  }

  botaoAbrirBusca.addEventListener('click', function () {
    buscaHeader.classList.toggle('ativo');

    if (buscaHeader.classList.contains('ativo')) {
      campoBuscaAutores.focus();
    }
  });

  campoBuscaAutores.addEventListener('input', function () {
    const termoBusca = lmNormalizarTexto(campoBuscaAutores.value);

    const autoresFiltrados = lmAutoresCarregados.filter(function (autor) {
      const nome = lmNormalizarTexto(autor.nome);
      const biografia = lmNormalizarTexto(autor.biografia);

      return nome.includes(termoBusca) || biografia.includes(termoBusca);
    });

    lmRenderizarAutores(termoBusca ? autoresFiltrados : lmAutoresCarregados);
  });
}

function lmConfigurarModalEdicaoAutor() {
  const modal = document.getElementById(
    'lmModalEditarAutor'
  );

  const botaoFechar = document.getElementById(
    'lmFecharModalEditarAutor'
  );

  const botaoCancelar = document.getElementById(
    'lmCancelarEdicaoAutor'
  );

  const formulario = document.getElementById(
    'lmFormularioEditarAutor'
  );

  botaoFechar.addEventListener(
    'click',
    lmFecharModalEdicaoAutor
  );

  botaoCancelar.addEventListener(
    'click',
    lmFecharModalEdicaoAutor
  );

  modal.addEventListener('click', function (evento) {
    if (evento.target === modal) {
      lmFecharModalEdicaoAutor();
    }
  });

  formulario.addEventListener(
    'submit',
    lmSalvarEdicaoAutor
  );
}

function lmAbrirModalEdicaoAutor(autor) {
  lmAutorEmEdicao = autor;

  document.getElementById(
    'lmEditarAutorId'
  ).value = autor.id;

  document.getElementById(
    'lmEditarNomeAutor'
  ).value = autor.nome || '';

  document.getElementById(
    'lmEditarBiografiaAutor'
  ).value = autor.biografia || '';

  document.getElementById(
    'lmMensagemEditarAutor'
  ).textContent = '';

  document
    .getElementById('lmModalEditarAutor')
    .classList.add('lmModalOverlayAtivo');
}

function lmFecharModalEdicaoAutor() {
  document
    .getElementById('lmModalEditarAutor')
    .classList.remove('lmModalOverlayAtivo');

  document
    .getElementById('lmFormularioEditarAutor')
    .reset();

  document.getElementById(
    'lmMensagemEditarAutor'
  ).textContent = '';

  lmAutorEmEdicao = null;
}

async function lmSalvarEdicaoAutor(evento) {
  evento.preventDefault();

  if (!lmAutorEmEdicao) return;

  const mensagem = document.getElementById(
    'lmMensagemEditarAutor'
  );

  const autorId = document.getElementById(
    'lmEditarAutorId'
  ).value;

  const nome = document.getElementById(
    'lmEditarNomeAutor'
  ).value.trim();

  const biografia = document.getElementById(
    'lmEditarBiografiaAutor'
  ).value.trim();

  if (!nome) {
    mensagem.textContent =
      'O nome do autor é obrigatório.';
    return;
  }

  try {
    const resposta = await fetch(
      `/autores/${autorId}/admin`,
      {
        method: 'PUT',
        headers: lmObterHeadersJson(),
        body: JSON.stringify({
          nome,
          biografia
        })
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.error || 'Erro ao editar autor.'
      );
    }

    lmFecharModalEdicaoAutor();

    await lmCarregarAutores();

  } catch (erro) {
    console.error('Erro ao editar autor:', erro);

    mensagem.textContent =
      erro.message ||
      'Não foi possível editar o autor.';
  }
}

function lmConfigurarModalExclusaoAutor() {
  const modal = document.getElementById(
    'lmModalExcluirAutor'
  );

  const botaoFechar = document.getElementById(
    'lmFecharModalExcluirAutor'
  );

  const botaoCancelar = document.getElementById(
    'lmCancelarExclusaoAutor'
  );

  const botaoConfirmar = document.getElementById(
    'lmConfirmarExclusaoAutor'
  );

  botaoFechar.addEventListener(
    'click',
    lmFecharModalExclusaoAutor
  );

  botaoCancelar.addEventListener(
    'click',
    lmFecharModalExclusaoAutor
  );

  modal.addEventListener('click', function (evento) {
    if (evento.target === modal) {
      lmFecharModalExclusaoAutor();
    }
  });

  botaoConfirmar.addEventListener(
    'click',
    lmExcluirAutor
  );
}

function lmAbrirModalExclusaoAutor(autor) {
  lmAutorParaExcluir = autor;

  document.getElementById(
    'lmTextoExcluirAutor'
  ).textContent =
    `Tem certeza que deseja excluir "${autor.nome}"?`;

  document
    .getElementById('lmModalExcluirAutor')
    .classList.add('lmModalOverlayAtivo');
}

function lmFecharModalExclusaoAutor() {
  document
    .getElementById('lmModalExcluirAutor')
    .classList.remove('lmModalOverlayAtivo');

  lmAutorParaExcluir = null;
}

async function lmExcluirAutor() {
  if (!lmAutorParaExcluir) return;

  try {
    const resposta = await fetch(
      `/autores/${lmAutorParaExcluir.id}/admin`,
      {
        method: 'DELETE',
        headers: lmObterHeadersJson()
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.error || 'Erro ao excluir autor.'
      );
    }

    lmFecharModalExclusaoAutor();

    await lmCarregarAutores();

  } catch (erro) {
    console.error('Erro ao excluir autor:', erro);

    alert(
      erro.message ||
      'Não foi possível excluir o autor.'
    );
  }
}
