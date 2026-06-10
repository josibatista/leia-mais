document.addEventListener("DOMContentLoaded", async () => {
  if (!protegerRotaLeitor()) {
    return;
  }

  const token = obterToken();
  const usuario = obterUsuarioLogado();

  const ppBotaoAbrirBusca = document.getElementById("ppBotaoAbrirBusca");
  const ppBuscaHeader = document.getElementById("ppBuscaHeader");
  const ppCampoBusca = document.getElementById("ppCampoBusca");
  const ppTrilhasSalvas = document.getElementById("ppTrilhasSalvas");
  const ppLeiturasRecentes = document.getElementById("ppLeiturasRecentes");
  const ppAcervoLivros = document.getElementById("ppAcervoLivros");
  const ppAbrirAcervo = document.getElementById("ppAbrirAcervo");
  const ppAbrirLivrosSalvos = document.getElementById("ppAbrirLivrosSalvos");
  const ppAbrirTrilhasSalvas = document.getElementById("ppAbrirTrilhasSalvas");

  let livrosAcervo = [];

  function obterHeadersJson() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  }

  function resolverUrlImagem(caminhoImagem) {
    const caminho = String(caminhoImagem || "").trim();

    if (!caminho || caminho === "null" || caminho === "undefined") {
      return "/assets/capaPadrao.jpg";
    }

    return caminho;
  }

  function obterVinculo(item) {
    return item.UsuarioLivro || item.usuarioLivro || item;
  }

  function calcularProgressoLivro(livro) {
    const vinculo = obterVinculo(livro);
    const status = vinculo.status;
    const totalPaginas = Number(livro.paginas || 0);
    const paginasLidas = Number(vinculo.paginasLidas || 0);

    if (status === "lido") return 100;
    if (!totalPaginas) return 0;

    return Math.min(100, Math.round((paginasLidas / totalPaginas) * 100));
  }

  function criarCardLeitura(livro) {
    const progresso = calcularProgressoLivro(livro);

    const card = document.createElement("article");
    card.classList.add("ppCardLeitura");

    const imagem = document.createElement("img");
    imagem.src = resolverUrlImagem(livro.imagemCapa);
    imagem.alt = livro.titulo || "Capa do livro";
    imagem.onerror = () => {
      imagem.src = "/assets/capaPadrao.jpg";
    };

    const info = document.createElement("div");
    info.classList.add("ppCardLeituraInfo");

    const titulo = document.createElement("h4");
    titulo.textContent = livro.titulo || "Título não informado";

    const barraContainer = document.createElement("div");
    barraContainer.classList.add("ppBarraProgresso");

    const barra = document.createElement("div");
    barra.style.width = `${progresso}%`;

    barraContainer.appendChild(barra);

    const progressoTexto = document.createElement("span");
    progressoTexto.textContent = `${progresso}%`;

    const botao = document.createElement("a");
    botao.href = "/pages/livros/livrosSalvos.html";
    botao.classList.add("ppBotaoContinuar");
    botao.textContent = "Continuar";

    info.appendChild(titulo);
    info.appendChild(barraContainer);
    info.appendChild(progressoTexto);
    info.appendChild(botao);

    card.appendChild(imagem);
    card.appendChild(info);

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

  function formatarNivelTrilha(nivel) {
    return tfFormatarNivelTrilha(nivel);
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

  function criarCardTrilhaSalva(vinculo) {
    const trilha = obterTrilhaDoVinculo(vinculo);
    const trilhaId = obterIdTrilha(vinculo);
    const percentual = vinculo.progresso?.percentual || 0;

    const card = document.createElement("article");
    card.classList.add("ppCardLeitura");

    const imagem = document.createElement("img");
    imagem.src = trilha?.imagemCapa || "/assets/capaPadrao.jpg";
    imagem.alt = trilha?.tema || "Capa da trilha";
    imagem.onerror = () => {
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
      partesDetalhes.push(formatarNivelTrilha(trilha.nivelDificuldade));
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
      window.location.href = `/pages/trilhas/visualizarTrilha.html?id=${trilhaId}`;
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

  function renderizarTrilhasSalvas(trilhas) {
    ppTrilhasSalvas.innerHTML = "";

    if (!trilhas.length) {
      ppTrilhasSalvas.innerHTML =
        `<p class="ppMensagemVazia">Nenhuma trilha salva encontrada.</p>`;
      return;
    }

    trilhas.slice(0, 8).forEach((vinculo) => {
      ppTrilhasSalvas.appendChild(criarCardTrilhaSalva(vinculo));
    });
  }

  async function carregarTrilhasSalvas() {
    const resposta = await fetch(`/usuarios/${usuario.id}/trilhas`, {
      headers: obterHeadersJson(),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Erro ao carregar trilhas salvas.");
    }

    renderizarTrilhasSalvas(dados.trilhas || []);
  }

  function criarCardAcervo(livro) {
    const card = document.createElement("article");
    card.classList.add("ppCardAcervo");

    const imagem = document.createElement("img");
    imagem.src = resolverUrlImagem(livro.imagemCapa);
    imagem.alt = livro.titulo || "Capa do livro";
    imagem.onerror = () => {
      imagem.src = "/assets/capaPadrao.jpg";
    };

    const titulo = document.createElement("p");
    titulo.textContent = livro.titulo || "Título não informado";

    card.appendChild(imagem);
    card.appendChild(titulo);

    return card;
  }

  function renderizarLeiturasRecentes(livros) {
    ppLeiturasRecentes.innerHTML = "";

    if (!livros.length) {
      ppLeiturasRecentes.innerHTML = `<p class="ppMensagemVazia">Nenhuma leitura recente encontrada.</p>`;
      return;
    }

    livros.slice(0, 8).forEach((livro) => {
      ppLeiturasRecentes.appendChild(criarCardLeitura(livro));
    });
  }

  function renderizarAcervo(livros) {
    ppAcervoLivros.innerHTML = "";

    if (!livros.length) {
      ppAcervoLivros.innerHTML = `<p class="ppMensagemVazia">Nenhum livro encontrado.</p>`;
      return;
    }

    livros.slice(0, 12).forEach((livro) => {
      ppAcervoLivros.appendChild(criarCardAcervo(livro));
    });
  }

  async function carregarLeiturasRecentes() {
    const resposta = await fetch(`/usuarios/${usuario.id}/livros`, {
      headers: obterHeadersJson()
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Erro ao carregar leituras recentes.");
    }

    renderizarLeiturasRecentes(dados.livros || []);
  }

  async function carregarAcervo() {
    const resposta = await fetch("/livros");
    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Erro ao carregar acervo.");
    }

    livrosAcervo = dados || [];
    renderizarAcervo(livrosAcervo);
  }

  function configurarBusca() {
    ppBotaoAbrirBusca.addEventListener("click", () => {
      ppBuscaHeader.classList.toggle("ativo");

      if (ppBuscaHeader.classList.contains("ativo")) {
        ppCampoBusca.focus();
      }
    });

    ppCampoBusca.addEventListener("input", () => {
      const termo = ppCampoBusca.value.trim().toLowerCase();

      const filtrados = livrosAcervo.filter((livro) => {
        return String(livro.titulo || "").toLowerCase().includes(termo);
      });

      renderizarAcervo(filtrados);
    });
  }

  function configurarNavegacao() {
    ppAbrirLivrosSalvos.addEventListener("click", () => {
        window.location.href = "/pages/livros/livrosSalvos.html";
    });

    ppAbrirAcervo.addEventListener("click", () => {
        window.location.href = "/pages/livros/acervoLivros.html";
    });

    ppAbrirTrilhasSalvas.addEventListener("click", () => {
        window.location.href = "/pages/trilhas/trilhasSalvas.html";
    });
  }

  try {
    configurarBusca();
    configurarNavegacao();

    await carregarTrilhasSalvas();
    await carregarLeiturasRecentes();
    await carregarAcervo();
  } catch (erro) {
    console.error("Erro na página principal:", erro);
  }
});