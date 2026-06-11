const lmApiTrilhasUrl = "/trilhas";
const lmApiObrasUrl = "/obras";
const lmApiLivrosUrl = "/livros";

const lmFormularioTrilha = document.getElementById("lmCadastroFormularioTrilha");
const lmCampoObra = document.getElementById("idObra");
const lmCampoLivro = document.getElementById("idLivro");
const lmListaObrasDisponiveis = document.getElementById("lmListaObrasDisponiveis");
const lmListaLivrosDisponiveis = document.getElementById("lmListaLivrosDisponiveis");
const lmListaItensTrilha = document.getElementById("lmListaItensTrilha");
const lmCadastroMensagem = document.getElementById("lmCadastroMensagem");

const lmObrasDisponiveis = [];
const lmLivrosDisponiveis = [];

let lmGerenciadorItens = null;

document.addEventListener("DOMContentLoaded", () => {
  if (!protegerRotaAdmin()) {
    return;
  }

  tfPreencherSelectNivel(document.getElementById("nivelDificuldade"));

  lmGerenciadorItens = tfCriarGerenciadorItens({
    listaElemento: lmListaItensTrilha,
    exibirMensagem: lmExibirMensagem,
  });

  lmCarregarObras();
  lmCarregarLivros();
  lmConfigurarAutocompletes();
  lmConfigurarBotoes();

  if (document.getElementById("lmCadastroBotaoVoltar")) {
    document.getElementById("lmCadastroBotaoVoltar").addEventListener("click", voltarPaginaAnterior);
  }
});

function lmExibirMensagem(texto, tipo) {
  lmCadastroMensagem.textContent = texto;
  lmCadastroMensagem.className = "lmCadastroMensagem";

  if (tipo) {
    lmCadastroMensagem.classList.add(`lmCadastroMensagem${tipo}`);
  }
}

function lmConfigurarBotoes() {
  document.getElementById("lmCadastrarNovaObra")?.addEventListener("click", () => {
    window.location.href = "/pages/obras/cadastro.html";
  });

  document.getElementById("lmCadastrarNovoLivro")?.addEventListener("click", () => {
    window.location.href = "/pages/livros/cadastro.html";
  });

  document.getElementById("lmAdicionarObra")?.addEventListener("click", () => {
    const adicionou = lmGerenciadorItens.adicionarItem(
      "obra",
      lmCampoObra.dataset.id,
      lmCampoObra.value.trim(),
    );

    if (adicionou) {
      lmCampoObra.value = "";
      lmCampoObra.dataset.id = "";
      lmListaObrasDisponiveis.classList.remove("ativo");
      lmExibirMensagem("", "");
    }
  });

  document.getElementById("lmAdicionarLivro")?.addEventListener("click", () => {
    const adicionou = lmGerenciadorItens.adicionarItem(
      "livro",
      lmCampoLivro.dataset.id,
      lmCampoLivro.value.trim(),
    );

    if (adicionou) {
      lmCampoLivro.value = "";
      lmCampoLivro.dataset.id = "";
      lmListaLivrosDisponiveis.classList.remove("ativo");
      lmExibirMensagem("", "");
    }
  });

  document.getElementById("lmCadastroBotaoCancelar")?.addEventListener("click", () => {
    lmGerenciadorItens.limparItens();
    lmCampoObra.value = "";
    lmCampoLivro.value = "";
    lmExibirMensagem("", "");
  });
}

function lmConfigurarAutocompletes() {
  tfConfigurarAutocomplete({
    campo: lmCampoObra,
    lista: lmListaObrasDisponiveis,
    itensDisponiveis: lmObrasDisponiveis,
    obterRotulo: (item) => item.titulo,
    obterId: (item) => item.id,
  });

  tfConfigurarAutocomplete({
    campo: lmCampoLivro,
    lista: lmListaLivrosDisponiveis,
    itensDisponiveis: lmLivrosDisponiveis,
    obterRotulo: (item) => item.titulo,
    obterId: (item) => item.id,
  });

  document.addEventListener("click", (evento) => {
    if (!evento.target.closest(".lmCadastroAutocomplete")) {
      lmListaObrasDisponiveis.classList.remove("ativo");
      lmListaLivrosDisponiveis.classList.remove("ativo");
    }
  });
}

async function lmCarregarObras() {
  try {
    const resposta = await fetch(lmApiObrasUrl);

    if (!resposta.ok) {
      throw new Error("Erro ao carregar obras.");
    }

    const dados = await resposta.json();
    const obras = dados.obras || [];

    lmObrasDisponiveis.length = 0;

    if (!obras.length) {
      lmCampoObra.placeholder = "Nenhuma obra cadastrada";
      lmCampoObra.disabled = true;
      return;
    }

    obras.forEach((obra) => {
      lmObrasDisponiveis.push({
        id: String(obra._id || obra.id),
        titulo: obra.titulo || "Obra sem título",
      });
    });
  } catch (erro) {
    lmCampoObra.placeholder = "Erro ao carregar obras";
    lmCampoObra.disabled = true;
    lmExibirMensagem("Não foi possível carregar a lista de obras.", "Erro");
    console.error(erro);
  }
}

async function lmCarregarLivros() {
  try {
    const resposta = await fetch(lmApiLivrosUrl);

    if (!resposta.ok) {
      throw new Error("Erro ao carregar livros.");
    }

    const livros = await resposta.json();
    const listaLivros = Array.isArray(livros) ? livros : livros.livros || [];

    lmLivrosDisponiveis.length = 0;

    if (!listaLivros.length) {
      lmCampoLivro.placeholder = "Nenhum livro cadastrado";
      lmCampoLivro.disabled = true;
      return;
    }

    listaLivros.forEach((livro) => {
      lmLivrosDisponiveis.push({
        id: String(livro.id),
        titulo: livro.titulo || "Livro sem título",
      });
    });
  } catch (erro) {
    lmCampoLivro.placeholder = "Erro ao carregar livros";
    lmCampoLivro.disabled = true;
    lmExibirMensagem("Não foi possível carregar a lista de livros.", "Erro");
    console.error(erro);
  }
}

lmFormularioTrilha.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  lmExibirMensagem("Enviando cadastro...", "Info");

  const tema = document.getElementById("tema").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const nivelDificuldade = Number(document.getElementById("nivelDificuldade").value);
  const xp = Number(document.getElementById("xp").value);
  const liberada = document.getElementById("liberada").checked;

  if (!tema || !nivelDificuldade || Number.isNaN(xp)) {
    lmExibirMensagem("Preencha todos os campos obrigatórios.", "Erro");
    return;
  }

  if (!lmGerenciadorItens.itens.length) {
    lmExibirMensagem("Adicione pelo menos uma obra ou livro à trilha.", "Erro");
    return;
  }

  const { obras, livros } = lmGerenciadorItens.montarPayload();

  try {
    const respostaTrilha = await fetch(lmApiTrilhasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obterToken()}`,
      },
      body: JSON.stringify({
        tema,
        descricao,
        nivelDificuldade,
        xp,
        liberada,
        obras,
        livros,
      }),
    });

    const dadosTrilha = await respostaTrilha.json();

    if (!respostaTrilha.ok) {
      throw new Error(dadosTrilha.error || "Erro ao cadastrar trilha.");
    }

    lmFormularioTrilha.reset();
    tfPreencherSelectNivel(document.getElementById("nivelDificuldade"));
    lmGerenciadorItens.limparItens();
    lmExibirMensagem("Trilha cadastrada com sucesso.", "Sucesso");
  } catch (erro) {
    lmExibirMensagem(erro.message || "Não foi possível cadastrar a trilha.", "Erro");
    console.error(erro);
  }
});
