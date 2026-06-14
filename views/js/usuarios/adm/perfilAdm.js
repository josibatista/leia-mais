// O que já vem de rota real (ver funções abaixo):
//   - Usuários - GET /usuarios
//   - Livros - GET /livros
//   - Trilhas - GET /trilhas
//   - Atividades recentes (novos cadastros) - GET /usuarios (dataCriacao/tipo) [incompleto]
//
// O que AINDA é mockado (sem rota pronta no backend):
//   - Leituras (livros lidos + itens de trilha concluídos de TODOS os
//     usuários): não há rota de agregação global. Ver calcularLeituras().
//   - Métricas (mini gráficos): não há rota de estatísticas. Ver
//     carregarMetricas().
//   - Atividades de "atualização feita por administrador": não há
//     updatedAt/auditoria no backend. Ver carregarAtividades().

const PERFIL_ADM_MOCK = {
  perfil: {
    nome: "Administrador Leia+",
    email: "admin@leiamais.com",
  },
  leituras: 0,
  atividades: [
    { icone: "fa-user-plus", texto: "Novo usuário cadastrado", detalhe: "recentemente" },
    { icone: "fa-book", texto: "Livro aprovado no acervo", detalhe: "recentemente" },
    { icone: "fa-user-shield", texto: "Novo administrador", detalhe: "recentemente" },
    { icone: "fa-route", texto: "Trilha atualizada", detalhe: "recentemente" },
  ],
  metricas: {
    // Mini gráfico de barras
    barras: [
      { rotulo: "Seg", valor: 40 },
      { rotulo: "Ter", valor: 65 },
      { rotulo: "Qua", valor: 50 },
      { rotulo: "Qui", valor: 80 },
      { rotulo: "Sex", valor: 60 },
    ],
    // Mini gráfico redondo
    donut: { leitores: 70, administradores: 30 },
  },
};

document.addEventListener("DOMContentLoaded", async () => {
  if (!protegerRotaAdmin()) {
    return;
  }

  const token = obterToken();
  let usuario = obterUsuarioLogado() || {};

  let listaUsuarios = null;

  function obterHeadersAuth() {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function extrairLista(dados) {
    if (Array.isArray(dados)) {
      return dados;
    }
    const lista =
      dados?.usuarios || dados?.livros || dados?.trilhas || dados?.dados;
    return Array.isArray(lista) ? lista : [];
  }

  async function buscarLista(url) {
    const resposta = await fetch(url, { headers: obterHeadersAuth() });

    if (!resposta.ok) {
      throw new Error(`Falha ao consultar ${url}`);
    }

    return extrairLista(await resposta.json());
  }

  function preencherIdentificacao() {
    const nome = usuario.nome || PERFIL_ADM_MOCK.perfil.nome;
    const email = usuario.email || PERFIL_ADM_MOCK.perfil.email;
    const letra = nome ? nome.trim().charAt(0).toUpperCase() : "?";

    document.getElementById("blLetraPerfil").textContent = letra;
    document.getElementById("blNomePerfil").textContent = nome;
    document.getElementById("blEmailPerfil").textContent = email;
  }

  async function carregarPerfilAdmin() {
    preencherIdentificacao();

    if (!usuario.id) {
      return;
    }

    try {
      const resposta = await fetch(`/usuarios/${usuario.id}`, {
        headers: obterHeadersAuth(),
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível atualizar o perfil.");
      }

      const dados = await resposta.json();
      usuario = dados;
      salvarUsuarioNaSessao(dados);
      preencherIdentificacao();
    } catch (erro) {
      console.warn("Perfil admin: usando dados locais como fallback.", erro);
    }
  }

  async function calcularLeituras() {
    // Estrutura pronta para integração:
    //
    //   const dados = await buscarLista("/leituras"); // rota futura
    //   const livrosLidos = dados.livrosLidos;        // status === "lido"
    //   const itensTrilhaConcluidos = dados.itensConcluidos; // item.concluida
    //   return livrosLidos + itensTrilhaConcluidos;
    return PERFIL_ADM_MOCK.leituras;
  }

  async function carregarIndicadores() {
    let qtdUsuarios = 0;
    let qtdLivros = 0;
    let qtdTrilhas = 0;

    try {
      listaUsuarios = await buscarLista("/usuarios");
      qtdUsuarios = listaUsuarios.length;
    } catch (erro) {
      console.warn("Indicador 'usuários' usando fallback local (0).", erro);
    }

    try {
      qtdLivros = (await buscarLista("/livros")).length;
    } catch (erro) {
      console.warn("Indicador 'livros' usando fallback local (0).", erro);
    }

    try {
      qtdTrilhas = (await buscarLista("/trilhas")).length;
    } catch (erro) {
      console.warn("Indicador 'trilhas' usando fallback local (0).", erro);
    }

    let leituras = PERFIL_ADM_MOCK.leituras;
    try {
      leituras = await calcularLeituras();
    } catch (erro) {
      console.warn("Indicador 'leituras' usando fallback mock.", erro);
    }

    document.getElementById("blQtdUsuarios").textContent = qtdUsuarios;
    document.getElementById("blQtdLivros").textContent = qtdLivros;
    document.getElementById("blQtdTrilhas").textContent = qtdTrilhas;
    document.getElementById("blQtdLeituras").textContent = leituras;
  }

  function tempoRelativo(data) {
    const quando = new Date(data);
    if (isNaN(quando.getTime())) {
      return "recentemente";
    }

    const diffMs = Date.now() - quando.getTime();
    const dia = 1000 * 60 * 60 * 24;
    const dias = Math.floor(diffMs / dia);

    if (dias <= 0) return "hoje";
    if (dias === 1) return "ontem";
    if (dias < 30) return `há ${dias} dias`;

    const meses = Math.floor(dias / 30);
    return meses === 1 ? "há 1 mês" : `há ${meses} meses`;
  }

  function montarAtividadesReais(usuarios) {
    return [...usuarios]
      .filter((u) => u.dataCriacao)
      .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
      .slice(0, 5)
      .map((u) => {
        const ehAdmin = u.tipo === "administrador";
        return {
          icone: ehAdmin ? "fa-user-shield" : "fa-user-plus",
          texto: ehAdmin ? "Novo administrador" : "Novo usuário",
          detalhe: `${u.nome || u.username || "Usuário"} · ${tempoRelativo(u.dataCriacao)}`,
        };
      });
  }

  function renderizarAtividades(atividades) {
    const lista = document.getElementById("blAtividades");
    lista.innerHTML = "";

    if (!atividades.length) {
      const item = document.createElement("li");
      item.className = "blAtividadeItem blAtividadeVazia";
      item.textContent = "Nenhuma atividade recente.";
      lista.appendChild(item);
      return;
    }

    atividades.forEach((atividade) => {
      const item = document.createElement("li");
      item.className = "blAtividadeItem";
      item.innerHTML = `
        <span class="blAtividadeBolinha"><i class="fa-solid ${atividade.icone}"></i></span>
        <span class="blAtividadeTexto">
          <strong>${atividade.texto}</strong>
          <small>${atividade.detalhe || ""}</small>
        </span>
      `;
      lista.appendChild(item);
    });
  }

  async function carregarAtividades() {
    try {
      const usuarios = listaUsuarios || (await buscarLista("/usuarios"));
      const atividades = montarAtividadesReais(usuarios);
      renderizarAtividades(atividades.length ? atividades : PERFIL_ADM_MOCK.atividades);
    } catch (erro) {
      console.warn("Atividades recentes usando fallback mock.", erro);
      renderizarAtividades(PERFIL_ADM_MOCK.atividades);
    }
  }

  function renderizarMiniBarras(barras) {
    const container = document.getElementById("blMiniBarras");
    container.innerHTML = "";

    const maior = Math.max(...barras.map((b) => b.valor), 1);

    barras.forEach((barra) => {
      const coluna = document.createElement("div");
      coluna.className = "blMiniBarraColuna";

      const valor = document.createElement("div");
      valor.className = "blMiniBarra";
      valor.style.height = `${Math.round((barra.valor / maior) * 100)}%`;

      const rotulo = document.createElement("span");
      rotulo.className = "blMiniBarraRotulo";
      rotulo.textContent = barra.rotulo;

      coluna.appendChild(valor);
      coluna.appendChild(rotulo);
      container.appendChild(coluna);
    });
  }

  function renderizarDonut(donut) {
    const elementoDonut = document.getElementById("blDonut");
    const legenda = document.getElementById("blDonutLegenda");

    const total = (donut.leitores || 0) + (donut.administradores || 0) || 1;
    const percLeitores = Math.round((donut.leitores / total) * 100);

    elementoDonut.style.background = `conic-gradient(
      var(--corDestaque) 0% ${percLeitores}%,
      var(--corSecundaria) ${percLeitores}% 100%
    )`;

    legenda.innerHTML = `
      <span class="blDonutItem"><i class="blDonutCor blDonutCorLeitores"></i> Leitores ${percLeitores}%</span>
      <span class="blDonutItem"><i class="blDonutCor blDonutCorAdmins"></i> Admins ${100 - percLeitores}%</span>
    `;
  }

  function carregarMetricas() {
    renderizarMiniBarras(PERFIL_ADM_MOCK.metricas.barras);
    renderizarDonut(PERFIL_ADM_MOCK.metricas.donut);
  }

  function configurarEngrenagem() {
    const botao = document.getElementById("blBotaoConfiguracoes");
    if (botao) {
      botao.addEventListener("click", () => {
        window.location.href = "/pages/usuarios/configuracoes.html";
      });
    }
  }

  function configurarNavegacaoSimples(seletor) {
    document.querySelectorAll(seletor).forEach((elemento) => {
      elemento.addEventListener("click", () => {
        const rota = elemento.dataset.rota;
        if (rota) {
          window.location.href = rota;
        }
      });
    });
  }

  function configurarAcoesRapidas() {
    document.querySelectorAll(".blBotaoAcaoRapida").forEach((botao) => {
      botao.addEventListener("click", () => {
        const rota = botao.dataset.rota;

        if (!rota || botao.dataset.indisponivel === "true") {
          exibirAlertaAcesso("Esta funcionalidade ainda não está disponível.", {
            titulo: "Em breve",
          });
          return;
        }

        window.location.href = rota;
      });
    });
  }

  try {
    await carregarPerfilAdmin();
    await carregarIndicadores();
    await carregarAtividades();
    carregarMetricas();
    configurarEngrenagem();
    configurarAcoesRapidas();
    configurarNavegacaoSimples(".blBotaoVisaoGeral");
    configurarNavegacaoSimples("#blChevronMetricas");
  } catch (erro) {
    console.error("Erro ao carregar o perfil do administrador:", erro);
    exibirAlertaAcesso(erro.message || "Não foi possível carregar o perfil.", {
      titulo: "Atenção",
    });
  }
});
