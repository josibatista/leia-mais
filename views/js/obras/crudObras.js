const lmApiObrasUrl = "/obras";
const lmApiAutoresUrl = "/autores/disponiveis";

// Reflete o enum do model Obra (models/obra.js)
const LM_TIPOS_OBRA = [
  "Antologia",
  "Artigo",
  "Autobiografia",
  "Biografia",
  "Carta",
  "Coletânea",
  "Conto",
  "Crônica",
  "Diário",
  "Ensaio",
  "Literatura infantil",
  "Literatura juvenil",
  "Livro",
  "Memórias",
  "Novela",
  "Peça teatral",
  "Poema",
  "Poesia",
  "Quadrinho / HQ",
  "Resenha",
  "Outro",
];

const lmAutoresSelecionados = [];
const lmAutoresDisponiveis = [];

document.addEventListener("DOMContentLoaded", () => {
  if (!protegerRotaAdmin()) {
    return;
  }

  const token = obterToken();

  const lmFormularioObra = document.getElementById("lmCadastroFormularioObras");
  const lmCampoAutor = document.getElementById("idAutor");
  const lmCampoTipo = document.getElementById("idTipo");
  const lmBotaoAdicionarAutor = document.getElementById("lmAdicionarAutor");
  const lmListaAutoresDisponiveis = document.getElementById("lmListaAutoresDisponiveis");
  const lmListaTiposDisponiveis = document.getElementById("lmListaTiposDisponiveis");
  const lmListaAutoresSelecionados = document.getElementById("lmListaAutoresSelecionados");
  const lmCadastrarNovoAutor = document.getElementById("lmCadastrarNovoAutor");
  const lmCadastroMensagem = document.getElementById("lmCadastroMensagem");
  const lmCadastroBotaoVoltar = document.getElementById("lmCadastroBotaoVoltar");

  function lmExibirMensagem(texto, tipo) {
    lmCadastroMensagem.textContent = texto;
    lmCadastroMensagem.className = "lmCadastroMensagem";

    if (tipo) {
      lmCadastroMensagem.classList.add(`lmCadastroMensagem${tipo}`);
    }
  }

  function lmObterNomeAutor(autor) {
    return autor.nome || "Autor sem nome";
  }

  if (lmCadastrarNovoAutor) {
    lmCadastrarNovoAutor.addEventListener("click", function () {
      window.location.href = "cadastroAutor.html";
    });
  }

  async function lmCarregarAutores() {
    try {
      const resposta = await fetch(lmApiAutoresUrl);

      if (!resposta.ok) {
        throw new Error("Erro ao carregar autores.");
      }

      const dados = await resposta.json();
      const autores = dados.autores || [];

      lmAutoresDisponiveis.length = 0;

      if (!Array.isArray(autores) || autores.length === 0) {
        lmCampoAutor.placeholder = "Nenhuma autora cadastrada";
        lmCampoAutor.disabled = true;
        return;
      }

      autores.forEach(function (autor) {
        lmAutoresDisponiveis.push({
          id: autor.id,
          nome: lmObterNomeAutor(autor),
        });
      });
    } catch (erro) {
      lmCampoAutor.placeholder = "Erro ao carregar autoras";
      lmCampoAutor.disabled = true;
      lmExibirMensagem("Não foi possível carregar a lista de autoras.", "Erro");
      console.error(erro);
    }
  }

  function lmRenderizarSugestoesAutores(filtro = "") {
    lmListaAutoresDisponiveis.innerHTML = "";

    const filtroNormalizado = filtro.toLowerCase();
    const autoresFiltrados = lmAutoresDisponiveis.filter(function (autor) {
      return autor.nome.toLowerCase().includes(filtroNormalizado);
    });

    autoresFiltrados.forEach(function (autor) {
      const itemAutor = document.createElement("div");
      itemAutor.className = "lmCadastroAutocompleteItem";
      itemAutor.textContent = autor.nome;
      itemAutor.dataset.id = autor.id;

      itemAutor.addEventListener("click", function () {
        lmCampoAutor.value = autor.nome;
        lmCampoAutor.dataset.id = autor.id;
        lmListaAutoresDisponiveis.classList.remove("ativo");
      });

      lmListaAutoresDisponiveis.appendChild(itemAutor);
    });

    if (autoresFiltrados.length > 0) {
      lmListaAutoresDisponiveis.classList.add("ativo");
    } else {
      lmListaAutoresDisponiveis.classList.remove("ativo");
    }
  }

  function lmRenderizarSugestoesTipos(filtro = "") {
    lmListaTiposDisponiveis.innerHTML = "";

    const filtroNormalizado = filtro.toLowerCase();
    const tiposFiltrados = LM_TIPOS_OBRA.filter(function (tipo) {
      return tipo.toLowerCase().includes(filtroNormalizado);
    });

    tiposFiltrados.forEach(function (tipo) {
      const itemTipo = document.createElement("div");
      itemTipo.className = "lmCadastroAutocompleteItem";
      itemTipo.textContent = tipo;

      itemTipo.addEventListener("click", function () {
        lmCampoTipo.value = tipo;
        lmListaTiposDisponiveis.classList.remove("ativo");
      });

      lmListaTiposDisponiveis.appendChild(itemTipo);
    });

    if (tiposFiltrados.length > 0) {
      lmListaTiposDisponiveis.classList.add("ativo");
    } else {
      lmListaTiposDisponiveis.classList.remove("ativo");
    }
  }

  if (lmBotaoAdicionarAutor) {
    lmBotaoAdicionarAutor.addEventListener("click", function () {
      const autorId = lmCampoAutor.dataset.id;
      const autorNome = lmCampoAutor.value.trim();

      if (!autorId || !autorNome) {
        lmExibirMensagem("Selecione uma autora válida da lista.", "Erro");
        return;
      }

      const autorJaExiste = lmAutoresSelecionados.some(function (autor) {
        return Number(autor.id) === Number(autorId);
      });

      if (autorJaExiste) {
        lmExibirMensagem("Esta autora já foi adicionada.", "Erro");
        return;
      }

      lmAutoresSelecionados.push({
        id: Number(autorId),
        nome: autorNome,
      });

      lmCampoAutor.value = "";
      lmCampoAutor.dataset.id = "";
      lmListaAutoresDisponiveis.classList.remove("ativo");
      lmExibirMensagem("", "");
      lmRenderizarAutoresSelecionados();
    });
  }

  function lmRenderizarAutoresSelecionados() {
    lmListaAutoresSelecionados.innerHTML = "";

    lmAutoresSelecionados.forEach(function (autor) {
      const tagAutor = document.createElement("div");
      tagAutor.className = "lmCadastroAutorTag";

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

    document.querySelectorAll(".lmCadastroAutorRemover").forEach(function (botao) {
      botao.addEventListener("click", function () {
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

  lmCampoAutor.addEventListener("input", function () {
    lmCampoAutor.dataset.id = "";
    lmRenderizarSugestoesAutores(lmCampoAutor.value);
  });

  lmCampoAutor.addEventListener("focus", function () {
    lmRenderizarSugestoesAutores(lmCampoAutor.value);
  });

  lmCampoTipo.addEventListener("input", function () {
    lmRenderizarSugestoesTipos(lmCampoTipo.value);
  });

  lmCampoTipo.addEventListener("focus", function () {
    lmRenderizarSugestoesTipos(lmCampoTipo.value);
  });

  document.addEventListener("click", function (evento) {
    if (!evento.target.closest(".lmCadastroAutocomplete")) {
      lmListaAutoresDisponiveis.classList.remove("ativo");
      lmListaTiposDisponiveis.classList.remove("ativo");
    }
  });

  lmFormularioObra.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    lmExibirMensagem("Enviando cadastro...", "Info");

    const titulo = document.getElementById("titulo").value.trim();
    const tipo = lmCampoTipo.value.trim();
    const descricao = document.getElementById("descricao").value.trim();

    if (!titulo || !tipo) {
      lmExibirMensagem("Preencha todos os campos obrigatórios.", "Erro");
      return;
    }

    if (!LM_TIPOS_OBRA.includes(tipo)) {
      lmExibirMensagem("Selecione um tipo de obra válido da lista.", "Erro");
      return;
    }

    if (lmAutoresSelecionados.length === 0) {
      lmExibirMensagem("Adicione pelo menos uma autora à obra.", "Erro");
      return;
    }

    try {
      const respostaObra = await fetch(lmApiObrasUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          tipo,
          autores: lmAutoresSelecionados.map(function (autor) {
            return { nome: autor.nome };
          }),
          descricao,
        }),
      });

      const dadosObra = await respostaObra.json();

      if (!respostaObra.ok) {
        throw new Error(dadosObra.error || "Erro ao cadastrar obra.");
      }

      lmFormularioObra.reset();
      lmAutoresSelecionados.length = 0;
      lmRenderizarAutoresSelecionados();
      lmExibirMensagem("Obra cadastrada com sucesso.", "Sucesso");
    } catch (erro) {
      lmExibirMensagem(erro.message || "Não foi possível cadastrar a obra.", "Erro");
      console.error(erro);
    }
  });

  if (lmCadastroBotaoVoltar) {
    lmCadastroBotaoVoltar.addEventListener("click", voltarPaginaAnterior);
  }

  lmCarregarAutores();
});
