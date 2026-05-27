document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const ppBotaoAbrirBusca = document.getElementById("ppBotaoAbrirBusca");
  const ppBuscaHeader = document.getElementById("ppBuscaHeader");
  const ppCampoBusca = document.getElementById("ppCampoBusca");
  const ppLeiturasRecentes = document.getElementById("ppLeiturasRecentes");
  const ppAcervoLivros = document.getElementById("ppAcervoLivros");
  const ppAbrirAcervo = document.getElementById("ppAbrirAcervo");
  const ppAbrirLivrosSalvos = document.getElementById("ppAbrirLivrosSalvos");

  let livrosAcervo = [];

  if (!token || !usuario) {
    window.location.href = "loginLeitor.html";
    return;
  }

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
    botao.href = "livrosSalvos.html";
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
        window.location.href = "livrosSalvos.html";
    });

    ppAbrirAcervo.addEventListener("click", () => {
        window.location.href = "acervoLivros.html";
    });
  }

  try {
    configurarBusca();
    configurarNavegacao();

    await carregarLeiturasRecentes();
    await carregarAcervo();
  } catch (erro) {
    console.error("Erro na página principal:", erro);
  }
});