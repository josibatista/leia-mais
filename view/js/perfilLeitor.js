document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  let usuario = JSON.parse(localStorage.getItem("usuario"));

  const API_LIVROS_SALVOS = `/usuarios/${usuario.id}/livros`;

  let livrosSalvos = [];
  let statusAtual = "todos";

  if (!token || !usuario) {
    alert("Faça login novamente.");
    window.location.href = "loginLeitor.html";
    return;
  }

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

  function calcularDiasLeitura() {
    const datas = livrosSalvos
      .map((item) => item.updatedAt || item.dataAtualizacao || item.createdAt)
      .filter(Boolean)
      .map((data) => new Date(data).toISOString().split("T")[0]);

    return new Set(datas).size;
  }

  function preencherEstatisticas() {
    const livrosLidos = livrosSalvos.filter((item) => obterStatus(item) === "lido");

    const qtdLivrosLidos = livrosLidos.length;

    const qtdPaginasLidas = livrosSalvos.reduce((total, item) => {
      return total + obterPaginasLidas(item);
    }, 0);

    document.getElementById("blQtdLivrosLidos").textContent = qtdLivrosLidos;
    document.getElementById("blQtdDiasLeitura").textContent = calcularDiasLeitura();
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

  function renderizarLivros() {
    const carrossel = document.querySelector(".blCarrosselLivros");
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

    localStorage.setItem("usuario", JSON.stringify(dados));
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

    preencherEstatisticas();
    renderizarLivros();
  }

  function configurarFiltros() {
    const botoesFiltro = document.querySelectorAll(".blFiltroLivro");

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
        window.location.href = "livrosSalvos.html";
      });
    }
  }

  function configurarLogout() {
    const botaoSair = document.querySelector(".blBotaoSair");

    if (botaoSair) {
      botaoSair.addEventListener("click", (evento) => {
        evento.preventDefault();

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        window.location.href = "loginLeitor.html";
      });
    }
  }

  try {
    await carregarUsuarioAtualizado();
    await carregarLivrosSalvos();

    configurarFiltros();
    configurarSetaLivros();
    configurarLogout();
  } catch (erro) {
    console.error("Erro no perfil:", erro);
    alert(erro.message || "Erro ao carregar perfil.");
  }
});