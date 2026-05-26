document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  let livrosSalvos = [];
  let livroSelecionadoParaPaginas = null;
  let statusAtual = "todos";

  if (!token || !usuario) {
    alert("Faça login novamente.");
    window.location.href = "loginLeitor.html";
    return;
  }

  const API_LIVROS_SALVOS = `/usuarios/${usuario.id}/livros`;

  function obterHeadersJson() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  }

  function obterVinculo(item) {
    return item.UsuarioLivro || item.usuarioLivro || item;
  }

  function obterStatus(item) {
    return obterVinculo(item).status;
  }

  function resolverUrlImagem(caminhoImagem) {
    const caminho = String(caminhoImagem || "").trim();

    if (!caminho || caminho === "null" || caminho === "undefined") {
      return "/assets/capaPadrao.jpg";
    }

    return caminho;
  }

  function formatarStatus(status) {
    const statusFormatado = {
      "para ler": "Para ler",
      "lendo": "Lendo",
      "lido": "Lido"
    };

    return statusFormatado[status] || "Sem status";
  }

  function obterNomeAutor(livro) {
    if (livro.nomeAutor) return livro.nomeAutor;

    if (Array.isArray(livro.autores) && livro.autores.length > 0) {
      return livro.autores
        .map((autor) => autor.nome || autor.nomeAutor)
        .filter(Boolean)
        .join(", ");
    }

    return "Autor não informado";
  }

  function formatarAvaliacao(nota) {
    const notaNumerica = Number(nota);

    if (!nota && nota !== 0) {
      return "Sem avaliação";
    }

    if (Number.isNaN(notaNumerica)) {
      return "Sem avaliação";
    }

    const estrelas = Math.max(0, Math.min(5, Math.round(notaNumerica)));
    return "★".repeat(estrelas) + "☆".repeat(5 - estrelas);
  }

  function abrirModalLivroSalvo(livro) {
    const vinculo = obterVinculo(livro);
    const status = obterStatus(livro);

    document.getElementById("lsModalLivroTitulo").textContent =
      livro.titulo || "Título não informado";

    document.getElementById("lsModalLivroAutor").textContent =
      obterNomeAutor(livro);

    document.getElementById("lsModalLivroGenero").textContent =
      livro.genero || "Gênero não informado";

    document.getElementById("lsModalLivroEditora").textContent =
      livro.editora || "Editora não informada";

    document.getElementById("lsModalLivroPaginas").textContent =
      livro.paginas ? `${livro.paginas} páginas` : "Não informado";

    document.getElementById("lsModalLivroAvaliacaoGeral").textContent =
      formatarAvaliacao(livro.mediaNota);

    document.getElementById("lsModalLivroDescricao").textContent =
      livro.descricao || "Descrição não informada.";

    const areaMinhaAvaliacao = document.getElementById("lsAreaMinhaAvaliacao");
    const minhaAvaliacao = document.getElementById("lsModalMinhaAvaliacao");

    minhaAvaliacao.innerHTML = "";

    if (status === "lido") {
      areaMinhaAvaliacao.style.display = "flex";

      for (let nota = 1; nota <= 5; nota++) {
        const estrela = document.createElement("button");
        estrela.type = "button";
        estrela.classList.add("lsBotaoEstrela");
        estrela.textContent = nota <= Number(vinculo.nota || 0) ? "★" : "☆";

        estrela.addEventListener("click", async () => {
          await atualizarLivroSalvo(livro.id, { nota });
          await carregarLivrosSalvos();

          const livroAtualizado = livrosSalvos.find((item) => Number(item.id) === Number(livro.id));

          if (livroAtualizado) {
            abrirModalLivroSalvo(livroAtualizado);
          }
        });

        minhaAvaliacao.appendChild(estrela);
      }
    } else {
      areaMinhaAvaliacao.style.display = "none";
    }

    document
      .getElementById("lsModalLivroOverlay")
      .classList.add("lmModalOverlayAtivo");
  }

  function abrirModalPaginas(livro) {
    livroSelecionadoParaPaginas = livro;

    const vinculo = obterVinculo(livro);
    document.getElementById("lsInputPaginasLidas").value =
      vinculo.paginasLidas || 0;

    document
      .getElementById("lsModalPaginasOverlay")
      .classList.add("lmModalOverlayAtivo");
  }

  async function atualizarLivroSalvo(livroId, dadosAtualizacao) {
    try {
        const resposta = await fetch(`/usuarios/${usuario.id}/livros/${livroId}`, {
        method: "PUT",
        headers: obterHeadersJson(),
        body: JSON.stringify(dadosAtualizacao)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
        throw new Error(dados.error || "Erro ao atualizar livro salvo.");
        }

        await carregarLivrosSalvos();
    } catch (erro) {
        console.error("Erro ao atualizar livro salvo:", erro);
        alert(erro.message || "Erro ao atualizar livro salvo.");
    }
    }

    async function excluirLivroSalvo(livroId) {
    const confirmar = confirm("Deseja remover este livro dos seus salvos?");

    if (!confirmar) return;

    try {
        const resposta = await fetch(`/usuarios/${usuario.id}/livros/${livroId}`, {
        method: "DELETE",
        headers: obterHeadersJson()
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
        throw new Error(dados.error || "Erro ao remover livro salvo.");
        }

        await carregarLivrosSalvos();
    } catch (erro) {
        console.error("Erro ao remover livro salvo:", erro);
        alert(erro.message || "Erro ao remover livro salvo.");
    }
    }

  function criarCardLivroSalvo(livro) {
    const card = document.createElement("article");
    card.classList.add("blCardLivroSalvo");

    const imagem = document.createElement("img");
    imagem.src = resolverUrlImagem(livro.imagemCapa);
    imagem.alt = livro.titulo || "Capa do livro";
    imagem.onerror = function () {
      imagem.src = "/assets/capaPadrao.jpg";
    };

    const titulo = document.createElement("h4");
    titulo.textContent = livro.titulo || "Título não informado";

    const labelStatus = document.createElement("span");
    labelStatus.classList.add("blLabelStatusLivro");
    labelStatus.textContent = formatarStatus(obterStatus(livro));

    const botaoSaibaMais = document.createElement("button");
    botaoSaibaMais.classList.add("lmBotaoSaibaMais");
    botaoSaibaMais.type = "button";
    botaoSaibaMais.textContent = "Saiba Mais";
    botaoSaibaMais.addEventListener("click", () => {
      abrirModalLivroSalvo(livro);
    });

    const menuAcoes = document.createElement("button");
    menuAcoes.classList.add("blBotaoMenuLivroSalvo");
    menuAcoes.type = "button";
    menuAcoes.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>';

    const popoverAcoes = document.createElement("div");
    popoverAcoes.classList.add("blPopoverLivroSalvo");

    const botaoAlterarStatus = document.createElement("button");
    botaoAlterarStatus.type = "button";
    botaoAlterarStatus.textContent = "Alterar status";

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.textContent = "Excluir livro";

    popoverAcoes.appendChild(botaoAlterarStatus);

    if (obterStatus(livro) === "lendo") {
    const botaoEditarPaginas = document.createElement("button");
    botaoEditarPaginas.type = "button";
    botaoEditarPaginas.textContent = "Alterar páginas lidas";

    botaoEditarPaginas.addEventListener("click", () => {
      abrirModalPaginas(livro);
    });

    popoverAcoes.appendChild(botaoEditarPaginas);
    }

    popoverAcoes.appendChild(botaoExcluir);

    menuAcoes.addEventListener("click", (evento) => {
    evento.stopPropagation();

    document.querySelectorAll(".blPopoverLivroSalvo.ativo").forEach((popover) => {
        if (popover !== popoverAcoes) {
        popover.classList.remove("ativo");
        }
    });

    popoverAcoes.classList.toggle("ativo");
    });

    botaoAlterarStatus.addEventListener("click", () => {
    const novoStatus = prompt("Digite o novo status: para ler, lendo ou lido");

    if (!novoStatus) return;

    atualizarLivroSalvo(livro.id, {
        status: novoStatus.trim().toLowerCase()
    });
    });

    botaoExcluir.addEventListener("click", () => {
    excluirLivroSalvo(livro.id);
    });

    const areaBotoes = document.createElement("div");
    areaBotoes.classList.add("blAreaBotoesLivroSalvo");

    areaBotoes.appendChild(botaoSaibaMais);
    areaBotoes.appendChild(menuAcoes);

    card.appendChild(labelStatus);
    card.appendChild(popoverAcoes);
    card.appendChild(imagem);
    card.appendChild(titulo);
    card.appendChild(areaBotoes);
        return card;
    }

  function renderizarLivrosSalvos() {
    const grade = document.getElementById("blGradeLivrosSalvos");
    grade.innerHTML = "";

    const livrosFiltrados =
      statusAtual === "todos"
        ? livrosSalvos
        : livrosSalvos.filter((livro) => obterStatus(livro) === statusAtual);

    if (livrosFiltrados.length === 0) {
      const mensagem = document.createElement("p");
      mensagem.classList.add("blMensagemEstado");
      mensagem.textContent = "Nenhum livro salvo nesta categoria.";
      grade.appendChild(mensagem);
      return;
    }

    livrosFiltrados.forEach((livro) => {
      grade.appendChild(criarCardLivroSalvo(livro));
    });
  }

  async function carregarLivrosSalvos() {
    const resposta = await fetch(API_LIVROS_SALVOS, {
      headers: obterHeadersJson()
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Erro ao carregar livros salvos.");
    }

    livrosSalvos = dados.livros || [];
    renderizarLivrosSalvos();
  }

  function configurarFiltros() {
    const botoes = document.querySelectorAll(".blFiltroLivro");

    botoes.forEach((botao) => {
      botao.addEventListener("click", () => {
        botoes.forEach((item) => item.classList.remove("ativo"));
        botao.classList.add("ativo");

        statusAtual = botao.dataset.status;
        renderizarLivrosSalvos();
      });
    });
  }

  function configurarVoltar() {
    const botaoVoltar = document.getElementById("lmBotaoVoltarPerfil");

    if (botaoVoltar) {
      botaoVoltar.addEventListener("click", () => {
        window.location.href = "perfilLeitor.html";
      });
    }
  }

  document.addEventListener("click", () => {
    document.querySelectorAll(".blPopoverLivroSalvo.ativo").forEach((popover) => {
        popover.classList.remove("ativo");
    });
  });

  document.getElementById("lsModalLivroFechar").addEventListener("click", () => {
    document
      .getElementById("lsModalLivroOverlay")
      .classList.remove("lmModalOverlayAtivo");
  });

  document.getElementById("lsModalPaginasFechar").addEventListener("click", () => {
    document
      .getElementById("lsModalPaginasOverlay")
      .classList.remove("lmModalOverlayAtivo");
  });

  document.getElementById("lsSalvarPaginasLidas").addEventListener("click", async () => {
    if (!livroSelecionadoParaPaginas) return;

    const paginasLidas = Number(document.getElementById("lsInputPaginasLidas").value);

    if (Number.isNaN(paginasLidas) || paginasLidas < 0) {
      alert("Informe uma quantidade válida de páginas.");
      return;
    }

    await atualizarLivroSalvo(livroSelecionadoParaPaginas.id, {
      paginasLidas
    });

    document
      .getElementById("lsModalPaginasOverlay")
      .classList.remove("lmModalOverlayAtivo");

    livroSelecionadoParaPaginas = null;
  });

  try {
    configurarFiltros();
    configurarVoltar();
    await carregarLivrosSalvos();
  } catch (erro) {
    console.error("Erro na tela de livros salvos:", erro);
    alert(erro.message || "Erro ao carregar livros salvos.");
  }
});