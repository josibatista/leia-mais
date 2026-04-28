const lmApiLivrosUrl = '/api/livros/admin';
const lmApiAutoresUrl = '/api/autores';

const lmFormularioLivro = document.getElementById('lmCadastroFormularioLivro');
const lmCampoAutor = document.getElementById('idAutor');
const lmCadastroMensagem = document.getElementById('lmCadastroMensagem');
const lmCadastroBotaoVoltar = document.getElementById('lmCadastroBotaoVoltar');

function lmExibirMensagem(texto, tipo) {
  lmCadastroMensagem.textContent = texto;
  lmCadastroMensagem.className = 'lmCadastroMensagem';

  if (tipo) {
    lmCadastroMensagem.classList.add(`lmCadastroMensagem${tipo}`);
  }
}

function lmObterNomeAutor(autor) {
  return autor.nomeAutor || autor.nome || 'Autor sem nome';
}

async function lmCarregarAutores() {
  try {
    const resposta = await fetch(lmApiAutoresUrl);

    if (!resposta.ok) {
      throw new Error('Erro ao carregar autores.');
    }

    const autores = await resposta.json();

    lmCampoAutor.innerHTML = '<option value="">Selecione um autor</option>';
    lmCampoAutor.disabled = false;

    if (!Array.isArray(autores) || autores.length === 0) {
      lmCampoAutor.innerHTML = '<option value="">Nenhum autor cadastrado</option>';
      lmCampoAutor.disabled = true;
      return;
    }

    autores.forEach(function (autor) {
      const optionAutor = document.createElement('option');

      optionAutor.value = autor.idAutor || autor.id;
      optionAutor.textContent = lmObterNomeAutor(autor);

      lmCampoAutor.appendChild(optionAutor);
    });
  } catch (erro) {
    lmCampoAutor.innerHTML = '<option value="">Erro ao carregar autores</option>';
    lmCampoAutor.disabled = true;

    lmExibirMensagem('Não foi possível carregar a lista de autores.', 'Erro');
    console.error(erro);
  }
}

lmFormularioLivro.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  lmExibirMensagem('Enviando cadastro...', 'Info');

  const dadosLivro = new FormData(lmFormularioLivro);

  dadosLivro.append('autorId', dadosLivro.get('idAutor'));

  try {
    const resposta = await fetch(lmApiLivrosUrl, {
      method: 'POST',
      body: dadosLivro
    });

    if (!resposta.ok) {
      throw new Error('Erro ao cadastrar livro.');
    }

    lmFormularioLivro.reset();
    lmExibirMensagem('Livro cadastrado com sucesso.', 'Sucesso');
  } catch (erro) {
    lmExibirMensagem('Não foi possível cadastrar o livro.', 'Erro');
    console.error(erro);
  }
});

lmCadastroBotaoVoltar.addEventListener('click', function () {
  window.history.back();
});

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

const lmBotaoTema = document.getElementById('lmBotaoTema');
const lmIconeTema = document.getElementById('lmIconeTema');
const lmCadastroTituloProjetoImagem = document.getElementById('lmCadastroTituloProjetoImagem');

lmBotaoTema.addEventListener('click', function () {
  document.body.classList.toggle('lmTemaEscuro');

  if (document.body.classList.contains('lmTemaEscuro')) {
    lmCadastroTituloProjetoImagem.src = '/view/assets/logoLeiaEscuro.png';
    lmIconeTema.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3
      7 7 0 0 0 21 12.79z"></path>
    `;
  } else {
    lmCadastroTituloProjetoImagem.src = '/view/assets/logoLeiaClaro.png';
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

lmCarregarAutores();