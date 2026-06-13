document.addEventListener("DOMContentLoaded", async () => {
    if (!protegerRotaLeitor()) {
      return;
    }
  
    const token = obterToken();
    const usuario = obterUsuarioLogado();
  
    let trilhasSalvas = [];
    let statusAtual = "todos";
  
    const API_TRILHAS_SALVAS = `/usuarios/${usuario.id}/trilhas`;
  
    function obterHeadersJson() {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
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
  
    function formatarNivel(nivel) {
      return tfFormatarNivelTrilha(nivel);
    }
  
    function formatarStatus(status) {
      const statusFormatado = {
        "para ler": "Para ler",
        pausada: "Pausada",
        "em andamento": "Em andamento",
        concluída: "Concluída",
      };

      return statusFormatado[status] || status || "Sem status";
    }

    function filtrarPorStatus(vinculo) {
      if (statusAtual === "todos") {
        return true;
      }

      return vinculo.status === statusAtual;
    }

    async function atualizarStatusTrilha(trilhaId, novoStatus) {
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
        throw new Error(dados.error || "Não foi possível atualizar a trilha.");
      }

      const indice = trilhasSalvas.findIndex((item) => obterIdTrilha(item) === String(trilhaId));

      if (indice !== -1) {
        trilhasSalvas[indice] = {
          ...trilhasSalvas[indice],
          ...dados.vinculo,
        };
      }

      renderizarTrilhasSalvas();
    }
  
    function abrirModalMensagem({ titulo = "Atenção", mensagem }) {
      const modal = document.getElementById("tsModalMensagem");
      const tituloModal = document.getElementById("tsModalMensagemTitulo");
      const textoModal = document.getElementById("tsModalMensagemTexto");
  
      tituloModal.textContent = titulo;
      textoModal.textContent = mensagem;
      modal.classList.add("lmModalOverlayAtivo");
    }
  
    function configurarModalMensagem() {
      const modal = document.getElementById("tsModalMensagem");
      const botaoFechar = document.getElementById("tsFecharModalMensagem");
      const botaoConfirmar = document.getElementById("tsBotaoConfirmarMensagem");
  
      botaoFechar.addEventListener("click", () => {
        modal.classList.remove("lmModalOverlayAtivo");
      });
  
      botaoConfirmar.addEventListener("click", () => {
        modal.classList.remove("lmModalOverlayAtivo");
      });
  
      modal.addEventListener("click", (evento) => {
        if (evento.target === modal) {
          modal.classList.remove("lmModalOverlayAtivo");
        }
      });
    }
  
    function criarCardTrilhaSalva(vinculo) {
      const trilha = obterTrilhaDoVinculo(vinculo);
      const trilhaId = obterIdTrilha(vinculo);
  
      const card = document.createElement("article");
      card.classList.add("blCardTrilhaSalva");

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
      info.classList.add("blCardTrilhaSalvaInfo");
  
      const labelStatus = document.createElement("span");
      labelStatus.classList.add("blLabelStatusTrilha");
      labelStatus.textContent = formatarStatus(vinculo.status);
  
      const titulo = document.createElement("h4");
      titulo.textContent = trilha?.tema || "Tema não informado";
  
      const detalhes = document.createElement("p");
      detalhes.classList.add("blCardTrilhaSalvaDetalhes");
  
      const partesDetalhes = [];
  
      if (trilha?.nivelDificuldade) {
        partesDetalhes.push(formatarNivel(trilha.nivelDificuldade));
      }
  
      if (trilha?.xp || trilha?.xp === 0) {
        partesDetalhes.push(`${trilha.xp} XP`);
      }
  
      detalhes.textContent = partesDetalhes.join(" • ") || "Detalhes não informados";
  
      const areaBotoes = document.createElement("div");
      areaBotoes.classList.add("blAreaBotoesTrilhaSalva");
  
      const botaoSaibaMais = document.createElement("button");
      botaoSaibaMais.classList.add("lmBotaoSaibaMais");
      botaoSaibaMais.type = "button";
      botaoSaibaMais.textContent = "Saiba Mais";
      botaoSaibaMais.addEventListener("click", () => {
        window.location.href = `visualizar.html?id=${trilhaId}`;
      });
  
      areaBotoes.appendChild(botaoSaibaMais);

      if (vinculo.status === "para ler") {
        const botaoIniciar = document.createElement("button");
        botaoIniciar.classList.add("lmBotaoSaibaMais");
        botaoIniciar.type = "button";
        botaoIniciar.textContent = "Iniciar";
        botaoIniciar.addEventListener("click", async () => {
          try {
            await atualizarStatusTrilha(trilhaId, "em andamento");
          } catch (erro) {
            abrirModalMensagem({
              titulo: "Atenção",
              mensagem: erro.message || "Não foi possível iniciar a trilha.",
            });
          }
        });
        areaBotoes.appendChild(botaoIniciar);
      } else if (vinculo.status === "em andamento") {
        const botaoPausar = document.createElement("button");
        botaoPausar.classList.add("lmBotaoSaibaMais");
        botaoPausar.type = "button";
        botaoPausar.textContent = "Pausar";
        botaoPausar.addEventListener("click", async () => {
          try {
            await atualizarStatusTrilha(trilhaId, "pausada");
          } catch (erro) {
            abrirModalMensagem({
              titulo: "Atenção",
              mensagem: erro.message || "Não foi possível pausar a trilha.",
            });
          }
        });
        areaBotoes.appendChild(botaoPausar);
      } else if (vinculo.status === "pausada") {
        const botaoContinuar = document.createElement("button");
        botaoContinuar.classList.add("lmBotaoSaibaMais");
        botaoContinuar.type = "button";
        botaoContinuar.textContent = "Continuar";
        botaoContinuar.addEventListener("click", async () => {
          try {
            await atualizarStatusTrilha(trilhaId, "em andamento");
          } catch (erro) {
            abrirModalMensagem({
              titulo: "Atenção",
              mensagem: erro.message || "Não foi possível continuar a trilha.",
            });
          }
        });
        areaBotoes.appendChild(botaoContinuar);
      }

      info.appendChild(labelStatus);
      info.appendChild(titulo);
      info.appendChild(detalhes);
      info.appendChild(areaBotoes);
  
      card.appendChild(imagem);
      card.appendChild(info);
  
      return card;
    }
  
    function renderizarTrilhasSalvas() {
      const grade = document.getElementById("blGradeTrilhasSalvas");
      grade.innerHTML = "";
  
      const trilhasFiltradas = trilhasSalvas.filter(filtrarPorStatus);
  
      if (trilhasFiltradas.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.classList.add("blMensagemEstado");
        mensagem.textContent = "Nenhuma trilha salva nesta categoria.";
        grade.appendChild(mensagem);
        return;
      }
  
      trilhasFiltradas.forEach((vinculo) => {
        grade.appendChild(criarCardTrilhaSalva(vinculo));
      });
    }
  
    async function carregarTrilhasSalvas() {
      const resposta = await fetch(API_TRILHAS_SALVAS, {
        headers: obterHeadersJson(),
      });
  
      const dados = await resposta.json();
  
      if (!resposta.ok) {
        throw new Error(dados.error || "Erro ao carregar trilhas salvas.");
      }
  
      trilhasSalvas = dados.trilhas || [];
      renderizarTrilhasSalvas();
    }
  
    function configurarFiltros() {
      const botoes = document.querySelectorAll(".blFiltroLivro");
  
      botoes.forEach((botao) => {
        botao.addEventListener("click", () => {
          botoes.forEach((item) => item.classList.remove("ativo"));
          botao.classList.add("ativo");
  
          statusAtual = botao.dataset.status;
          renderizarTrilhasSalvas();
        });
      });
    }
  
    function configurarVoltar() {
      const botaoVoltar = document.getElementById("lmBotaoVoltarPerfil");
  
      if (botaoVoltar) {
        botaoVoltar.addEventListener("click", voltarPaginaAnterior);
      }
    }
  
    try {
      configurarModalMensagem();
      configurarFiltros();
      configurarVoltar();
      await carregarTrilhasSalvas();
    } catch (erro) {
      console.error("Erro na tela de trilhas salvas:", erro);
      abrirModalMensagem({
        titulo: "Atenção",
        mensagem: erro.message || "Erro ao carregar trilhas salvas.",
      });
    }
  });  