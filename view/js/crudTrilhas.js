const SUPABASE_URL = 'https://htregzpvwyhrrqdzqtrd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_F5w-U17IUYOQoZySjx0RQQ_UdYMH0MP';
const SUPABASE_BUCKET = 'capa-trilhas';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const lmObrasSelecionadas = [];

const lmApiTrilhasUrl = `/trilhas/admin`;
const lmApiObrasUrl = `/obras/disponiveis`;

const lmFormularioTrilha = document.getElementById('lmCadastroFormularioTrilha');
const lmCampoObra = document.getElementById('idObra');
const lmBotaoAdicionarObra = document.getElementById('lmAdicionarObra');
const lmListaObrasDisponiveis = document.getElementById('lmListaObrasDisponiveis');
const lmListaObrasSelecionadas = document.getElementById('lmListaObrasSelecionadas');
const lmCadastrarNovaObra = document.getElementById('lmCadastrarNovaObra');
const lmCadastroMensagem = document.getElementById('lmCadastroMensagem');
const lmCadastroBotaoCancelar = document.getElementById('lmCadastroBotaoCancelar');
const lmCadastroBotaoVoltar = document.getElementById('lmCadastroBotaoVoltar');
const lmObrasDisponiveis = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!protegerRotaAdmin()) {
    return;
  }

  lmCarregarObras();

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

function lmObterTituloObra(obra) {
  return obra.titulo || 'Obra sem título';
}

if (lmCadastrarNovaObra) {
  lmCadastrarNovaObra.addEventListener('click', function () {
    window.location.href = 'cadastroObras.html';
  });
}

if (lmBotaoAdicionarObra) {
  lmBotaoAdicionarObra.addEventListener('click', function () {
    const obraId = Number(lmCampoObra.dataset.id);
    const obraTitulo = lmCampoObra.value.trim();

    if (!obraId || !obraTitulo) {
      lmExibirMensagem('Selecione uma obra válida da lista.', 'Erro');
      return;
    }

    const obraJaExiste = lmObrasSelecionadas.some(function (obra) {
      return Number(obra.id) === obraId;
    });

    if (obraJaExiste) {
      lmExibirMensagem('Esta obra já foi adicionada.', 'Erro');
      return;
    }

    lmObrasSelecionadas.push({
      id: obraId,
      titulo: obraTitulo
    });

    lmCampoObra.value = '';
    lmCampoObra.dataset.id = '';
    lmListaObrasDisponiveis.classList.remove('ativo');

    lmExibirMensagem('', '');
    lmRenderizarObrasSelecionadas();
  });
}

function lmRenderizarObrasSelecionadas() {
  lmListaObrasSelecionadas.innerHTML = '';

  lmObrasSelecionadas.forEach(function (obra) {
    const tagObra = document.createElement('div');
    tagObra.className = 'lmCadastroObraTag';

    tagObra.innerHTML = `
      <span>${obra.titulo}</span>
      <button
        type="button"
        class="lmCadastroObraRemover"
        data-id="${obra.id}"
        aria-label="Remover obra"
      >
        ×
      </button>
    `;

    lmListaObrasSelecionadas.appendChild(tagObra);
  });

  document.querySelectorAll('.lmCadastroObraRemover').forEach(function (botao) {
    botao.addEventListener('click', function () {
      const obraId = Number(botao.dataset.id);

      const indiceObra = lmObrasSelecionadas.findIndex(function (obra) {
        return Number(obra.id) === obraId;
      });

      if (indiceObra !== -1) {
        lmObrasSelecionadas.splice(indiceObra, 1);
      }

      lmRenderizarObrasSelecionadas();
    });
  });
}

async function lmCarregarObras() {
  try {
    const resposta = await fetch(lmApiObrasUrl);

    if (!resposta.ok) {
      throw new Error('Erro ao carregar obras.');
    }

    const dados = await resposta.json();
    const obras = dados.obras || [];

    lmObrasDisponiveis.length = 0;
    lmListaObrasDisponiveis.innerHTML = '';

    if (!Array.isArray(obras) || obras.length === 0) {
      lmCampoObra.placeholder = 'Nenhuma obra cadastrada';
      lmCampoObra.disabled = true;
      return;
    }

    obras.forEach(function (obra) {
      lmObrasDisponiveis.push({
        id: obra.id,
        titulo: lmObterTituloObra(obra)
      });
    });

  } catch (erro) {
    lmCampoObra.placeholder = 'Erro ao carregar obras';
    lmCampoObra.disabled = true;
    lmExibirMensagem('Não foi possível carregar a lista de obras.', 'Erro');
    console.error(erro);
  }
}

function lmRenderizarSugestoesObras(filtro = '') {
  lmListaObrasDisponiveis.innerHTML = '';

  const filtroNormalizado = filtro.toLowerCase();

  const obrasFiltradas = lmObrasDisponiveis.filter(function (obra) {
    return obra.titulo.toLowerCase().includes(filtroNormalizado);
  });

  obrasFiltradas.forEach(function (obra) {
    const itemObra = document.createElement('div');
    itemObra.className = 'lmCadastroAutocompleteItem';
    itemObra.textContent = obra.titulo;
    itemObra.dataset.id = obra.id;

    itemObra.addEventListener('click', function () {
      lmCampoObra.value = obra.titulo;
      lmCampoObra.dataset.id = obra.id;
      lmListaObrasDisponiveis.classList.remove('ativo');
    });

    lmListaObrasDisponiveis.appendChild(itemObra);
  });

  if (obrasFiltradas.length > 0) {
    lmListaObrasDisponiveis.classList.add('ativo');
  } else {
    lmListaObrasDisponiveis.classList.remove('ativo');
  }
}

async function lmUploadImagemCapa(arquivoImagem) {
  if (!arquivoImagem) {
    return null;
  }

  const extensaoArquivo = arquivoImagem.name.split('.').pop();
  const nomeArquivo = `capa-${Date.now()}.${extensaoArquivo}`;
  const caminhoArquivo = `trilhas/${nomeArquivo}`;

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

lmCampoObra.addEventListener('input', function () {
  lmCampoObra.dataset.id = '';
  lmRenderizarSugestoesObras(lmCampoObra.value);
});

lmCampoObra.addEventListener('focus', function () {
  lmRenderizarSugestoesObras(lmCampoObra.value);
});

document.addEventListener('click', function (evento) {
  if (!evento.target.closest('.lmCadastroAutocomplete')) {
    lmListaObrasDisponiveis.classList.remove('ativo');
  }
});

lmFormularioTrilha.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  lmExibirMensagem('Enviando cadastro...', 'Info');

  const tema = document.getElementById('tema').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const nivelDificuldade = document.getElementById('nivelDificuldade').value.trim();
  const xp = document.getElementById('xp').value;
  const liberada = document.getElementById('liberada').value.trim();
  const imagemCapaArquivo = document.getElementById('imagemCapa').files[0];

  if (!tema || !descricao || !nivelDificuldade || !xp || !liberada) {
    lmExibirMensagem('Preencha todos os campos obrigatórios.', 'Erro');
    return;
  }

  if (lmObrasSelecionadas.length === 0) {
    lmExibirMensagem('Adicione pelo menos uma obra a trilha.', 'Erro');
    return;
  }

  try {
    const imagemCapaUrl = await lmUploadImagemCapa(imagemCapaArquivo);

    const respostaTrilha = await fetch(lmApiObrasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${obterToken()}`
      },
      body: JSON.stringify({
        tema,
        descricao,
        nivelDificuldade,
        xp,
        liberada,
        imagemCapa: imagemCapaUrl
      })
    });

    const dadosTrilha = await respostaTrilha.json();

    if (!respostaTrilha.ok) {
      throw new Error(dadosTrilha.error || 'Erro ao cadastrar trilha.');
    }

    const trilhaId = dadosTrilha.trilha.id;

    const respostaVinculo = await fetch(`/trilhas/${trilhaId}/obras/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${obterToken()}`
      },
      body: JSON.stringify({
        obrasIds: lmObrasSelecionadas.map(function (obra) {
          return Number(obra.id);
        })
      })
    });

    const dadosVinculo = await respostaVinculo.json();

    if (!respostaVinculo.ok) {
      throw new Error(dadosVinculo.error || 'Trilha cadastrada, mas não foi possível vincular as obras.');
    }

    lmFormularioTrilha.reset();
    lmObrasSelecionadas.length = 0;
    lmRenderizarObrasSelecionadas();

    lmExibirMensagem('Trilha cadastrada com sucesso.', 'Sucesso');
  } catch (erro) {
    lmExibirMensagem(erro.message || 'Não foi possível cadastrar a trilha.', 'Erro');
    console.error(erro);
  }
});

if (lmCadastroBotaoCancelar) {
  lmCadastroBotaoCancelar.addEventListener('click', function () {
    lmFormularioTrilha.reset();

    lmObrasSelecionadas.length = 0;
    lmListaObrasSelecionadas.innerHTML = '';
    lmCampoObra.value = '';

    lmExibirMensagem('', '');
  });
}