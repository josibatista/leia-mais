const SUPABASE_URL = 'https://htregzpvwyhrrqdzqtrd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_F5w-U17IUYOQoZySjx0RQQ_UdYMH0MP';
const SUPABASE_BUCKET = 'capa-livros';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const lmAutoresSelecionados = [];

const lmApiLivrosUrl = `/livros/admin`;
const lmApiAutoresUrl = `/autores/disponiveis`;

const lmFormularioLivro = document.getElementById('lmCadastroFormularioLivro');
const lmCampoAutor = document.getElementById('idAutor');
const lmBotaoAdicionarAutor = document.getElementById('lmAdicionarAutor');
const lmListaAutoresDisponiveis = document.getElementById('lmListaAutoresDisponiveis');
const lmListaAutoresSelecionados = document.getElementById('lmListaAutoresSelecionados');
const lmCadastrarNovoAutor = document.getElementById('lmCadastrarNovoAutor');
const lmCadastroMensagem = document.getElementById('lmCadastroMensagem');
const lmCadastroBotaoCancelar = document.getElementById('lmCadastroBotaoCancelar');
const lmCadastroBotaoVoltar = document.getElementById('lmCadastroBotaoVoltar');
const lmAutoresDisponiveis = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!protegerRotaAdmin()) {
    return;
  }

  lmCarregarAutores();

  if (lmCadastroBotaoVoltar) {
    lmCadastroBotaoVoltar.addEventListener('click', voltarPaginaAnterior);
  }
});

function lmExibirMensagem(texto, tipo) {
  lmCadastroMensagem.textContent = texto;
  lmCadastroMensagem.className = 'lmCadastroMensagem';

  if (tipo) {
    lmCadastroMensagem.classList.add(`lmCadastroMensagem${tipo}`);
  }
}

function lmObterNomeAutor(autor) {
  return autor.nome || 'Autora sem nome';
}

if (lmCadastrarNovoAutor) {
  lmCadastrarNovoAutor.addEventListener('click', function () {
    window.location.href = 'cadastroAutor.html';
  });
}

if (lmBotaoAdicionarAutor) {
  lmBotaoAdicionarAutor.addEventListener('click', function () {
    const autorId = Number(lmCampoAutor.dataset.id);
    const autorNome = lmCampoAutor.value.trim();

    if (!autorId || !autorNome) {
      lmExibirMensagem('Selecione uma autora válida da lista.', 'Erro');
      return;
    }

    const autorJaExiste = lmAutoresSelecionados.some(function (autor) {
      return Number(autor.id) === autorId;
    });

    if (autorJaExiste) {
      lmExibirMensagem('Esta autora já foi adicionada.', 'Erro');
      return;
    }

    lmAutoresSelecionados.push({
      id: autorId,
      nome: autorNome
    });

    lmCampoAutor.value = '';
    lmCampoAutor.dataset.id = '';
    lmListaAutoresDisponiveis.classList.remove('ativo');

    lmExibirMensagem('', '');
    lmRenderizarAutoresSelecionados();
  });
}

function lmRenderizarAutoresSelecionados() {
  lmListaAutoresSelecionados.innerHTML = '';

  lmAutoresSelecionados.forEach(function (autor) {
    const tagAutor = document.createElement('div');
    tagAutor.className = 'lmCadastroAutorTag';

    tagAutor.innerHTML = `
      <span>${autor.nome}</span>
      <button
        type="button"
        class="lmCadastroAutorRemover"
        data-id="${autor.id}"
        aria-label="Remover autor"
      >
        ×
      </button>
    `;

    lmListaAutoresSelecionados.appendChild(tagAutor);
  });

  document.querySelectorAll('.lmCadastroAutorRemover').forEach(function (botao) {
    botao.addEventListener('click', function () {
      const autorId = Number(botao.dataset.id);

      const indiceAutor = lmAutoresSelecionados.findIndex(function (autor) {
        return Number(autor.id) === autorId;
      });

      if (indiceAutor !== -1) {
        lmAutoresSelecionados.splice(indiceAutor, 1);
      }

      lmRenderizarAutoresSelecionados();
    });
  });
}

async function lmCarregarAutores() {
  try {
    const resposta = await fetch(lmApiAutoresUrl);

    if (!resposta.ok) {
      throw new Error('Erro ao carregar autores.');
    }

    const dados = await resposta.json();
    const autores = dados.autores || [];

    lmAutoresDisponiveis.length = 0;
    lmListaAutoresDisponiveis.innerHTML = '';

    if (!Array.isArray(autores) || autores.length === 0) {
      lmCampoAutor.placeholder = 'Nenhuma autora cadastrada';
      lmCampoAutor.disabled = true;
      return;
    }

    autores.forEach(function (autor) {
      lmAutoresDisponiveis.push({
        id: autor.id,
        nome: lmObterNomeAutor(autor)
      });
    });

  } catch (erro) {
    lmCampoAutor.placeholder = 'Erro ao carregar autoras';
    lmCampoAutor.disabled = true;
    lmExibirMensagem('Não foi possível carregar a lista de autoras.', 'Erro');
    console.error(erro);
  }
}

function lmRenderizarSugestoesAutores(filtro = '') {
  lmListaAutoresDisponiveis.innerHTML = '';

  const filtroNormalizado = filtro.toLowerCase();

  const autoresFiltrados = lmAutoresDisponiveis.filter(function (autor) {
    return autor.nome.toLowerCase().includes(filtroNormalizado);
  });

  autoresFiltrados.forEach(function (autor) {
    const itemAutor = document.createElement('div');
    itemAutor.className = 'lmCadastroAutocompleteItem';
    itemAutor.textContent = autor.nome;
    itemAutor.dataset.id = autor.id;

    itemAutor.addEventListener('click', function () {
      lmCampoAutor.value = autor.nome;
      lmCampoAutor.dataset.id = autor.id;
      lmListaAutoresDisponiveis.classList.remove('ativo');
    });

    lmListaAutoresDisponiveis.appendChild(itemAutor);
  });

  if (autoresFiltrados.length > 0) {
    lmListaAutoresDisponiveis.classList.add('ativo');
  } else {
    lmListaAutoresDisponiveis.classList.remove('ativo');
  }
}

async function lmUploadImagemCapa(arquivoImagem) {
  if (!arquivoImagem) {
    return null;
  }

  const extensaoArquivo = arquivoImagem.name.split('.').pop();
  const nomeArquivo = `capa-${Date.now()}.${extensaoArquivo}`;
  const caminhoArquivo = `livros/${nomeArquivo}`;

  const { error } = await supabaseClient.storage
    .from(SUPABASE_BUCKET)
    .upload(caminhoArquivo, arquivoImagem);

  if (error) {
    console.error('Erro Supabase Storage:', error);
    throw new Error(error.message || 'Erro ao enviar imagem da capa.');
  }

  const { data } = supabaseClient.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(caminhoArquivo);

  return data.publicUrl;
}

lmCampoAutor.addEventListener('input', function () {
  lmCampoAutor.dataset.id = '';
  lmRenderizarSugestoesAutores(lmCampoAutor.value);
});

lmCampoAutor.addEventListener('focus', function () {
  lmRenderizarSugestoesAutores(lmCampoAutor.value);
});

document.addEventListener('click', function (evento) {
  if (!evento.target.closest('.lmCadastroAutocomplete')) {
    lmListaAutoresDisponiveis.classList.remove('ativo');
  }
});

lmFormularioLivro.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  lmExibirMensagem('Enviando cadastro...', 'Info');

  const titulo = document.getElementById('titulo').value.trim();
  const editora = document.getElementById('editora').value.trim();
  const paginas = document.getElementById('paginas').value.trim();
  const anoPublicacao = document.getElementById('anoPublicacao').value;
  const genero = document.getElementById('genero').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const imagemCapaArquivo = document.getElementById('imagemCapa').files[0];

  if (!titulo || !editora || !paginas || !anoPublicacao || !genero) {
    lmExibirMensagem('Preencha todos os campos obrigatórios.', 'Erro');
    return;
  }

  if (lmAutoresSelecionados.length === 0) {
    lmExibirMensagem('Adicione pelo menos um autor ao livro.', 'Erro');
    return;
  }

  try {
    const imagemCapaUrl = await lmUploadImagemCapa(imagemCapaArquivo);

    const respostaLivro = await fetch(lmApiLivrosUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${obterToken()}`
      },
      body: JSON.stringify({
        titulo,
        editora,
        paginas,
        anoPublicacao,
        genero,
        descricao,
        imagemCapa: imagemCapaUrl
      })
    });

    const dadosLivro = await respostaLivro.json();

    if (!respostaLivro.ok) {
      throw new Error(dadosLivro.error || 'Erro ao cadastrar livro.');
    }

    const livroId = dadosLivro.livro.id;

    const respostaVinculo = await fetch(`/livros/${livroId}/autores/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${obterToken()}`
      },
      body: JSON.stringify({
        autoresIds: lmAutoresSelecionados.map(function (autor) {
          return Number(autor.id);
        })
      })
    });

    const dadosVinculo = await respostaVinculo.json();

    if (!respostaVinculo.ok) {
      throw new Error(dadosVinculo.error || 'Livro cadastrado, mas não foi possível vincular os autores.');
    }

    lmFormularioLivro.reset();
    lmAutoresSelecionados.length = 0;
    lmRenderizarAutoresSelecionados();

    lmExibirMensagem('Livro cadastrado com sucesso.', 'Sucesso');
  } catch (erro) {
    lmExibirMensagem(erro.message || 'Não foi possível cadastrar o livro.', 'Erro');
    console.error(erro);
  }
});

if (lmCadastroBotaoCancelar) {
  lmCadastroBotaoCancelar.addEventListener('click', function () {
    lmFormularioLivro.reset();

    lmAutoresSelecionados.length = 0;
    lmListaAutoresSelecionados.innerHTML = '';
    lmCampoAutor.value = '';

    lmExibirMensagem('', '');
  });
}
