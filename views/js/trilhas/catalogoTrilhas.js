const lmApiTrilhasUrl = "/trilhas";

const lmUsuario = obterUsuarioLogado() || {};

const lmModalOverlay = document.getElementById("lmModalOverlay");
const lmModalFechar = document.getElementById("lmModalFechar");
const lmModalTitulo = document.getElementById("lmModalTitulo");
const lmModalNivel = document.getElementById("lmModalNivel");
const lmModalXp = document.getElementById("lmModalXp");
const lmModalStatus = document.getElementById("lmModalStatus");
const lmModalDescricao = document.getElementById("lmModalDescricao");

const lmGradeTrilhas = document.getElementById("lmGradeTrilhas");

const lmBotaoAbrirBusca = document.getElementById("lmBotaoAbrirBusca");
const lmBuscaHeader = document.getElementById("lmBuscaHeader");
const lmCampoBuscaTrilhas = document.getElementById("lmCampoBuscaTrilhas");

const lmFormularioEditarTrilha = document.getElementById(
  "lmFormularioEditarTrilha",
);
const lmModalEditarTrilha = document.getElementById("lmModalEditarTrilha");
const lmFecharModalEditarTrilha = document.getElementById(
  "lmFecharModalEditarTrilha",
);

let lmTrilhasCarregadas = [];
let lmTrilhasSalvasIds = [];
let lmTrilhaEmEdicao = null;

lmBotaoAbrirBusca.addEventListener("click", function () {
  lmBuscaHeader.classList.toggle("ativo");

  if (lmBuscaHeader.classList.contains("ativo")) {
    lmCampoBuscaTrilhas.focus();
  }
});

function lmObterHeadersJson() {
  const token = obterToken();

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function lmUsuarioEhAdmin() {
  return lmUsuario.tipo === "administrador";
}

function lmUsuarioEhLeitor() {
  return lmUsuario.tipo === "leitor";
}

function lmObterIdTrilha(trilha) {
  return trilha._id || trilha.id;
}

function lmObterIdTrilhaDeVinculo(vinculo) {
  const trilhaRef = vinculo.trilhaId;

  if (trilhaRef && typeof trilhaRef === "object") {
    return String(trilhaRef._id || trilhaRef.id);
  }

  return String(trilhaRef);
}

function lmFormatarNivel(nivel) {
  return tfFormatarNivelTrilha(nivel);
}

const lmObrasDisponiveisEdicao = [];
const lmLivrosDisponiveisEdicao = [];
let lmGerenciadorItensEdicao = null;

function lmFormatarXp(xp) {
  if (!xp && xp !== 0) {
    return "XP não informado";
  }

  return `${xp} XP`;
}

function lmFormatarStatus(liberada) {
  if (liberada === true) {
    return "Liberada";
  }

  if (liberada === false) {
    return "Bloqueada";
  }

  return "Não definida";
}

function lmObterQuantidadeItensTrilha(trilha) {
  if (!trilha || typeof trilha !== "object") {
    return { total: null, obras: 0, livros: 0, temCampoQuantidade: false };
  }

  if (
    typeof trilha.quantidadeItens === "number" &&
    !Number.isNaN(trilha.quantidadeItens)
  ) {
    return {
      total: trilha.quantidadeItens,
      obras: 0,
      livros: 0,
      temCampoQuantidade: true,
    };
  }

  if (Array.isArray(trilha.itens)) {
    let obras = 0;
    let livros = 0;

    trilha.itens.forEach(function (item) {
      const tipo = item?.itemTipo || item?.tipoItem;

      if (tipo === "obra" || tipo === "Obra") {
        obras += 1;
        return;
      }

      if (tipo === "livro" || tipo === "Livro") {
        livros += 1;
      }
    });

    if (!obras && !livros && trilha.itens.length) {
      return {
        total: trilha.itens.length,
        obras: 0,
        livros: 0,
        temCampoQuantidade: false,
      };
    }

    return {
      total: trilha.itens.length,
      obras,
      livros,
      temCampoQuantidade: false,
    };
  }

  const obras = Array.isArray(trilha.obras) ? trilha.obras.length : 0;
  const livros = Array.isArray(trilha.livros) ? trilha.livros.length : 0;

  return { total: obras + livros, obras, livros, temCampoQuantidade: false };
}

function lmFormatarQuantidadeItens(trilha) {
  const { total, obras, livros, temCampoQuantidade } =
    lmObterQuantidadeItensTrilha(trilha);

  if (temCampoQuantidade) {
    if (total === 0) {
      return "0 leituras";
    }

    if (total === 1) {
      return "1 leitura";
    }

    return `${total} leituras`;
  }

  if (total === 0 || total === null) {
    return null;
  }

  if (obras > 0 && livros === 0) {
    return obras === 1 ? "1 obra" : `${obras} obras`;
  }

  if (livros > 0 && obras === 0) {
    return livros === 1 ? "1 livro" : `${livros} livros`;
  }

  return total === 1 ? "1 leitura" : `${total} leituras`;
}

function lmTruncarDescricaoCard(descricao) {
  const texto = String(descricao || "").trim();

  if (!texto) {
    return "";
  }

  const palavras = texto.split(/\s+/).filter(Boolean);

  if (palavras.length <= 4) {
    return texto;
  }

  return `${palavras.slice(0, 4).join(" ")}...`;
}

function lmAbrirModalMensagem({
  titulo = "Atenção",
  mensagem,
  mostrarCancelar = false,
  aoConfirmar = null,
}) {
  const modal = document.getElementById("lmModalMensagemAcervo");
  const tituloModal = document.getElementById("lmModalMensagemTitulo");
  const textoModal = document.getElementById("lmModalMensagemTexto");
  const botaoConfirmar = document.getElementById("lmBotaoConfirmarMensagem");
  const botaoCancelar = document.getElementById("lmBotaoCancelar");

  tituloModal.textContent = titulo;
  textoModal.textContent = mensagem;

  botaoCancelar.style.display = mostrarCancelar ? "inline-flex" : "none";

  const novoBotaoConfirmar = botaoConfirmar.cloneNode(true);
  botaoConfirmar.parentNode.replaceChild(novoBotaoConfirmar, botaoConfirmar);

  novoBotaoConfirmar.addEventListener("click", async function () {
    modal.classList.remove("lmModalOverlayAtivo");

    if (typeof aoConfirmar === "function") {
      await aoConfirmar();
    }
  });

  modal.classList.add("lmModalOverlayAtivo");
}



function lmConfigurarModalMensagemAcervo() {
  const modal = document.getElementById("lmModalMensagemAcervo");
  const botaoFechar = document.getElementById("lmFecharModalMensagemAcervo");
  const botaoCancelar = document.getElementById("lmBotaoCancelar");

  botaoFechar.addEventListener("click", function () {
    modal.classList.remove("lmModalOverlayAtivo");
  });

  botaoCancelar.addEventListener("click", function () {
    modal.classList.remove("lmModalOverlayAtivo");
  });

  modal.addEventListener("click", function (evento) {
    if (evento.target === modal) {
      modal.classList.remove("lmModalOverlayAtivo");
    }
  });
}

function lmAbrirModalTrilha(trilha) {
  lmModalTitulo.textContent = trilha.tema || "Tema não informado";
  lmModalNivel.textContent = lmFormatarNivel(trilha.nivelDificuldade);
  lmModalXp.textContent = lmFormatarXp(trilha.xp);
  lmModalDescricao.textContent = trilha.descricao || "Descrição não informada.";

  const linhaStatus = lmModalStatus.closest('.lmModalLinha');

  if (lmUsuarioEhAdmin()) {
    lmModalStatus.textContent = lmFormatarStatus(trilha.liberada);

    if (linhaStatus) {
      linhaStatus.style.display = 'flex';
    }
  } else {
    if (linhaStatus) {
      linhaStatus.style.display = 'none';
    }
  }

  lmModalOverlay.classList.add("lmModalOverlayAtivo");
}

async function lmEditarTrilha(trilha) {
  try {
    const trilhaId = lmObterIdTrilha(trilha);
    const resposta = await fetch(`/trilhas/${trilhaId}`);
    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Não foi possível carregar os dados da trilha.");
    }

    lmTrilhaEmEdicao = dados;

    document.getElementById("lmEditarTrilhaId").value = trilhaId;
    document.getElementById("lmEditarTema").value = dados.tema || "";
    document.getElementById("lmEditarDescricao").value = dados.descricao || "";
    tfPreencherSelectNivel(
      document.getElementById("lmEditarNivelDificuldade"),
      dados.nivelDificuldade,
    );
    document.getElementById("lmEditarXp").value = dados.xp ?? "";

    const itensTrilha = dados.itens || [
      ...(dados.obras || []).map((obra) => ({ ...obra, itemTipo: "obra" })),
      ...(dados.livros || []).map((livro) => ({ ...livro, itemTipo: "livro" })),
    ].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

    lmGerenciadorItensEdicao.carregarItens(itensTrilha);

    const campoImagemCapa = document.getElementById("lmEditarImagemCapa");
    if (campoImagemCapa) {
      campoImagemCapa.value = "";
    }

    tfAtualizarPreviewCapaTrilha(
      document.getElementById("lmEditarPreviewCapaTrilha"),
      dados.imagemCapa,
    );

    lmModalEditarTrilha.classList.add("lmModalOverlayAtivo");
  } catch (erro) {
    console.error("Erro ao abrir edição da trilha:", erro);
    lmAbrirModalMensagem({
      titulo: "Atenção",
      mensagem: erro.message || "Não foi possível carregar a trilha para edição.",
    });
  }
}

async function lmExcluirTrilha(idTrilha) {
  lmAbrirModalMensagem({
    titulo: "Excluir trilha",
    mensagem: "Tem certeza que deseja excluir esta trilha?",
    mostrarCancelar: true,
    aoConfirmar: async function () {
      try {
        const resposta = await fetch(`/trilhas/${idTrilha}`, {
          method: "DELETE",
          headers: lmObterHeadersJson(),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(dados.error || "Erro ao excluir trilha.");
        }

        lmAbrirModalMensagem({
          titulo: "Trilha excluída",
          mensagem: "Trilha excluída com sucesso.",
        });

        lmCarregarTrilhas();
      } catch (erro) {
        console.error("Erro ao excluir trilha:", erro);

        lmAbrirModalMensagem({
          titulo: "Atenção",
          mensagem: erro.message || "Não foi possível excluir a trilha.",
        });
      }
    },
  });
}

async function lmAlternarLiberacaoTrilha(trilha) {
  const idTrilha = lmObterIdTrilha(trilha);
  const novoStatus = !trilha.liberada;

  const mensagemConfirmacao = novoStatus
    ? "Deseja liberar esta trilha para os leitores?"
    : "Deseja bloquear esta trilha para os leitores?";

  lmAbrirModalMensagem({
    titulo: novoStatus ? "Liberar trilha" : "Bloquear trilha",
    mensagem: mensagemConfirmacao,
    mostrarCancelar: true,
    aoConfirmar: async function () {
      try {
        const resposta = await fetch(`/trilhas/${idTrilha}`, {
          method: "PUT",
          headers: lmObterHeadersJson(),
          body: JSON.stringify({
            liberada: novoStatus,
          }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.error || "Erro ao atualizar liberação da trilha.",
          );
        }

        lmAbrirModalMensagem({
          titulo: novoStatus ? "Trilha liberada" : "Trilha bloqueada",
          mensagem: novoStatus
            ? "Trilha liberada com sucesso!"
            : "Trilha bloqueada com sucesso!",
        });

        lmCarregarTrilhas();
      } catch (erro) {
        console.error("Erro ao liberar/bloquear trilha:", erro);

        lmAbrirModalMensagem({
          titulo: "Funcionalidade em desenvolvimento",
          mensagem:
            erro.message ||
            "A alteração de liberação da trilha ainda precisa ser finalizada no back-end.",
        });
      }
    },
  });
}

async function lmCarregarTrilhasSalvasUsuario() {
  if (!lmUsuario.id || !lmUsuarioEhLeitor()) {
    return;
  }

  try {
    const resposta = await fetch(`/usuarios/${lmUsuario.id}/trilhas`, {
      headers: lmObterHeadersJson(),
    });

    if (resposta.status === 404) {
      lmTrilhasSalvasIds = [];
      return;
    }

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Erro ao carregar trilhas salvas.");
    }

    const trilhas = dados.trilhas || [];
    lmTrilhasSalvasIds = trilhas.map(function (vinculo) {
      return lmObterIdTrilhaDeVinculo(vinculo);
    });
  } catch (erro) {
    console.error("Erro ao carregar trilhas salvas:", erro);
    lmTrilhasSalvasIds = [];
  }
}

async function lmSalvarTrilhaUsuario(trilhaId) {
  if (!lmUsuario.id) {
    lmAbrirModalMensagem({
      titulo: "Atenção",
      mensagem: "Você precisa estar logado para salvar uma trilha.",
    });

    return;
  }

  try {
    const resposta = await fetch(`/usuarios/${lmUsuario.id}/trilhas`, {
      method: "POST",
      headers: lmObterHeadersJson(),
      body: JSON.stringify({
        trilhaId: String(trilhaId),
        status: "para ler",
      }),
    });

    const dados = await resposta.json();

    if (resposta.status === 400 && dados.error) {
      if (dados.error.includes("já está")) {
        if (!lmTrilhasSalvasIds.includes(String(trilhaId))) {
          lmTrilhasSalvasIds.push(String(trilhaId));
        }

        const botaoSalvar = document.querySelector(
          `[data-trilha-salvar-id="${trilhaId}"]`,
        );

        if (botaoSalvar) {
          botaoSalvar.classList.add("salvo");
        }

        lmAbrirModalMensagem({
          titulo: "Trilha já salva",
          mensagem: dados.error,
        });

        return;
      }
    }

    if (!resposta.ok) {
      throw new Error(dados.error || "Não foi possível salvar a trilha.");
    }

    if (!lmTrilhasSalvasIds.includes(String(trilhaId))) {
      lmTrilhasSalvasIds.push(String(trilhaId));
    }

    const botaoSalvar = document.querySelector(
      `[data-trilha-salvar-id="${trilhaId}"]`,
    );

    if (botaoSalvar) {
      botaoSalvar.classList.add("salvo");
    }

    lmAbrirModalMensagem({
      titulo: "Trilha salva",
      mensagem: dados.message || "Trilha salva com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao salvar trilha:", erro);

    lmAbrirModalMensagem({
      titulo: "Atenção",
      mensagem: erro.message || "Não foi possível salvar a trilha.",
    });
  }
}

async function lmRemoverTrilhaSalvaUsuario(trilhaId) {
  try {
    const resposta = await fetch(
      `/usuarios/${lmUsuario.id}/trilhas/${trilhaId}`,
      {
        method: "DELETE",
        headers: lmObterHeadersJson(),
      },
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.error || "Não foi possível remover a trilha dos salvos.",
      );
    }

    lmTrilhasSalvasIds = lmTrilhasSalvasIds.filter(function (id) {
      return String(id) !== String(trilhaId);
    });

    const botaoSalvar = document.querySelector(
      `[data-trilha-salvar-id="${trilhaId}"]`,
    );

    if (botaoSalvar) {
      botaoSalvar.classList.remove("salvo");
    }

    lmAbrirModalMensagem({
      titulo: "Trilha removida",
      mensagem: "Trilha removida dos salvos com sucesso.",
    });
  } catch (erro) {
    console.error("Erro ao remover trilha salva:", erro);

    lmAbrirModalMensagem({
      titulo: "Atenção",
      mensagem:
        erro.message || "Não foi possível remover a trilha dos salvos.",
    });
  }
}

function lmCriarCardTrilha(trilha) {
  const idTrilha = lmObterIdTrilha(trilha);

  const cardTrilha = document.createElement("article");
  cardTrilha.classList.add("lmCardLivro");
  cardTrilha.classList.add('blCardTrilha')

  const imagemTrilha = document.createElement("img");
  imagemTrilha.classList.add("lmCardImagem");
  imagemTrilha.src = tfResolverCapaTrilha(trilha.imagemCapa);
  imagemTrilha.alt = trilha.tema || "Trilha de leitura";

  imagemTrilha.onerror = function () {
    imagemTrilha.src = "/assets/capaPadrao.jpg";
  };

  const conteudoCard = document.createElement("div");
  conteudoCard.classList.add("lmCardConteudo");

  const tituloTrilha = document.createElement("h3");
  tituloTrilha.classList.add("lmCardTitulo");
  tituloTrilha.textContent = trilha.tema || "Tema não informado";

  const nivelTrilha = document.createElement("p");
  nivelTrilha.classList.add("lmCardAutor");
  nivelTrilha.textContent = `${lmFormatarNivel(trilha.nivelDificuldade)} • ${lmFormatarXp(trilha.xp)}`;

  conteudoCard.appendChild(tituloTrilha);
  conteudoCard.appendChild(nivelTrilha);

  const textoQuantidade = lmFormatarQuantidadeItens(trilha);

  if (textoQuantidade) {
    const quantidadeItens = document.createElement("p");
    quantidadeItens.classList.add("blCardTrilhaSalvaDetalhes");
    quantidadeItens.textContent = textoQuantidade;
    conteudoCard.appendChild(quantidadeItens);
  }

  const descricaoTexto = String(trilha.descricao || "").trim();

  if (descricaoTexto) {
    const descricaoTrilha = document.createElement("p");
    descricaoTrilha.classList.add("blCardTrilhaDescricao");
    descricaoTrilha.textContent = lmTruncarDescricaoCard(descricaoTexto);
    conteudoCard.appendChild(descricaoTrilha);
  }

  if (lmUsuarioEhAdmin()) {
    const statusTrilha = document.createElement("p");
    statusTrilha.classList.add("lmCardAutor");
    statusTrilha.classList.add("blStatusTrilha");
    statusTrilha.textContent = `Status: ${lmFormatarStatus(trilha.liberada)}`;

    conteudoCard.appendChild(statusTrilha);
  }

  const botaoSaibaMais = document.createElement("button");
  botaoSaibaMais.classList.add("lmBotaoSaibaMais");
  botaoSaibaMais.type = "button";
  botaoSaibaMais.textContent = "Saiba Mais";

  botaoSaibaMais.addEventListener("click", function () {
    window.location.href = `visualizar.html?id=${idTrilha}`;
  });

  const areaAcoesTrilha = document.createElement("div");
  areaAcoesTrilha.classList.add("lmAreaAcoesLivro");

  areaAcoesTrilha.appendChild(botaoSaibaMais);

  if (lmUsuarioEhLeitor()) {
    const areaSalvarTrilha = document.createElement("div");
    areaSalvarTrilha.classList.add("lmAreaSalvarLivro");

    const botaoSalvarTrilha = document.createElement("button");
    botaoSalvarTrilha.type = "button";
    botaoSalvarTrilha.classList.add("lmBotaoSalvarLivro");
    botaoSalvarTrilha.setAttribute("aria-label", "Salvar trilha");
    botaoSalvarTrilha.dataset.trilhaSalvarId = idTrilha;

    if (lmTrilhasSalvasIds.includes(String(idTrilha))) {
      botaoSalvarTrilha.classList.add("salvo");
    }

    botaoSalvarTrilha.innerHTML = `
      <svg class="lmIconeSalvarLivro" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    `;

    botaoSalvarTrilha.addEventListener("click", function (evento) {
      evento.preventDefault();
      evento.stopPropagation();

      const trilhaJaSalva = lmTrilhasSalvasIds.includes(String(idTrilha));

      if (trilhaJaSalva) {
        lmAbrirModalMensagem({
          titulo: "Remover trilha",
          mensagem: "Deseja remover esta trilha dos seus salvos?",
          mostrarCancelar: true,
          aoConfirmar: async function () {
            await lmRemoverTrilhaSalvaUsuario(idTrilha);
          },
        });

        return;
      }

      lmSalvarTrilhaUsuario(idTrilha);
    });

    areaSalvarTrilha.appendChild(botaoSalvarTrilha);
    areaAcoesTrilha.appendChild(areaSalvarTrilha);
  }

  conteudoCard.appendChild(areaAcoesTrilha);

  if (lmUsuarioEhAdmin()) {
    const acoesAdmin = document.createElement("div");
    acoesAdmin.classList.add("lmCardAcoesAdmin");

    const botaoEditarTrilha = document.createElement("button");
    botaoEditarTrilha.classList.add("lmBotaoAdminIcone");
    botaoEditarTrilha.type = "button";
    botaoEditarTrilha.setAttribute("aria-label", "Editar trilha");
    botaoEditarTrilha.dataset.idTrilha = idTrilha;

    botaoEditarTrilha.innerHTML = `
      <svg class="lmIconeAdminLivro" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
      </svg>
    `;

    botaoEditarTrilha.addEventListener("click", function () {
      lmEditarTrilha(trilha);
    });

    const botaoExcluirTrilha = document.createElement("button");
    botaoExcluirTrilha.classList.add("lmBotaoAdminIcone");
    botaoExcluirTrilha.type = "button";
    botaoExcluirTrilha.setAttribute("aria-label", "Excluir trilha");
    botaoExcluirTrilha.dataset.idTrilha = idTrilha;

    botaoExcluirTrilha.innerHTML = `
      <svg class="lmIconeAdminLivro" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6l-1 14H6L5 6"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
        <path d="M9 6V4h6v2"></path>
      </svg>
    `;

    botaoExcluirTrilha.addEventListener("click", function () {
      lmExcluirTrilha(idTrilha);
    });

    const botaoLiberarTrilha = document.createElement("button");
    botaoLiberarTrilha.classList.add("lmBotaoAdminIcone");
    botaoLiberarTrilha.classList.add("blBotaoLiberarTrilha");
    botaoLiberarTrilha.type = "button";
    botaoLiberarTrilha.dataset.idTrilha = idTrilha;

    botaoLiberarTrilha.setAttribute(
      "aria-label",
      trilha.liberada ? "Bloquear trilha" : "Liberar trilha",
    );

    botaoLiberarTrilha.innerHTML = trilha.liberada
      ? `
        <svg class="lmIconeAdminLivro" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
        </svg>
      `
      : `
        <svg class="lmIconeAdminLivro" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      `;

    botaoLiberarTrilha.addEventListener("click", function () {
      lmAlternarLiberacaoTrilha(trilha);
    });

    acoesAdmin.appendChild(botaoEditarTrilha);
    acoesAdmin.appendChild(botaoExcluirTrilha);
    acoesAdmin.appendChild(botaoLiberarTrilha);

    conteudoCard.appendChild(acoesAdmin);
  }

  cardTrilha.appendChild(imagemTrilha);
  cardTrilha.appendChild(conteudoCard);

  return cardTrilha;
}

function lmFiltrarTrilhasPorPerfil(trilhas) {
  if (lmUsuarioEhAdmin()) {
    return trilhas;
  }

  return trilhas.filter(function (trilha) {
    return trilha.liberada === true;
  });
}

function lmRenderizarTrilhas(trilhas) {
  lmGradeTrilhas.innerHTML = "";

  if (!Array.isArray(trilhas) || trilhas.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.classList.add("lmMensagemEstado");
    mensagem.textContent = "Nenhuma trilha encontrada.";
    lmGradeTrilhas.appendChild(mensagem);
    return;
  }

  trilhas.forEach(function (trilha) {
    lmGradeTrilhas.appendChild(lmCriarCardTrilha(trilha));
  });
}

function lmNormalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function lmFiltrarTrilhas() {
  const termoBusca = lmNormalizarTexto(lmCampoBuscaTrilhas.value);

  if (!termoBusca) {
    lmRenderizarTrilhas(lmTrilhasCarregadas);
    return;
  }

  const trilhasFiltradas = lmTrilhasCarregadas.filter(function (trilha) {
    const tema = lmNormalizarTexto(trilha.tema);
    const descricao = lmNormalizarTexto(trilha.descricao);
    const nivel = lmNormalizarTexto(trilha.nivelDificuldade);
    const xp = lmNormalizarTexto(trilha.xp);
    const status = lmNormalizarTexto(lmFormatarStatus(trilha.liberada));

    return (
      tema.includes(termoBusca) ||
      descricao.includes(termoBusca) ||
      nivel.includes(termoBusca) ||
      xp.includes(termoBusca) ||
      status.includes(termoBusca)
    );
  });

  lmRenderizarTrilhas(trilhasFiltradas);
}

async function lmCarregarTrilhas() {
  try {
    const resposta = await fetch(lmApiTrilhasUrl);

    if (resposta.status === 404) {
      lmTrilhasCarregadas = [];
      lmRenderizarTrilhas(lmTrilhasCarregadas);
      return;
    }

    if (!resposta.ok) {
      throw new Error("Erro ao carregar trilhas.");
    }

    const trilhas = await resposta.json();

    lmTrilhasCarregadas = lmFiltrarTrilhasPorPerfil(trilhas);
    lmRenderizarTrilhas(lmTrilhasCarregadas);

  } catch (erro) {
    lmGradeTrilhas.innerHTML = "";

    const mensagemErro = document.createElement("p");
    mensagemErro.classList.add("lmMensagemEstado");
    mensagemErro.textContent = "Não foi possível carregar o acervo de trilhas.";

    lmGradeTrilhas.appendChild(mensagemErro);
    console.error(erro);
  }
}

lmModalFechar.addEventListener("click", function () {
  lmModalOverlay.classList.remove("lmModalOverlayAtivo");
});

lmModalOverlay.addEventListener("click", function (evento) {
  if (evento.target === lmModalOverlay) {
    lmModalOverlay.classList.remove("lmModalOverlayAtivo");
  }
});

lmFecharModalEditarTrilha.addEventListener("click", function () {
  lmModalEditarTrilha.classList.remove("lmModalOverlayAtivo");
});

lmModalEditarTrilha.addEventListener("click", function (evento) {
  if (evento.target === lmModalEditarTrilha) {
    lmModalEditarTrilha.classList.remove("lmModalOverlayAtivo");
  }
});

lmFormularioEditarTrilha.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  if (!lmTrilhaEmEdicao) {
    return;
  }

  const trilhaId = document.getElementById("lmEditarTrilhaId").value;
  const tema = document.getElementById("lmEditarTema").value.trim();
  const descricao = document.getElementById("lmEditarDescricao").value.trim();
  const nivelDificuldade = Number(
    document.getElementById("lmEditarNivelDificuldade").value,
  );
  const xp = Number(document.getElementById("lmEditarXp").value);
  const liberada = document.getElementById("lmEditarLiberada")?.checked;
  const { obras, livros } = lmGerenciadorItensEdicao.montarPayload();
  const novaImagemArquivo = document.getElementById("lmEditarImagemCapa")?.files[0];

  if (!lmGerenciadorItensEdicao.itens.length) {
    lmAbrirModalMensagem({
      titulo: "Atenção",
      mensagem: "Adicione pelo menos uma obra ou livro à trilha.",
    });
    return;
  }

  try {
    const novaImagemUrl = await tfUploadImagemCapaTrilha(novaImagemArquivo);

    const resposta = await fetch(`/trilhas/${trilhaId}`, {
      method: "PUT",
      headers: lmObterHeadersJson(),
      body: JSON.stringify({
        tema,
        descricao,
        nivelDificuldade,
        xp,
        liberada,
        obras,
        livros,
        imagemCapa: novaImagemUrl || lmTrilhaEmEdicao.imagemCapa || "",
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Erro ao editar trilha.");
    }

    lmAbrirModalMensagem({
      titulo: "Trilha atualizada",
      mensagem: "Trilha atualizada com sucesso!",
    });

    lmModalEditarTrilha.classList.remove("lmModalOverlayAtivo");
    lmFormularioEditarTrilha.reset();
    lmTrilhaEmEdicao = null;
    lmGerenciadorItensEdicao.limparItens();

    lmCarregarTrilhas();
  } catch (erro) {
    console.error("Erro ao editar trilha:", erro);

    lmAbrirModalMensagem({
      titulo: "Atenção",
      mensagem: erro.message || "Não foi possível editar a trilha.",
    });
  }
});

async function lmCarregarObrasEdicao() {
  const resposta = await fetch("/obras");
  const dados = await resposta.json();
  const obras = dados.obras || [];

  lmObrasDisponiveisEdicao.length = 0;
  obras.forEach((obra) => {
    lmObrasDisponiveisEdicao.push({
      id: String(obra._id || obra.id),
      titulo: obra.titulo || "Obra sem título",
    });
  });
}

async function lmCarregarLivrosEdicao() {
  const resposta = await fetch("/livros");
  const livros = await resposta.json();
  const listaLivros = Array.isArray(livros) ? livros : livros.livros || [];

  lmLivrosDisponiveisEdicao.length = 0;
  listaLivros.forEach((livro) => {
    lmLivrosDisponiveisEdicao.push({
      id: String(livro.id),
      titulo: livro.titulo || "Livro sem título",
    });
  });
}

function lmInicializarEdicaoTrilha() {
  tfPreencherSelectNivel(document.getElementById("lmEditarNivelDificuldade"));

  lmGerenciadorItensEdicao = tfCriarGerenciadorItens({
    listaElemento: document.getElementById("lmEditarListaItensTrilha"),
    exibirMensagem: (mensagem) => {
      lmAbrirModalMensagem({ titulo: "Atenção", mensagem });
    },
  });

  const campoObra = document.getElementById("lmEditarObra");
  const campoLivro = document.getElementById("lmEditarLivro");
  const listaObras = document.getElementById("lmEditarListaObras");
  const listaLivros = document.getElementById("lmEditarListaLivros");

  tfConfigurarAutocomplete({
    campo: campoObra,
    lista: listaObras,
    itensDisponiveis: lmObrasDisponiveisEdicao,
    obterRotulo: (item) => item.titulo,
    obterId: (item) => item.id,
  });

  tfConfigurarAutocomplete({
    campo: campoLivro,
    lista: listaLivros,
    itensDisponiveis: lmLivrosDisponiveisEdicao,
    obterRotulo: (item) => item.titulo,
    obterId: (item) => item.id,
  });

  document.getElementById("lmEditarAdicionarObra")?.addEventListener("click", () => {
    const adicionou = lmGerenciadorItensEdicao.adicionarItem(
      "obra",
      campoObra.dataset.id,
      campoObra.value.trim(),
    );

    if (adicionou) {
      campoObra.value = "";
      campoObra.dataset.id = "";
      listaObras.classList.remove("ativo");
    }
  });

  document.getElementById("lmEditarAdicionarLivro")?.addEventListener("click", () => {
    const adicionou = lmGerenciadorItensEdicao.adicionarItem(
      "livro",
      campoLivro.dataset.id,
      campoLivro.value.trim(),
    );

    if (adicionou) {
      campoLivro.value = "";
      campoLivro.dataset.id = "";
      listaLivros.classList.remove("ativo");
    }
  });

  document.addEventListener("click", (evento) => {
    if (!evento.target.closest(".lmCadastroAutocomplete")) {
      listaObras.classList.remove("ativo");
      listaLivros.classList.remove("ativo");
    }
  });

  const campoImagemCapa = document.getElementById("lmEditarImagemCapa");
  const previewImagemCapa = document.getElementById("lmEditarPreviewCapaTrilha");

  campoImagemCapa?.addEventListener("change", function () {
    const arquivo = campoImagemCapa.files[0];

    if (!arquivo) {
      tfAtualizarPreviewCapaTrilha(previewImagemCapa, lmTrilhaEmEdicao?.imagemCapa);
      return;
    }

    if (!tfValidarArquivoImagem(arquivo)) {
      campoImagemCapa.value = "";
      tfAtualizarPreviewCapaTrilha(previewImagemCapa, lmTrilhaEmEdicao?.imagemCapa);
      lmAbrirModalMensagem({
        titulo: "Atenção",
        mensagem: "Selecione um arquivo de imagem válido.",
      });
      return;
    }

    previewImagemCapa.src = URL.createObjectURL(arquivo);
  });
}

const lmToggleDescricao = document.getElementById("lmToggleDescricao");
const lmDescricaoContainer = document.getElementById("lmDescricaoContainer");

lmToggleDescricao.addEventListener("click", function () {
  lmDescricaoContainer.classList.toggle("ativo");
  lmToggleDescricao.classList.toggle("rotacionado");
});

lmCampoBuscaTrilhas.addEventListener("input", lmFiltrarTrilhas);

async function lmInicializarAcervoTrilhas() {
  await lmCarregarTrilhasSalvasUsuario();
  await lmCarregarTrilhas();
}

const lmBotaoFlutuante = document.getElementById("lmBotaoFlutuante");

if (!lmUsuarioEhAdmin()) {
  if (lmBotaoFlutuante) {
    lmBotaoFlutuante.style.display = "none";
  }
}

lmConfigurarModalMensagemAcervo();
lmInicializarEdicaoTrilha();
lmCarregarObrasEdicao();
lmCarregarLivrosEdicao();
lmInicializarAcervoTrilhas();