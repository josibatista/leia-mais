const lmApiLivrosUrl = 'http://localhost:8080/livros';

const lmSaudacaoUsuario = document.getElementById('lmSaudacaoUsuario');

const lmUsuario = JSON.parse(localStorage.getItem('usuario')) || {};

function lmAtualizarSaudacaoUsuario() {
  if (lmUsuario.nome && lmUsuario.nome.trim() !== '') {
    lmSaudacaoUsuario.innerHTML = `Olá,<br><strong>${lmUsuario.nome}!</strong>`;
  } else {
    lmSaudacaoUsuario.textContent = 'Olá!';
  }
}

lmAtualizarSaudacaoUsuario();

const lmMenuAbrirBotao = document.getElementById('lmMenuAbrirBotao');
const lmMenuFecharBotao = document.getElementById('lmMenuFecharBotao');
const lmMenuLateral = document.getElementById('lmMenuLateral');
const lmMenuOverlay = document.getElementById('lmMenuOverlay');

lmMenuAbrirBotao.addEventListener('click', function () {
  lmMenuLateral.classList.add('lmMenuLateralAberto');
  lmMenuOverlay.classList.add('lmMenuOverlayAtivo');
});

lmMenuFecharBotao.addEventListener('click', function () {
  lmMenuLateral.classList.remove('lmMenuLateralAberto');
  lmMenuOverlay.classList.remove('lmMenuOverlayAtivo');
});

lmMenuOverlay.addEventListener('click', function () {
  lmMenuLateral.classList.remove('lmMenuLateralAberto');
  lmMenuOverlay.classList.remove('lmMenuOverlayAtivo');
});

const lmModalOverlay = document.getElementById('lmModalOverlay');
const lmModalFechar = document.getElementById('lmModalFechar');
const lmModalTitulo = document.getElementById('lmModalTitulo');
const lmModalAutor = document.getElementById('lmModalAutor');
const lmModalGenero = document.getElementById('lmModalGenero');
const lmModalDescricao = document.getElementById('lmModalDescricao');
const lmModalAvaliacao = document.getElementById('lmModalAvaliacao');
const lmGradeLivros = document.getElementById('lmGradeLivros');

const lmBotaoAbrirBusca = document.getElementById('lmBotaoAbrirBusca');
const lmBuscaHeader = document.getElementById('lmBuscaHeader');
const lmCampoBuscaLivros = document.getElementById('lmCampoBuscaLivros');

let lmLivrosCarregados = [];

lmBotaoAbrirBusca.addEventListener('click', function () {
  lmBuscaHeader.classList.toggle('ativo');

  if (lmBuscaHeader.classList.contains('ativo')) {
    lmCampoBuscaLivros.focus();
  }
});

function lmObterNomeAutor(livro) {
  if (livro.nomeAutor) return livro.nomeAutor;
  if (livro.autor && livro.autor.nome) return livro.autor.nome;
  if (livro.autor && livro.autor.nomeAutor) return livro.autor.nomeAutor;

  if (Array.isArray(livro.autores) && livro.autores.length > 0) {
    return livro.autores
      .map(function (autor) {
        return autor.nome || autor.nomeAutor;
      })
      .filter(Boolean)
      .join(', ');
  }

  return 'Autor não informado';
}

function lmFormatarAvaliacao(avaliacaoLivro) {
  const avaliacaoNumerica = Number(avaliacaoLivro);

  if (!avaliacaoLivro && avaliacaoLivro !== 0) {
    return 'Sem avaliação';
  }

  if (Number.isNaN(avaliacaoNumerica)) {
    return String(avaliacaoLivro);
  }

  const estrelasCheias = Math.max(0, Math.min(5, Math.round(avaliacaoNumerica)));
  return '★'.repeat(estrelasCheias) + '☆'.repeat(5 - estrelasCheias);
}

function lmAbrirModalLivro(livro) {
  lmModalTitulo.textContent = livro.titulo || 'Título não informado';
  lmModalAutor.textContent = lmObterNomeAutor(livro);
  lmModalGenero.textContent = livro.genero || 'Gênero não informado';
  lmModalDescricao.textContent = livro.descricao || 'Descrição não informada.';
  lmModalAvaliacao.textContent = lmFormatarAvaliacao(livro.mediaNota);

  lmModalOverlay.classList.add('lmModalOverlayAtivo');
}

function lmObterHeadersJson() {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function lmCarregarAutoresDisponiveis() {
  try {
    const resposta = await fetch('http://localhost:8080/autores/disponiveis');

    if (!resposta.ok) {
      throw new Error('Erro ao carregar autores disponíveis.');
    }

    const dados = await resposta.json();

    return dados.autores || [];
  } catch (erro) {
    console.error('Erro ao carregar autores:', erro);
    return [];
  }
}

async function lmAtualizarAutoresDoLivro(livroId, autoresAtuais, novoAutorId) {
  for (const autor of autoresAtuais) {
    await fetch(`http://localhost:8080/livros/${livroId}/autores/${autor.id}/admin`, {
      method: 'DELETE',
      headers: lmObterHeadersJson()
    });
  }

  const respostaVinculo = await fetch(`http://localhost:8080/livros/${livroId}/autores/admin`, {
    method: 'POST',
    headers: lmObterHeadersJson(),
    body: JSON.stringify({
      autoresIds: [Number(novoAutorId)]
    })
  });

  const dadosVinculo = await respostaVinculo.json();

  if (!respostaVinculo.ok) {
    throw new Error(dadosVinculo.error || 'Livro editado, mas não foi possível atualizar o autor.');
  }
}

async function lmEditarLivro(livro) {
  const autoresDisponiveis = await lmCarregarAutoresDisponiveis();

  if (autoresDisponiveis.length === 0) {
    alert('Nenhum autor disponível para vincular ao livro.');
    return;
  }

  const listaAutores = autoresDisponiveis
    .map(function (autor) {
      return `${autor.id} - ${autor.nome}`;
    })
    .join('\n');

  const titulo = prompt('Título do livro:', livro.titulo || '');
  if (titulo === null) return;

  const editora = prompt('Editora:', livro.editora || '');
  if (editora === null) return;

  const anoPublicacao = prompt('Ano de publicação:', livro.anoPublicacao || '');
  if (anoPublicacao === null) return;

  const genero = prompt('Gênero:', livro.genero || '');
  if (genero === null) return;

  const descricao = prompt('Descrição:', livro.descricao || '');
  if (descricao === null) return;

  const imagemCapa = prompt('URL da imagem de capa:', livro.imagemCapa || '');
  if (imagemCapa === null) return;

  const autorAtualId = livro.autores && livro.autores.length > 0 ? livro.autores[0].id : '';

  const novoAutorId = prompt(
    `Digite o ID do novo autor:\n\n${listaAutores}`,
    autorAtualId
  );

  if (novoAutorId === null) return;

  const autorExiste = autoresDisponiveis.some(function (autor) {
    return Number(autor.id) === Number(novoAutorId);
  });

  if (!autorExiste) {
    alert('Autor inválido. Informe um ID existente.');
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:8080/livros/${livro.id}/admin`, {
      method: 'PUT',
      headers: lmObterHeadersJson(),
      body: JSON.stringify({
        titulo,
        editora,
        anoPublicacao,
        genero,
        descricao,
        imagemCapa
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || 'Erro ao editar livro.');
    }

    await lmAtualizarAutoresDoLivro(livro.id, livro.autores || [], novoAutorId);

    alert('Livro e autor atualizados com sucesso.');
    lmCarregarLivros();
  } catch (erro) {
    console.error('Erro ao editar livro:', erro);
    alert(erro.message || 'Não foi possível editar o livro.');
  }
}

async function lmExcluirLivro(idLivro) {
  const confirmar = confirm('Tem certeza que deseja excluir este livro?');

  if (!confirmar) return;

  try {
    const resposta = await fetch(`http://localhost:8080/livros/${idLivro}/admin`, {
      method: 'DELETE',
      headers: lmObterHeadersJson()
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || 'Erro ao excluir livro.');
    }

    alert('Livro excluído com sucesso.');
    lmCarregarLivros();
  } catch (erro) {
    console.error('Erro ao excluir livro:', erro);
    alert(erro.message || 'Não foi possível excluir o livro.');
  }
}

function lmCriarCardLivro(livro) {
  const cardLivro = document.createElement('article');
  cardLivro.classList.add('lmCardLivro');

  const imagemLivro = document.createElement('div');
  imagemLivro.classList.add('lmCardImagem');

  if (livro.imagemCapa) {
    imagemLivro.style.backgroundImage = `url('${livro.imagemCapa}')`;
  } else {
    imagemLivro.classList.add('lmCardImagemSemCapa');
    imagemLivro.textContent = 'Sem capa';
  }

  const conteudoCard = document.createElement('div');
  conteudoCard.classList.add('lmCardConteudo');

  const tituloLivro = document.createElement('h3');
  tituloLivro.classList.add('lmCardTitulo');
  tituloLivro.textContent = livro.titulo || 'Título não informado';

  const nomeAutor = document.createElement('p');
  nomeAutor.classList.add('lmCardAutor');
  nomeAutor.textContent = lmObterNomeAutor(livro);

  const botaoSaibaMais = document.createElement('button');
  botaoSaibaMais.classList.add('lmBotaoSaibaMais');
  botaoSaibaMais.type = 'button';
  botaoSaibaMais.textContent = 'Saiba Mais';

  botaoSaibaMais.addEventListener('click', function () {
    lmAbrirModalLivro(livro);
  });

  conteudoCard.appendChild(tituloLivro);
  conteudoCard.appendChild(nomeAutor);
  conteudoCard.appendChild(botaoSaibaMais);

  if (lmUsuarioEhAdmin()) {
    const acoesAdmin = document.createElement('div');
    acoesAdmin.classList.add('lmCardAcoesAdmin');

    const botaoEditarLivro = document.createElement('button');
    botaoEditarLivro.classList.add('lmBotaoAdminLivro');
    botaoEditarLivro.type = 'button';
    botaoEditarLivro.setAttribute('aria-label', 'Editar livro');
    botaoEditarLivro.dataset.idLivro = livro.id;
    botaoEditarLivro.innerHTML = `
      <svg class="lmIconeAdminLivro" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
      </svg>
    `;
    botaoEditarLivro.addEventListener('click', function () {
      lmEditarLivro(livro);
    });

    const botaoExcluirLivro = document.createElement('button');
    botaoExcluirLivro.classList.add('lmBotaoAdminLivro');
    botaoExcluirLivro.type = 'button';
    botaoExcluirLivro.setAttribute('aria-label', 'Excluir livro');
    botaoExcluirLivro.dataset.idLivro = livro.id;
    botaoExcluirLivro.innerHTML = `
      <svg class="lmIconeAdminLivro" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6l-1 14H6L5 6"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
        <path d="M9 6V4h6v2"></path>
      </svg>
    `;
    botaoExcluirLivro.addEventListener('click', function () {
      lmExcluirLivro(livro.id);
    });

    acoesAdmin.appendChild(botaoEditarLivro);
    acoesAdmin.appendChild(botaoExcluirLivro);
    conteudoCard.appendChild(acoesAdmin);
  }

  cardLivro.appendChild(imagemLivro);
  cardLivro.appendChild(conteudoCard);

  return cardLivro;
}

function lmRenderizarLivros(livros) {
  lmGradeLivros.innerHTML = '';

  if (!Array.isArray(livros) || livros.length === 0) {
    const mensagem = document.createElement('p');
    mensagem.classList.add('lmMensagemEstado');
    mensagem.textContent = 'Nenhum livro encontrado.';
    lmGradeLivros.appendChild(mensagem);
    return;
  }

  livros.forEach(function (livro) {
    lmGradeLivros.appendChild(lmCriarCardLivro(livro));
  });
}

function lmNormalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function lmFiltrarLivros() {
  const termoBusca = lmNormalizarTexto(lmCampoBuscaLivros.value);

  if (!termoBusca) {
    lmRenderizarLivros(lmLivrosCarregados);
    return;
  }

  const livrosFiltrados = lmLivrosCarregados.filter(function (livro) {
    const titulo = lmNormalizarTexto(livro.titulo);
    const editora = lmNormalizarTexto(livro.editora);
    const genero = lmNormalizarTexto(livro.genero);

    return (
      titulo.includes(termoBusca) ||
      editora.includes(termoBusca) ||
      genero.includes(termoBusca)
    );
  });

  lmRenderizarLivros(livrosFiltrados);
}

function lmCarregarAutoresDoLivro(livroId) {
  return fetch(`http://localhost:8080/livros/${livroId}/autores`)
    .then(res => {
      if (!res.ok) return [];
      return res.json();
    })
    .then(data => data.autores || [])
    .catch(() => []);
}

async function lmCarregarLivros() {
  try {
    const resposta = await fetch(lmApiLivrosUrl);

    if (!resposta.ok) {
      throw new Error('Erro ao carregar livros.');
    }

    const livros = await resposta.json();

    const livrosComAutores = await Promise.all(
      livros.map(async (livro) => {
        const autores = await lmCarregarAutoresDoLivro(livro.id);

        return {
          ...livro,
          autores
        };
      })
    );

    lmLivrosCarregados = livrosComAutores;
    lmRenderizarLivros(lmLivrosCarregados);

  } catch (erro) {
    lmGradeLivros.innerHTML = '';

    const mensagemErro = document.createElement('p');
    mensagemErro.classList.add('lmMensagemEstado');
    mensagemErro.textContent = 'Não foi possível carregar o acervo de livros.';

    lmGradeLivros.appendChild(mensagemErro);
    console.error(erro);
  }
}

lmModalFechar.addEventListener('click', function () {
  lmModalOverlay.classList.remove('lmModalOverlayAtivo');
});

lmModalOverlay.addEventListener('click', function (evento) {
  if (evento.target === lmModalOverlay) {
    lmModalOverlay.classList.remove('lmModalOverlayAtivo');
  }
});

const lmToggleDescricao = document.getElementById('lmToggleDescricao');
const lmDescricaoContainer = document.getElementById('lmDescricaoContainer');

lmToggleDescricao.addEventListener('click', function () {
  lmDescricaoContainer.classList.toggle('ativo');
  lmToggleDescricao.classList.toggle('rotacionado');
});

const lmBotaoTema = document.getElementById('lmBotaoTema');
const lmIconeTema = document.getElementById('lmIconeTema');
const lmTituloProjetoImagem = document.getElementById('lmTituloProjetoImagem');
const lmMenuLogoLeiaMulheres = document.getElementById('lmMenuLogoLeiaMulheres');

lmBotaoTema.addEventListener('click', function () {
  document.body.classList.toggle('lmTemaEscuro');

  if (document.body.classList.contains('lmTemaEscuro')) {
    lmTituloProjetoImagem.src = '/view/assets/logoLeiaEscuro.png';
    lmMenuLogoLeiaMulheres.src = '/view/assets/logoLeiaEscuro.png';
    lmIconeTema.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3
      7 7 0 0 0 21 12.79z"></path>
    `;
  } else {
    lmTituloProjetoImagem.src = '/view/assets/logoLeiaClaro.png';
    lmMenuLogoLeiaMulheres.src = '/view/assets/logoLeiaClaro.png';
    lmIconeTema.innerHTML = `
      <circle cx="12" cy="12" r="4"></circle>
      <line x1="12" y1="2" x2="12" y2="4"></line>
      <line x1="12" y1="20" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="4" y2="12"></line>
      <line x1="20" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line>
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line>
    `;
  }
});

function lmUsuarioEhAdmin() {
  return lmUsuario.tipo === 'administrador';
}

const lmBotaoSair = document.querySelector('.lmMenuSair');

if (lmBotaoSair) {
  lmBotaoSair.addEventListener('click', function (evento) {
    evento.preventDefault();

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    window.location.href = 'loginLeitor.html';
  });
}

lmCampoBuscaLivros.addEventListener('input', lmFiltrarLivros);
lmCarregarLivros();