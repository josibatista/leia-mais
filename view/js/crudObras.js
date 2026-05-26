const token = localStorage.getItem("token");
const usuario = JSON.parse(localStorage.getItem("usuario"));

const lmApiObrasUrl = "/obras";
const lmApiAutoresUrl = "/autores/disponiveis";

const lmAutoresSelecionados = [];

const lmFormularioObra = document.getElementById("lmCadastroFormularioObras");
const lmCampoAutor = document.getElementById("idAutor");
const lmBotaoAdicionarAutor = document.getElementById("lmAdicionarAutor");
const lmListaAutoresSelecionados = document.getElementById(
  "lmListaAutoresSelecionados",
);
const lmCadastrarNovoAutor = document.getElementById("lmCadastrarNovoAutor");
const lmCadastroMensagem = document.getElementById("lmCadastroMensagem");
const lmCadastroBotaoVoltar = document.getElementById("lmCadastroBotaoVoltar");

if (!token || !usuario || usuario.tipo !== "administrador") {
  alert("Acesso permitido apenas para administradores.");
  window.location.href = "loginAdm.html";
} else {
  lmCarregarAutores();
}

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

    lmCampoAutor.innerHTML = '<option value="">Selecione uma autora</option>';
    lmCampoAutor.disabled = false;

    if (!Array.isArray(autores) || autores.length === 0) {
      lmCampoAutor.innerHTML =
        '<option value="">Nenhuma autora cadastrada</option>';
      lmCampoAutor.disabled = true;
      return;
    }

    autores.forEach(function (autor) {
      const optionAutor = document.createElement("option");

      optionAutor.value = autor.id;
      optionAutor.textContent = lmObterNomeAutor(autor);

      lmCampoAutor.appendChild(optionAutor);
    });
  } catch (erro) {
    lmCampoAutor.innerHTML =
      '<option value="">Erro ao carregar autoras</option>';
    lmCampoAutor.disabled = true;

    lmExibirMensagem("Não foi possível carregar a lista de autoras.", "Erro");
    console.error(erro);
  }
}

if (lmBotaoAdicionarAutor) {
  lmBotaoAdicionarAutor.addEventListener("click", function () {
    const autorId = lmCampoAutor.value;
    const autorNome = lmCampoAutor.options[lmCampoAutor.selectedIndex].text;

    if (!autorId) {
      lmExibirMensagem("Selecione uma autora para adicionar.", "Erro");
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

  document
    .querySelectorAll(".lmCadastroAutorRemover")
    .forEach(function (botao) {
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

lmFormularioObra.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  lmExibirMensagem("Enviando cadastro...", "Info");

  const titulo = document.getElementById("titulo").value.trim();
  const tipo = document.getElementById("idTipo").value;
  const descricao = document.getElementById("descricao").value.trim();

  if (!titulo || !tipo) {
    lmExibirMensagem("Preencha todos os campos obrigatórios.", "Erro");
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
          return {
            nome: autor.nome,
          };
        }),
        descricao
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
    lmExibirMensagem(
      erro.message || "Não foi possível cadastrar a obra.",
      "Erro",
    );
    console.error(erro);
  }
});

if (lmCadastroBotaoVoltar) {
  lmCadastroBotaoVoltar.addEventListener("click", function () {
    window.history.back();
  });
}
