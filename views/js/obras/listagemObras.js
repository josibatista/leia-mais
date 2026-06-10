const blApiObrasUrl = "/obras";
const blApiAutoresUrl = "/autores/disponiveis";

let blObrasCarregadas = [];
let blAutoresDisponiveis = [];
let blObraEmEdicao = null;

document.addEventListener("DOMContentLoaded", async () => {
  if (!protegerRotaAdmin()) {
    return;
  }

  configurarBotaoAdicionarObra();
  configurarModalEditarObra();
  configurarModalMensagemObras();

  await carregarAutoresDisponiveis();
  carregarObras();
});

function abrirModalMensagemObras({
  titulo = "Atenção",
  mensagem,
  mostrarCancelar = false,
  aoConfirmar = null,
}) {
  const modal = document.getElementById("blModalMensagemObras");
  const tituloModal = document.getElementById("blModalMensagemObrasTitulo");
  const textoModal = document.getElementById("blModalMensagemObrasTexto");
  const botaoConfirmar = document.getElementById("blBotaoConfirmarMensagemObras");
  const botaoCancelar = document.getElementById("blBotaoCancelarMensagemObras");

  tituloModal.textContent = titulo;
  textoModal.textContent = mensagem;
  botaoCancelar.style.display = mostrarCancelar ? "inline-flex" : "none";

  const novoBotaoConfirmar = botaoConfirmar.cloneNode(true);
  botaoConfirmar.parentNode.replaceChild(novoBotaoConfirmar, botaoConfirmar);

  novoBotaoConfirmar.addEventListener("click", async () => {
    modal.classList.remove("lmModalOverlayAtivo");

    if (typeof aoConfirmar === "function") {
      await aoConfirmar();
    }
  });

  modal.classList.add("lmModalOverlayAtivo");
}

function configurarModalMensagemObras() {
  const modal = document.getElementById("blModalMensagemObras");
  const botaoFechar = document.getElementById("blFecharModalMensagemObras");
  const botaoCancelar = document.getElementById("blBotaoCancelarMensagemObras");

  botaoFechar.addEventListener("click", () => {
    modal.classList.remove("lmModalOverlayAtivo");
  });

  botaoCancelar.addEventListener("click", () => {
    modal.classList.remove("lmModalOverlayAtivo");
  });

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
      modal.classList.remove("lmModalOverlayAtivo");
    }
  });
}

function obterHeadersJson() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${obterToken()}`,
  };
}

function configurarBotaoAdicionarObra() {
  const botaoAdicionarObra = document.getElementById("blBotaoAdicionarObra");

  if (botaoAdicionarObra) {
    botaoAdicionarObra.addEventListener("click", () => {
      window.location.href = "/pages/obras/cadastroObras.html";
    });
  }
}

async function carregarAutoresDisponiveis() {
  try {
    const resposta = await fetch(blApiAutoresUrl);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar autoras.");
    }

    const dados = await resposta.json();

    blAutoresDisponiveis = Array.isArray(dados)
      ? dados
      : dados.autores || dados.autoras || [];
  } catch (erro) {
    console.error("Erro ao carregar autoras disponíveis:", erro);
    blAutoresDisponiveis = [];
  }
}

async function carregarObras() {
  const listaObras = document.getElementById("blObrasLista");

  try {
    const resposta = await fetch(blApiObrasUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${obterToken()}`,
      },
    });

    if (!resposta.ok) {
      throw new Error("Erro ao buscar obras.");
    }

    const dados = await resposta.json();

    const obras = Array.isArray(dados) ? dados : dados.obras || [];

    blObrasCarregadas = obras;

    listaObras.innerHTML = "";

    if (!obras.length) {
      listaObras.innerHTML =
        '<p class="lmUsuariosMensagem">Nenhuma obra cadastrada.</p>';
      return;
    }

    obras.forEach((obra) => {
      const card = criarCardObra(obra);
      listaObras.appendChild(card);
    });

    configurarBotoesEditarObra();
    configurarBotoesExcluirObra();
  } catch (erro) {
    console.error(erro);
    listaObras.innerHTML =
      '<p class="lmUsuariosMensagem">Erro ao carregar obras.</p>';
  }
}

function criarCardObra(obra) {
  const card = document.createElement("article");
  card.classList.add("blObraCard");

  const idObra = obterIdObra(obra);
  const tituloObra = obterTituloObra(obra);
  const autoresObra = obterAutoresObra(obra);
  const tipoObra = obterTipoObra(obra);

  card.innerHTML = `
        <div class="lmItemLista">
            <div>
                <h3>${tituloObra}</h3>
                <p>${autoresObra}</p>
                <span class="blObraTipo">${tipoObra}</span>
            </div>

            <div class="lmAutorAcoes">
                <button
                    type="button"
                    class="lmBotaoAdminIcone"
                    aria-label="Editar obra"
                    data-id="${idObra}"
                >
                   <svg class="lmIconeAdminLivro" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                    </svg>
                </button>

                <button
                    type="button"
                    class="lmBotaoAdminIcone"
                    aria-label="Excluir obra"
                    data-id="${idObra}"
                >
                    <svg class="lmIconeAdminLivro" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14H6L5 6"></path>
                        <path d="M10 11v6"></path>
                        <path d="M14 11v6"></path>
                        <path d="M9 6V4h6v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

  return card;
}

function obterIdObra(obra) {
  return obra._id || obra.id;
}

function obterTituloObra(obra) {
  return obra.titulo || "Obra sem título";
}

function obterTipoObra(obra) {
  return obra.tipo || "Tipo não informado";
}

function obterAutoresObra(obra) {
  if (
    !obra.autores ||
    !Array.isArray(obra.autores) ||
    obra.autores.length === 0
  ) {
    return "Autora não informada";
  }

  const nomesAutores = obra.autores.map((autor) => {
    return autor.nome || "Autora sem nome";
  });

  return nomesAutores.join(", ");
}

function configurarBotoesEditarObra() {
  const botoesEditar = document.querySelectorAll(
    '.blObraCard button[aria-label="Editar obra"]',
  );

  botoesEditar.forEach((botao) => {
    botao.addEventListener("click", () => {
      const idObra = botao.dataset.id;

      const obraEncontrada = blObrasCarregadas.find((obra) => {
        return String(obterIdObra(obra)) === String(idObra);
      });

      if (obraEncontrada) {
        abrirModalEditarObra(obraEncontrada);
      }
    });
  });
}

function configurarBotoesExcluirObra() {
  const botoesExcluir = document.querySelectorAll(
    '.blObraCard button[aria-label="Excluir obra"]',
  );

  botoesExcluir.forEach((botao) => {
    botao.addEventListener("click", () => {
      const idObra = botao.dataset.id;

      abrirModalMensagemObras({
        titulo: "Excluir obra",
        mensagem: "Tem certeza que deseja excluir esta obra?",
        mostrarCancelar: true,
        aoConfirmar: async () => {
          await excluirObra(idObra);
        },
      });
    });
  });
}

async function excluirObra(idObra) {
  const listaObras = document.getElementById("blObrasLista");

  try {
    const resposta = await fetch(`${blApiObrasUrl}/${idObra}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${obterToken()}`,
      },
    });

    if (!resposta.ok) {
      throw new Error("Erro ao excluir obra.");
    }

    abrirModalMensagemObras({
      titulo: "Obra excluída",
      mensagem: "Obra excluída com sucesso.",
    });

    carregarObras();
  } catch (erro) {
    console.error(erro);
    abrirModalMensagemObras({
      titulo: "Atenção",
      mensagem: erro.message || "Erro ao excluir obra.",
    });
  }
}

function configurarModalEditarObra() {
  const modalEditarObra = document.getElementById("blModalEditarObra");
  const botaoFecharModal = document.getElementById("blFecharModalEditarObra");
  const formularioEditarObra = document.getElementById(
    "blFormularioEditarObra",
  );

  if (botaoFecharModal && modalEditarObra) {
    botaoFecharModal.addEventListener("click", () => {
      fecharModalEditarObra();
    });
  }

  if (modalEditarObra) {
    modalEditarObra.addEventListener("click", (evento) => {
      if (evento.target === modalEditarObra) {
        fecharModalEditarObra();
      }
    });
  }

  if (formularioEditarObra) {
    formularioEditarObra.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      await salvarEdicaoObra();
    });
  }
}

async function abrirModalEditarObra(obra) {
  blObraEmEdicao = obra;

  const modalEditarObra = document.getElementById("blModalEditarObra");
  const campoId = document.getElementById("blEditarObraId");
  const campoTitulo = document.getElementById("blEditarTituloObra");
  const campoTipo = document.getElementById("blEditarTipoObra");
  const campoDescricao = document.getElementById("blEditarDescricaoObra");
  const campoAutor = document.getElementById("blEditarAutorObra");

  if (
    !modalEditarObra ||
    !campoId ||
    !campoTitulo ||
    !campoTipo ||
    !campoDescricao ||
    !campoAutor
  ) {
    console.error("Elementos do modal de edição de obra não encontrados.");
    return;
  }

  if (!blAutoresDisponiveis.length) {
    await carregarAutoresDisponiveis();
  }

  campoId.value = obterIdObra(obra);
  campoTitulo.value = obra.titulo || "";
  campoTipo.value = obra.tipo || "";
  campoDescricao.value = obra.descricao || "";

  preencherSelectAutorEdicao(campoAutor, obra);

  modalEditarObra.classList.add("lmModalOverlayAtivo");
}

function preencherSelectAutorEdicao(campoAutor, obra) {
  campoAutor.innerHTML = '<option value="">Selecione uma autora</option>';

  const primeiroAutor = obterPrimeiroAutorObra(obra);

  blAutoresDisponiveis.forEach((autor) => {
    const optionAutor = document.createElement("option");

    const idAutor = obterIdAutor(autor);
    const nomeAutor = obterNomeAutor(autor);

    optionAutor.value = idAutor;
    optionAutor.textContent = nomeAutor;

    if (
      String(idAutor) === String(primeiroAutor) ||
      nomeAutor === primeiroAutor
    ) {
      optionAutor.selected = true;
    }

    campoAutor.appendChild(optionAutor);
  });
}

function obterPrimeiroAutorObra(obra) {
  if (
    !obra.autores ||
    !Array.isArray(obra.autores) ||
    obra.autores.length === 0
  ) {
    return "";
  }

  const primeiroAutor = obra.autores[0];

  if (typeof primeiroAutor === "string" || typeof primeiroAutor === "number") {
    return primeiroAutor;
  }

  return (
    primeiroAutor.id || primeiroAutor.nome || primeiroAutor.nomeAutor || ""
  );
}

function obterIdAutor(autor) {
  return autor.id || autor.idAutor || autor.id_autor || autor._id || "";
}

function obterNomeAutor(autor) {
  return autor.nome || autor.nomeAutor || autor.nome_autor || "Autora sem nome";
}

function fecharModalEditarObra() {
  const modalEditarObra = document.getElementById("blModalEditarObra");
  const formularioEditarObra = document.getElementById(
    "blFormularioEditarObra",
  );

  if (modalEditarObra) {
    modalEditarObra.classList.remove("lmModalOverlayAtivo");
  }

  if (formularioEditarObra) {
    formularioEditarObra.reset();
  }

  blObraEmEdicao = null;
}

async function salvarEdicaoObra() {
  if (!blObraEmEdicao) {
    return;
  }

  const idObra = document.getElementById("blEditarObraId").value;
  const titulo = document.getElementById("blEditarTituloObra").value.trim();
  const tipo = document.getElementById("blEditarTipoObra").value;
  const descricao = document
    .getElementById("blEditarDescricaoObra")
    .value.trim();

  const campoAutor = document.getElementById("blEditarAutorObra");
  const autorId = campoAutor.value;
  const nomeAutor = campoAutor.options[campoAutor.selectedIndex].text.trim();

  if (!titulo || !tipo || !autorId) {
    abrirModalMensagemObras({
      titulo: "Atenção",
      mensagem: "Preencha todos os campos obrigatórios.",
    });
    return;
  }

  try {
    const resposta = await fetch(`${blApiObrasUrl}/${idObra}`, {
      method: "PUT",
      headers: obterHeadersJson(),
      body: JSON.stringify({
        titulo,
        tipo,
        descricao,
        autores: [
          {
            nome: nomeAutor,
          },
        ],
      }),
    });

    const textoResposta = await resposta.text();

    let dados = {};

    try {
      dados = textoResposta ? JSON.parse(textoResposta) : {};
    } catch (erroJson) {
      console.log("Resposta não veio em JSON:", textoResposta);
    }

    if (!resposta.ok) {
      throw new Error(dados.error || dados.message || "Erro ao editar obra.");
    }

    abrirModalMensagemObras({
      titulo: "Obra atualizada",
      mensagem: "Obra atualizada com sucesso!",
    });

    fecharModalEditarObra();
    carregarObras();
  } catch (erro) {
    console.error("Erro ao editar obra:", erro);
    abrirModalMensagemObras({
      titulo: "Atenção",
      mensagem: erro.message || "Não foi possível editar a obra.",
    });
  }
}