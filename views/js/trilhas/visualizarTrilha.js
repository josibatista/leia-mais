function protegerVisualizarTrilha() {
  if (usuarioEstaLogado()) {
    return true;
  }

  const executarBloqueio = () => {
    ocultarConteudoProtegido();
    exibirAlertaAcesso("Faça login para continuar.", {
      titulo: "Acesso negado",
      redirect: "/pages/usuarios/leitor/login.html",
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", executarBloqueio, { once: true });
  } else {
    executarBloqueio();
  }

  return false;
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!protegerVisualizarTrilha()) {
    return;
  }

  const token = obterToken();
  const usuario = obterUsuarioLogado();

  const params = new URLSearchParams(window.location.search);
  const trilhaId = params.get("id");

  let vinculoAtual = null;
  let trilhaDetalhes = null;
  let itensAtuais = [];
  let progressoAtual = { concluidas: 0, total: 0, percentual: 0 };

  const vtTituloTrilha = document.getElementById("vtTituloTrilha");
  const vtNivelTrilha = document.getElementById("vtNivelTrilha");
  const vtXpTrilha = document.getElementById("vtXpTrilha");
  const vtStatusTrilha = document.getElementById("vtStatusTrilha");
  const vtDescricaoTrilha = document.getElementById("vtDescricaoTrilha");
  const vtAreaDescricao = document.getElementById("vtAreaDescricao");
  const vtAreaProgresso = document.getElementById("vtAreaProgresso");
  const vtBarraProgressoPreenchimento = document.getElementById("vtBarraProgressoPreenchimento");
  const vtProgressoTexto = document.getElementById("vtProgressoTexto");
  const vtAreaAcao = document.getElementById("vtAreaAcao");
  const vtListaObras = document.getElementById("vtListaObras");
  const vtMensagemObras = document.getElementById("vtMensagemObras");

  if (!trilhaId) {
    abrirModalMensagem({
      titulo: "Trilha não encontrada",
      mensagem: "Identificador da trilha não informado.",
      aoFechar: () => {
        window.location.href = "/pages/trilhas/catalogo.html";
      },
    });
    return;
  }

  function obterHeadersJson() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  function obterTrilhaDoVinculo(vinculo) {
    const trilhaRef = vinculo?.trilhaId;

    if (trilhaRef && typeof trilhaRef === "object") {
      return trilhaRef;
    }

    return null;
  }

  function formatarNivel(nivel) {
    const rotulo = tfFormatarNivelTrilha(nivel);
    return rotulo === "Nível não informado" ? null : rotulo;
  }

  function mensagemAmigavelStatus(novoStatus) {
    const mensagens = {
      "em andamento": "Trilha iniciada com sucesso.",
      pausada: "Trilha pausada com sucesso.",
      concluída: "Trilha concluída com sucesso.",
      "para ler": "Trilha salva para ler depois.",
    };

    return mensagens[novoStatus] || "Trilha atualizada com sucesso.";
  }

  function formatarStatus(status) {
    const statusFormatado = {
      "para ler": "Para ler",
      pausada: "Pausada",
      "em andamento": "Em andamento",
      concluída: "Concluída",
    };

    return statusFormatado[status] || status;
  }

  function abrirModalMensagem({ titulo = "Atenção", mensagem, aoFechar = null }) {
    const modal = document.getElementById("vtModalMensagem");
    const tituloModal = document.getElementById("vtModalMensagemTitulo");
    const textoModal = document.getElementById("vtModalMensagemTexto");
    const botaoConfirmar = document.getElementById("vtBotaoConfirmarMensagem");

    tituloModal.textContent = titulo;
    textoModal.textContent = mensagem;
    modal.classList.add("lmModalOverlayAtivo");

    const novoBotao = botaoConfirmar.cloneNode(true);
    botaoConfirmar.parentNode.replaceChild(novoBotao, botaoConfirmar);

    novoBotao.addEventListener("click", () => {
      modal.classList.remove("lmModalOverlayAtivo");

      if (typeof aoFechar === "function") {
        aoFechar();
      }
    });
  }

  function configurarModalMensagem() {
    const modal = document.getElementById("vtModalMensagem");
    const botaoFechar = document.getElementById("vtFecharModalMensagem");

    botaoFechar.addEventListener("click", () => {
      modal.classList.remove("lmModalOverlayAtivo");
    });

    modal.addEventListener("click", (evento) => {
      if (evento.target === modal) {
        modal.classList.remove("lmModalOverlayAtivo");
      }
    });
  }

  function renderizarProgresso(progresso) {
    progressoAtual = progresso || { concluidas: 0, total: 0, percentual: 0 };

    if (!vinculoAtual || progressoAtual.total === 0) {
      vtAreaProgresso.style.display = vinculoAtual ? "flex" : "none";
      vtBarraProgressoPreenchimento.style.width = "0%";
      vtProgressoTexto.textContent = vinculoAtual
        ? "Nenhum item vinculado para calcular o progresso."
        : "";
      return;
    }

    vtAreaProgresso.style.display = "flex";
    vtBarraProgressoPreenchimento.style.width = `${progressoAtual.percentual}%`;
    vtProgressoTexto.textContent = `${progressoAtual.percentual}% (${progressoAtual.concluidas}/${progressoAtual.total})`;
  }

  function obterIdItem(item) {
    return String(item._id || item.id);
  }

  async function alternarItemConcluido(item, concluida) {
    if (!vinculoAtual) {
      return;
    }

    const rota =
      item.itemTipo === "livro"
        ? `/usuarios/${usuario.id}/trilhas/${trilhaId}/livros/${obterIdItem(item)}`
        : `/usuarios/${usuario.id}/trilhas/${trilhaId}/obras/${obterIdItem(item)}`;

    try {
      const resposta = await fetch(rota, {
        method: "PUT",
        headers: obterHeadersJson(),
        body: JSON.stringify({ concluida }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || "Não foi possível salvar a alteração. Tente novamente.");
      }

      vinculoAtual = dados.trilha || vinculoAtual;
      itensAtuais = dados.itens || itensAtuais;
      renderizarProgresso(dados.progresso);
      renderizarItens();
      renderizarTrilha();
      renderizarBotaoAcao();
    } catch (erro) {
      console.error("Erro ao atualizar item:", erro);
      abrirModalMensagem({
        titulo: "Atenção",
        mensagem: erro.message || "Não foi possível salvar a alteração. Tente novamente.",
      });
      renderizarItens();
    }
  }

  function renderizarItens() {
    vtListaObras.innerHTML = "";
    vtMensagemObras.hidden = true;

    if (!itensAtuais.length) {
      vtMensagemObras.hidden = false;
      return;
    }

    itensAtuais.forEach((item, indice) => {
      const elemento = document.createElement("li");
      elemento.classList.add("vtItemObra");

      const ordem = item.ordem || indice + 1;
      const titulo = item.titulo || "Título não informado";
      const tipoItem = item.tipoItem || (item.itemTipo === "livro" ? "Livro" : "Obra");
      const detalhe = item.tipo && item.itemTipo !== "livro" ? ` (${item.tipo})` : "";
      const podeMarcar = Boolean(vinculoAtual) && vinculoAtual.status !== "concluída";

      if (podeMarcar) {
        const label = document.createElement("label");
        label.classList.add("vtLabelObra");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(item.concluida);
        checkbox.addEventListener("change", () => {
          alternarItemConcluido(item, checkbox.checked);
        });

        const texto = document.createElement("span");
        texto.textContent = `${ordem}. ${titulo}${detalhe} — ${tipoItem}`;

        label.appendChild(checkbox);
        label.appendChild(texto);
        elemento.appendChild(label);
      } else {
        const prefixo = item.concluida ? "✓ " : "";
        elemento.textContent = `${prefixo}${ordem}. ${titulo}${detalhe} — ${tipoItem}`;
      }

      vtListaObras.appendChild(elemento);
    });
  }

  function renderizarBotaoAcao() {
    vtAreaAcao.innerHTML = "";

    if (!vinculoAtual?.status || vinculoAtual.status === "concluída") {
      return;
    }

    const botaoAcao = document.createElement("button");
    botaoAcao.type = "button";
    botaoAcao.classList.add("lmBotaoSaibaMais");

    if (vinculoAtual.status === "para ler") {
      botaoAcao.textContent = "Iniciar";
      botaoAcao.addEventListener("click", () => atualizarStatusTrilha("em andamento"));
    } else if (vinculoAtual.status === "em andamento") {
      botaoAcao.textContent = "Pausar";
      botaoAcao.addEventListener("click", () => atualizarStatusTrilha("pausada"));
    } else if (vinculoAtual.status === "pausada") {
      botaoAcao.textContent = "Continuar";
      botaoAcao.addEventListener("click", () => atualizarStatusTrilha("em andamento"));
    }

    vtAreaAcao.appendChild(botaoAcao);
  }

  async function atualizarStatusTrilha(novoStatus) {
    const statusAnterior = vinculoAtual?.status;

    try {
      const resposta = await fetch(
        `/usuarios/${usuario.id}/trilhas/${trilhaId}`,
        {
          method: "PUT",
          headers: obterHeadersJson(),
          body: JSON.stringify({ status: novoStatus }),
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || "Não foi possível salvar a alteração. Tente novamente.");
      }

      vinculoAtual = {
        ...vinculoAtual,
        ...dados.vinculo,
        trilhaId: dados.vinculo?.trilhaId || vinculoAtual?.trilhaId,
      };

      const retomando = novoStatus === "em andamento" && statusAnterior === "pausada";

      renderizarTrilha();
      renderizarBotaoAcao();
      renderizarItens();

      abrirModalMensagem({
        titulo: retomando ? "Trilha retomada" : "Trilha atualizada",
        mensagem: retomando
          ? "Trilha retomada com sucesso."
          : mensagemAmigavelStatus(novoStatus),
      });
    } catch (erro) {
      console.error("Erro ao atualizar trilha:", erro);
      abrirModalMensagem({
        titulo: "Atenção",
        mensagem: erro.message || "Não foi possível iniciar a trilha agora. Tente novamente.",
      });
    }
  }

  function renderizarTrilha() {
    const trilha = trilhaDetalhes || obterTrilhaDoVinculo(vinculoAtual);

    vtTituloTrilha.textContent = trilha?.tema || "Tema não informado";

    const nivelFormatado = formatarNivel(trilha?.nivelDificuldade);
    vtNivelTrilha.textContent = nivelFormatado
      ? `Dificuldade: ${nivelFormatado}`
      : "";
    vtNivelTrilha.style.display = nivelFormatado ? "block" : "none";

    if (trilha?.xp || trilha?.xp === 0) {
      vtXpTrilha.textContent = `XP: ${trilha.xp}`;
      vtXpTrilha.style.display = "block";
    } else {
      vtXpTrilha.style.display = "none";
    }

    if (vinculoAtual?.status) {
      vtStatusTrilha.textContent = `Status: ${formatarStatus(vinculoAtual.status)}`;
      vtStatusTrilha.style.display = "block";
    } else {
      vtStatusTrilha.textContent = "Salve esta trilha para acompanhar seu progresso.";
      vtStatusTrilha.style.display = "block";
    }

    if (trilha?.descricao) {
      vtDescricaoTrilha.textContent = trilha.descricao;
      vtAreaDescricao.style.display = "flex";
    } else {
      vtAreaDescricao.style.display = "none";
    }
  }

  async function carregarTrilha() {
    const respostaVinculo = await fetch(
      `/usuarios/${usuario.id}/trilhas/${trilhaId}`,
      { headers: obterHeadersJson() },
    );

    if (respostaVinculo.ok) {
      const dadosVinculo = await respostaVinculo.json();
      vinculoAtual = dadosVinculo.trilha;
      trilhaDetalhes = obterTrilhaDoVinculo(vinculoAtual);
      itensAtuais = dadosVinculo.itens || dadosVinculo.obras || [];
      progressoAtual = dadosVinculo.progresso || progressoAtual;
    } else {
      const respostaTrilha = await fetch(`/trilhas/${trilhaId}`);
      const dadosTrilha = await respostaTrilha.json();

      if (!respostaTrilha.ok) {
        throw new Error(dadosTrilha.error || "Não encontramos os dados dessa trilha.");
      }

      vinculoAtual = null;
      trilhaDetalhes = dadosTrilha;
      itensAtuais = dadosTrilha.itens || dadosTrilha.obras || [];
      progressoAtual = { concluidas: 0, total: itensAtuais.length, percentual: 0 };
    }

    renderizarTrilha();
    renderizarProgresso(progressoAtual);
    renderizarItens();
    renderizarBotaoAcao();
  }

  function configurarVoltar() {
    const botaoVoltar = document.getElementById("vtBotaoVoltar");

    if (botaoVoltar) {
      botaoVoltar.addEventListener("click", () => {
        if (window.history.length > 1) {
          voltarPaginaAnterior();
          return;
        }

        window.location.href = "/pages/trilhas/catalogo.html";
      });
    }
  }

  try {
    configurarModalMensagem();
    configurarVoltar();
    await carregarTrilha();
  } catch (erro) {
    console.error("Erro ao carregar trilha:", erro);
    abrirModalMensagem({
      titulo: "Atenção",
      mensagem: erro.message || "Não encontramos os dados dessa trilha.",
      aoFechar: () => {
        const usuarioLogado = obterUsuarioLogado();
        window.location.href =
          usuarioLogado?.tipo === "administrador"
            ? "catalogo.html"
            : "salvas.html";
      },
    });
  }
});
