document.addEventListener("DOMContentLoaded", async () => {
  if (!protegerRotaLeitor()) {
    return;
  }

  const token = obterToken();
  let usuario = obterUsuarioLogado();

  const API_LIVROS_SALVOS = `/usuarios/${usuario.id}/livros`;

  let livrosSalvos = [];
  let trilhasSalvas = [];
  let itensConcluidosTrilhas = [];
  let statusAtual = "todos";
  let statusTrilhaAtual = "todos";

  const API_TRILHAS_SALVAS = `/usuarios/${usuario.id}/trilhas`;

  function obterHeadersJson() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  }

  function preencherDadosUsuario() {
    document.getElementById("blNomePerfil").textContent = usuario.nome || "—";
    document.getElementById("blUsuarioPerfil").textContent = usuario.username || "—";

    const letra = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "?";
    document.getElementById("blLetraPerfil").textContent = letra;
  }

  function obterLivro(item) {
    return item.livro || item.Livro || item;
  }

  function obterVinculo(item) {
    return item.UsuarioLivro || item.usuarioLivro || item.livros_usuario || item;
  }

  function obterStatus(item) {
    return obterVinculo(item).status;
  }

  function obterPaginasLidas(item) {
    const livro = obterLivro(item);
    const vinculo = obterVinculo(item);
    const status = obterStatus(item);

    if (status === "lido") {
      return Number(livro.paginas || 0);
    }

    if (status === "lendo") {
      return Number(vinculo.paginasLidas || 0);
    }

    return 0;
  }

  function calcularXpTrilhasConcluidas() {
    const xpPorTrilha = new Map();

    trilhasSalvas.forEach((vinculo) => {
      if (vinculo.status !== "concluída") {
        return;
      }

      const trilha = obterTrilhaDoVinculo(vinculo);
      const trilhaId = obterIdTrilha(vinculo);
      const xp = Number(trilha?.xp ?? vinculo.xpGanho ?? 0) || 0;

      xpPorTrilha.set(trilhaId, xp);
    });

    let total = 0;
    xpPorTrilha.forEach((xp) => {
      total += xp;
    });

    return total;
  }

  function preencherEstatisticas() {
    const idsLivrosLidosSalvos = new Set(
      livrosSalvos
        .filter((item) => obterStatus(item) === "lido")
        .map((item) => String(obterLivro(item).id)),
    );

    let qtdLivrosLidos = idsLivrosLidosSalvos.size;

    itensConcluidosTrilhas.forEach((item) => {
      if (item.itemTipo === "livro") {
        const livroId = String(item.id);

        if (!idsLivrosLidosSalvos.has(livroId)) {
          idsLivrosLidosSalvos.add(livroId);
          qtdLivrosLidos += 1;
        }

        return;
      }

      qtdLivrosLidos += 1;
    });

    let qtdPaginasLidas = livrosSalvos.reduce((total, item) => {
      return total + obterPaginasLidas(item);
    }, 0);

    itensConcluidosTrilhas.forEach((item) => {
      if (item.itemTipo !== "livro") {
        return;
      }

      const livroId = String(item.id);
      const jaContadoEmSalvos = livrosSalvos.some((salvo) => {
        return String(obterLivro(salvo).id) === livroId && obterStatus(salvo) === "lido";
      });

      if (!jaContadoEmSalvos) {
        qtdPaginasLidas += Number(item.paginas || 0);
      }
    });

    document.getElementById("blQtdLivrosLidos").textContent = qtdLivrosLidos;
    document.getElementById("blQtdXp").textContent = calcularXpTrilhasConcluidas();
    document.getElementById("blQtdPaginasLidas").textContent = qtdPaginasLidas;
  }

  function resolverUrlImagem(caminhoImagem) {
  const caminho = String(caminhoImagem || "").trim();

  if (!caminho || caminho === "null" || caminho === "undefined") {
    return "/assets/capaPadrao.jpg";
  }

  return caminho;
}

  function criarCardLivro(item) {
    const livro = obterLivro(item);

    const card = document.createElement("article");
    card.classList.add("blCardLivroPerfil");

    const imagem = document.createElement("img");

    const caminhoImagem = livro.imagemCapa;

    imagem.src = resolverUrlImagem(caminhoImagem);
    imagem.alt = livro.titulo || "Capa do livro";

    imagem.onerror = function () {
      imagem.src = "/assets/capaPadrao.jpg";
    };

    const titulo = document.createElement("p");
    titulo.textContent = livro.titulo || "Título não informado";

    card.appendChild(imagem);
    card.appendChild(titulo);

    return card;
  }

  function obterTrilhaDoVinculo(vinculo) {
    const trilhaRef = vinculo.trilhaId;

    if (trilhaRef && typeof trilhaRef === "object") {
      return trilhaRef;
    }

    return null;
  }

  function obterIdTrilha(vinculo) {
    const trilha = obterTrilhaDoVinculo(vinculo);

    if (trilha) {
      return String(trilha._id || trilha.id);
    }

    return String(vinculo.trilhaId);
  }

  function formatarStatusTrilha(status) {
    const statusFormatado = {
      "para ler": "Para ler",
      pausada: "Pausada",
      "em andamento": "Em andamento",
      concluída: "Concluída",
    };

    return statusFormatado[status] || status || "Sem status";
  }

  function criarCardTrilha(vinculo) {
    const trilha = obterTrilhaDoVinculo(vinculo);
    const trilhaId = obterIdTrilha(vinculo);
    const percentual = vinculo.progresso?.percentual || 0;

    const card = document.createElement("article");
    card.classList.add("ppCardLeitura");

    if (vinculo.status === "pausada") {
      card.classList.add("blCardTrilhaPausada");
    }

    const imagem = document.createElement("img");
    imagem.src = tfResolverCapaTrilha(trilha?.imagemCapa);
    imagem.alt = trilha?.tema || "Capa da trilha";
    imagem.onerror = function () {
      imagem.src = "/assets/capaPadrao.jpg";
    };

    const info = document.createElement("div");
    info.classList.add("ppCardLeituraInfo");

    const titulo = document.createElement("h4");
    titulo.textContent = trilha?.tema || "Tema não informado";

    const labelStatus = document.createElement("span");
    labelStatus.classList.add("ppStatusTrilha");
    labelStatus.textContent = formatarStatusTrilha(vinculo.status);

    const detalhes = document.createElement("p");
    detalhes.classList.add("blCardTrilhaSalvaDetalhes");

    const partesDetalhes = [];

    if (trilha?.nivelDificuldade) {
      partesDetalhes.push(tfFormatarNivelTrilha(trilha.nivelDificuldade));
    }

    if (trilha?.xp || trilha?.xp === 0) {
      partesDetalhes.push(`${trilha.xp} XP`);
    }

    detalhes.textContent = partesDetalhes.join(" • ") || "Detalhes não informados";

    const barraContainer = document.createElement("div");
    barraContainer.classList.add("ppBarraProgresso");

    const barra = document.createElement("div");
    barra.style.width = `${percentual}%`;
    barraContainer.appendChild(barra);

    const progressoTexto = document.createElement("span");
    progressoTexto.textContent = `${percentual}%`;

    const botaoSaibaMais = document.createElement("button");
    botaoSaibaMais.classList.add("lmBotaoSaibaMais");
    botaoSaibaMais.type = "button";
    botaoSaibaMais.textContent = "Saiba Mais";
    botaoSaibaMais.addEventListener("click", () => {
      window.location.href = `/pages/trilhas/visualizar.html?id=${trilhaId}`;
    });

    info.appendChild(titulo);
    info.appendChild(labelStatus);
    info.appendChild(detalhes);
    info.appendChild(barraContainer);
    info.appendChild(progressoTexto);
    info.appendChild(botaoSaibaMais);

    card.appendChild(imagem);
    card.appendChild(info);

    return card;
  }

  function renderizarTrilhas() {
    const carrossel = document.getElementById("blCarrosselTrilhas");
    carrossel.innerHTML = "";

    const trilhasFiltradas =
      statusTrilhaAtual === "todos"
        ? trilhasSalvas
        : trilhasSalvas.filter((item) => item.status === statusTrilhaAtual);

    const preview = trilhasFiltradas.slice(0, 5);

    if (preview.length === 0) {
      const mensagem = document.createElement("p");
      mensagem.classList.add("blMensagemEstado");
      mensagem.textContent = "Nenhuma trilha encontrada nesta categoria.";
      carrossel.appendChild(mensagem);
      return;
    }

    preview.forEach((vinculo) => {
      carrossel.appendChild(criarCardTrilha(vinculo));
    });
  }

  async function carregarTrilhasSalvas() {
    const resposta = await fetch(API_TRILHAS_SALVAS, {
      headers: obterHeadersJson(),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Não foi possível carregar as trilhas.");
    }

    trilhasSalvas = Array.isArray(dados) ? dados : dados.trilhas || [];
    await carregarItensConcluidosTrilhas();
    renderizarTrilhas();
  }

  async function carregarItensConcluidosTrilhas() {
    if (!trilhasSalvas.length) {
      itensConcluidosTrilhas = [];
      return;
    }

    const detalhes = await Promise.all(
      trilhasSalvas.map(async (vinculo) => {
        const trilhaId = obterIdTrilha(vinculo);

        try {
          const resposta = await fetch(
            `/usuarios/${usuario.id}/trilhas/${trilhaId}`,
            { headers: obterHeadersJson() },
          );

          if (!resposta.ok) {
            return [];
          }

          const dados = await resposta.json();
          return (dados.itens || []).filter((item) => item.concluida);
        } catch (erro) {
          console.error("Erro ao carregar itens da trilha:", erro);
          return [];
        }
      }),
    );

    itensConcluidosTrilhas = detalhes.flat();
  }

  function configurarFiltrosTrilhas() {
    const botoesFiltro = document.querySelectorAll('#blMenuFiltrosTrilhas .blFiltroLivro');

    botoesFiltro.forEach((botao) => {
      botao.addEventListener("click", () => {
        botoesFiltro.forEach((item) => item.classList.remove("ativo"));

        botao.classList.add("ativo");
        statusTrilhaAtual = botao.dataset.status;

        renderizarTrilhas();
      });
    });
  }

  function configurarSetaTrilhas() {
    const botaoAbrirTrilhasSalvas = document.getElementById("blAbrirTrilhasSalvas");

    if (botaoAbrirTrilhasSalvas) {
      botaoAbrirTrilhasSalvas.addEventListener("click", () => {
        window.location.href = "/pages/trilhas/salvas.html";
      });
    }
  }

  function renderizarLivros() {
    const carrossel = document.getElementById("blCarrosselLivros");
    carrossel.innerHTML = "";

    const livrosFiltrados =
    statusAtual === "todos"
      ? livrosSalvos
      : livrosSalvos.filter((item) => obterStatus(item) === statusAtual);
    const preview = livrosFiltrados.slice(0, 5);

    if (preview.length === 0) {
      const mensagem = document.createElement("p");
      mensagem.classList.add("blMensagemEstado");
      mensagem.textContent = "Nenhum livro encontrado nesta categoria.";
      carrossel.appendChild(mensagem);
      return;
    }

    preview.forEach((item) => {
      carrossel.appendChild(criarCardLivro(item));
    });
  }

  async function carregarUsuarioAtualizado() {
    const resposta = await fetch(`/usuarios/${usuario.id}`, {
      headers: obterHeadersJson()
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Erro ao carregar usuário.");
    }

    salvarUsuarioNaSessao(dados);
    usuario = dados;

    preencherDadosUsuario();
  }

  async function carregarLivrosSalvos() {
    const resposta = await fetch(API_LIVROS_SALVOS, {
      headers: obterHeadersJson()
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Erro ao carregar livros salvos.");
    }

    livrosSalvos = Array.isArray(dados) ? dados : dados.livros || [];
    renderizarLivros();
  }

  function configurarFiltros() {
    const botoesFiltro = document.querySelectorAll(
      "#blMenuFiltrosLivros .blFiltroLivro",
    );

    botoesFiltro.forEach((botao) => {
      botao.addEventListener("click", () => {
        botoesFiltro.forEach((item) => item.classList.remove("ativo"));

        botao.classList.add("ativo");
        statusAtual = botao.dataset.status;

        renderizarLivros();
      });
    });
  }

  function configurarSetaLivros() {
    const botaoAbrirLivrosSalvos = document.getElementById("blAbrirLivrosSalvos");

    if (botaoAbrirLivrosSalvos) {
      botaoAbrirLivrosSalvos.addEventListener("click", () => {
        window.location.href = "/pages/livros/salvos.html";
      });
    }
  }

  try {
    await carregarUsuarioAtualizado();
    await carregarLivrosSalvos();
    await carregarTrilhasSalvas();
    preencherEstatisticas();

    configurarFiltros();
    configurarFiltrosTrilhas();
    configurarSetaLivros();
    configurarSetaTrilhas();
  } catch (erro) {
    console.error("Erro no perfil:", erro);
    exibirAlertaAcesso(erro.message || "Não foi possível carregar o perfil.", {
      titulo: "Atenção",
    });
  }
});