// =====================================================================
// Dashboard / Relatórios do administrador
// ---------------------------------------------------------------------
// Todos os dados vêm de rotas REAIS já existentes no backend (protegidas
// por token + administrador). Nenhum dado é mockado nesta tela.
//
//   - GET /relatorio          → cards (numeroUsuarios, numeroLivros,
//                               numeroTrilhas, numeroItensConcluidos) e
//                               "Páginas lidas" (paginasLidas)
//   - GET /metricas           → donut "Leitores vs Admins"
//                               (distribuicaoUsuarios) e donut "Leitura
//                               por status" (distribuicaoStatusLeitura)
//   - GET /relatorio/dashboard → "Trilhas populares" (trilhasPopulares),
//                               "Gêneros populares" (generosPopulares) e
//                               "Maior abandono" (maiorAbandono)
//
// Exportação:
//   - CSV: gerado no front com os dados já carregados (o endpoint
//     GET /relatorio/csv cobre apenas os totais gerais; aqui montamos um
//     CSV tabular com todos os blocos do dashboard).
//   - PDF: capturado no front com html2canvas + jsPDF (sem backend).
// =====================================================================

// Paleta consistente com o projeto para fatias de donut.
const DB_PALETA = [
  "#c76d5e", // salmão (corDestaque)
  "#6b4f3a", // marrom claro (corSecundaria)
  "#3e2a1f", // marrom escuro (corPrimaria)
  "#d9a679", // bege/âmbar complementar
  "#9c7b5c", // marrom médio
];

const DB_ROTULOS_STATUS = {
  "lido": "Lido",
  "lendo": "Lendo",
  "para ler": "Para ler",
  "pausada": "Pausada",
  "pausado": "Pausado",
};

document.addEventListener("DOMContentLoaded", async () => {
  if (!protegerRotaAdmin()) {
    return;
  }

  const token = obterToken();

  // Estado com os dados carregados (reutilizado na exportação CSV).
  const estado = {
    relatorio: null,
    metricas: null,
    dashboard: null,
  };

  function obterHeadersAuth() {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function buscarJson(url) {
    const resposta = await fetch(url, { headers: obterHeadersAuth() });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      throw new Error(erro.error || `Falha ao consultar ${url}`);
    }

    return resposta.json();
  }

  function formatarNumero(valor) {
    const numero = Number(valor) || 0;
    return numero.toLocaleString("pt-BR");
  }

  // -------------------------------------------------------------------
  // Cards superiores + Páginas lidas (GET /relatorio)
  // Campo exibido: dados.paginasLidas (SUM de UsuarioLivro.paginasLidas).
  // Nota: o perfil do leitor usa outra regra (livro.paginas para status
  // "lido" + trilhas concluídas); divergências devem ser corrigidas no back.
  // -------------------------------------------------------------------
  async function carregarRelatorio() {
    try {
      const dados = await buscarJson("/relatorio");
      estado.relatorio = dados;

      document.getElementById("dbQtdUsuarios").textContent = formatarNumero(dados.numeroUsuarios);
      document.getElementById("dbQtdLivros").textContent = formatarNumero(dados.numeroLivros);
      document.getElementById("dbQtdTrilhas").textContent = formatarNumero(dados.numeroTrilhas);
      document.getElementById("dbQtdItens").textContent = formatarNumero(dados.numeroItensConcluidos);
      document.getElementById("dbPaginasLidas").textContent = formatarNumero(dados.paginasLidas);
    } catch (erro) {
      console.warn("Falha ao carregar /relatorio.", erro);
    }
  }

  // -------------------------------------------------------------------
  // Donut genérico (conic-gradient + legenda)
  // -------------------------------------------------------------------
  function renderizarDonut(idDonut, idLegenda, segmentos) {
    const elementoDonut = document.getElementById(idDonut);
    const legenda = document.getElementById(idLegenda);

    const total = segmentos.reduce((soma, s) => soma + (Number(s.valor) || 0), 0);

    if (!total) {
      elementoDonut.style.background = "var(--corFundoInput)";
      legenda.innerHTML = `<span class="blDonutItem">Sem dados.</span>`;
      return;
    }

    let acumulado = 0;
    const partesGradiente = [];
    const partesLegenda = [];

    segmentos.forEach((segmento, indice) => {
      const valor = Number(segmento.valor) || 0;
      if (valor <= 0) {
        return;
      }

      const cor = DB_PALETA[indice % DB_PALETA.length];
      const inicio = (acumulado / total) * 100;
      acumulado += valor;
      const fim = (acumulado / total) * 100;
      const percentual = Math.round((valor / total) * 100);

      partesGradiente.push(`${cor} ${inicio}% ${fim}%`);
      partesLegenda.push(`
        <span class="blDonutItem">
          <i class="blDonutCor" style="background-color:${cor}"></i>
          ${segmento.rotulo} ${percentual}%
        </span>
      `);
    });

    elementoDonut.style.background = `conic-gradient(${partesGradiente.join(", ")})`;
    legenda.innerHTML = partesLegenda.join("");
  }

  // -------------------------------------------------------------------
  // Donuts em SVG para exportação PDF (html2canvas não captura mask/conic-gradient)
  // -------------------------------------------------------------------
  function obterSegmentosComCores(segmentos) {
    const partes = [];

    segmentos.forEach((segmento, indice) => {
      const valor = Number(segmento.valor) || 0;
      if (valor <= 0) {
        return;
      }

      partes.push({
        valor,
        cor: DB_PALETA[indice % DB_PALETA.length],
      });
    });

    return partes;
  }

  function obterSegmentosExportacaoUsuarios() {
    if (!estado.metricas) {
      return [];
    }

    const usuarios = adaptarUsuarios(estado.metricas.distribuicaoUsuarios);
    return obterSegmentosComCores([
      { valor: usuarios.leitores },
      { valor: usuarios.administradores },
    ]);
  }

  function obterSegmentosExportacaoStatus() {
    if (!estado.metricas) {
      return [];
    }

    const status = adaptarStatusLeitura(estado.metricas.distribuicaoStatusLeitura);
    return obterSegmentosComCores(status);
  }

  function obterTamanhoDonutExportacao(elementoDonut) {
    return elementoDonut.closest(".dbDonutGrande") ? 130 : 110;
  }

  function criarSvgDonut(segmentos, tamanho) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", String(tamanho));
    svg.setAttribute("height", String(tamanho));
    svg.setAttribute("viewBox", `0 0 ${tamanho} ${tamanho}`);
    svg.setAttribute("class", "dbDonutSvgExportacao");
    svg.setAttribute("aria-hidden", "true");

    const total = segmentos.reduce((soma, segmento) => soma + segmento.valor, 0);
    if (!total) {
      return svg;
    }

    const strokeWidth = Math.round(tamanho * 0.22);
    const radius = (tamanho - strokeWidth) / 2;
    const cx = tamanho / 2;
    const cy = tamanho / 2;
    const circunferencia = 2 * Math.PI * radius;
    let offset = 0;

    segmentos.forEach((segmento) => {
      const comprimento = (segmento.valor / total) * circunferencia;
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", String(cx));
      circle.setAttribute("cy", String(cy));
      circle.setAttribute("r", String(radius));
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", segmento.cor);
      circle.setAttribute("stroke-width", String(strokeWidth));
      circle.setAttribute("stroke-dasharray", `${comprimento} ${circunferencia - comprimento}`);
      circle.setAttribute("stroke-dashoffset", String(-offset));
      circle.setAttribute("transform", `rotate(-90 ${cx} ${cy})`);
      svg.appendChild(circle);
      offset += comprimento;
    });

    return svg;
  }

  function prepararDonutsParaExportacao() {
    const configuracoes = [
      { id: "dbDonutUsuarios", segmentos: obterSegmentosExportacaoUsuarios() },
      { id: "dbDonutStatus", segmentos: obterSegmentosExportacaoStatus() },
    ];

    const backups = [];

    configuracoes.forEach(({ id, segmentos }) => {
      const elemento = document.getElementById(id);
      if (!elemento) {
        return;
      }

      const tamanho = obterTamanhoDonutExportacao(elemento);
      const svg = criarSvgDonut(segmentos, tamanho);

      backups.push({
        elemento,
        background: elemento.style.background,
        mask: elemento.style.mask,
        webkitMask: elemento.style.webkitMask || elemento.style.getPropertyValue("-webkit-mask"),
        svg,
      });

      elemento.style.background = "transparent";
      elemento.style.mask = "none";
      elemento.style.webkitMask = "none";
      elemento.appendChild(svg);
    });

    return backups;
  }

  function restaurarDonutsAposExportacao(backups) {
    backups.forEach(({ elemento, background, mask, webkitMask, svg }) => {
      if (svg && svg.parentNode === elemento) {
        elemento.removeChild(svg);
      }

      elemento.style.background = background;

      if (mask) {
        elemento.style.mask = mask;
      } else {
        elemento.style.removeProperty("mask");
      }

      if (webkitMask) {
        elemento.style.webkitMask = webkitMask;
      } else {
        elemento.style.removeProperty("-webkit-mask");
      }
    });
  }

  // -------------------------------------------------------------------
  // Métricas (GET /metricas): Leitores vs Admins e Leitura por status
  // -------------------------------------------------------------------
  function adaptarUsuarios(distribuicaoUsuarios) {
    const lista = Array.isArray(distribuicaoUsuarios) ? distribuicaoUsuarios : [];
    let leitores = 0;
    let administradores = 0;

    lista.forEach((item) => {
      const total = Number(item.total) || 0;
      if (item.tipo === "administrador") {
        administradores += total;
      } else {
        leitores += total;
      }
    });

    return { leitores, administradores };
  }

  function adaptarStatusLeitura(distribuicaoStatusLeitura) {
    const lista = Array.isArray(distribuicaoStatusLeitura) ? distribuicaoStatusLeitura : [];
    return lista.map((item) => ({
      rotulo: DB_ROTULOS_STATUS[item.status] || item.status || "Sem status",
      valor: Number(item.total) || 0,
    }));
  }

  async function carregarMetricas() {
    try {
      const dados = await buscarJson("/metricas");
      estado.metricas = dados;

      const usuarios = adaptarUsuarios(dados.distribuicaoUsuarios);
      renderizarDonut("dbDonutUsuarios", "dbDonutUsuariosLegenda", [
        { rotulo: "Leitores", valor: usuarios.leitores },
        { rotulo: "Admins", valor: usuarios.administradores },
      ]);

      const status = adaptarStatusLeitura(dados.distribuicaoStatusLeitura);
      renderizarDonut("dbDonutStatus", "dbDonutStatusLegenda", status);
    } catch (erro) {
      console.warn("Falha ao carregar /metricas.", erro);
      renderizarDonut("dbDonutUsuarios", "dbDonutUsuariosLegenda", []);
      renderizarDonut("dbDonutStatus", "dbDonutStatusLegenda", []);
    }
  }

  // -------------------------------------------------------------------
  // Trilhas populares (barras horizontais)
  // -------------------------------------------------------------------
  function renderizarTrilhasPopulares(trilhas) {
    const container = document.getElementById("dbTrilhasPopulares");
    container.innerHTML = "";

    const lista = Array.isArray(trilhas) ? [...trilhas] : [];
    lista.sort((a, b) => (Number(b.totalUsuarios) || 0) - (Number(a.totalUsuarios) || 0));
    const topo = lista.slice(0, 6);

    if (!topo.length) {
      container.innerHTML = `<p class="dbMensagemVazia">Nenhuma trilha popular encontrada.</p>`;
      return;
    }

    const maior = Math.max(...topo.map((t) => Number(t.totalUsuarios) || 0), 1);

    topo.forEach((trilha) => {
      const valor = Number(trilha.totalUsuarios) || 0;
      const largura = Math.round((valor / maior) * 100);

      const linha = document.createElement("div");
      linha.className = "dbBarraLinha";
      linha.innerHTML = `
        <span class="dbBarraRotulo" title="${trilha.tema || "Trilha"}">${trilha.tema || "Trilha"}</span>
        <span class="dbBarraTrack">
          <span class="dbBarraFill" style="width:${largura}%"></span>
        </span>
        <span class="dbBarraValor">${formatarNumero(valor)}</span>
      `;
      container.appendChild(linha);
    });
  }

  // -------------------------------------------------------------------
  // Gêneros populares + Maior abandono
  // -------------------------------------------------------------------
  function renderizarGeneros(generos) {
    const lista = document.getElementById("dbGenerosPopulares");
    lista.innerHTML = "";

    const itens = Array.isArray(generos) ? generos : [];

    if (!itens.length) {
      lista.innerHTML = `<li class="dbMensagemVazia">Nenhum gênero encontrado.</li>`;
      return;
    }

    itens.slice(0, 5).forEach((item, indice) => {
      const li = document.createElement("li");
      li.className = "dbGeneroItem";
      li.innerHTML = `
        <span class="dbGeneroPos">${indice + 1}</span>
        <span class="dbGeneroNome">${item.genero || "Sem gênero"}</span>
        <span class="dbGeneroTotal">${formatarNumero(item.total)}</span>
      `;
      lista.appendChild(li);
    });
  }

  function renderizarMaiorAbandono(maiorAbandono) {
    const elemento = document.getElementById("dbMaiorAbandono");

    if (!maiorAbandono || !maiorAbandono.genero) {
      elemento.textContent = "Sem dados de abandono.";
      return;
    }

    const proporcao = Number(maiorAbandono.proporcao) || 0;
    const percentual = Math.round(proporcao * 100);
    elemento.textContent = `${maiorAbandono.genero} (${percentual}%)`;
  }

  async function carregarDashboard() {
    try {
      const dados = await buscarJson("/relatorio/dashboard");
      estado.dashboard = dados;

      renderizarTrilhasPopulares(dados.trilhasPopulares);
      renderizarGeneros(dados.generosPopulares);
      renderizarMaiorAbandono(dados.maiorAbandono);
    } catch (erro) {
      console.warn("Falha ao carregar /relatorio/dashboard.", erro);
      renderizarTrilhasPopulares([]);
      renderizarGeneros([]);
      renderizarMaiorAbandono(null);
    }
  }

  // -------------------------------------------------------------------
  // Exportação CSV (gerada no front com os dados já carregados)
  // -------------------------------------------------------------------
  function montarLinhasCsv() {
    const linhas = [];
    const rel = estado.relatorio || {};
    const usuarios = adaptarUsuarios(estado.metricas?.distribuicaoUsuarios);
    const status = adaptarStatusLeitura(estado.metricas?.distribuicaoStatusLeitura);
    const dash = estado.dashboard || {};

    linhas.push(["Indicador", "Valor"]);
    linhas.push(["Usuários cadastrados", Number(rel.numeroUsuarios) || 0]);
    linhas.push(["Livros cadastrados", Number(rel.numeroLivros) || 0]);
    linhas.push(["Trilhas cadastradas", Number(rel.numeroTrilhas) || 0]);
    linhas.push(["Itens concluídos", Number(rel.numeroItensConcluidos) || 0]);
    linhas.push(["Páginas lidas", Number(rel.paginasLidas) || 0]);
    linhas.push(["Leitores", usuarios.leitores]);
    linhas.push(["Administradores", usuarios.administradores]);

    linhas.push([]);
    linhas.push(["Trilhas populares", "Usuários"]);
    (dash.trilhasPopulares || []).forEach((t) => {
      linhas.push([t.tema || "Trilha", Number(t.totalUsuarios) || 0]);
    });

    linhas.push([]);
    linhas.push(["Gêneros populares", "Total"]);
    (dash.generosPopulares || []).forEach((g) => {
      linhas.push([g.genero || "Sem gênero", Number(g.total) || 0]);
    });

    linhas.push([]);
    linhas.push(["Leitura por status", "Total"]);
    status.forEach((s) => {
      linhas.push([s.rotulo, s.valor]);
    });

    if (dash.maiorAbandono && dash.maiorAbandono.genero) {
      linhas.push([]);
      const percentual = Math.round((Number(dash.maiorAbandono.proporcao) || 0) * 100);
      linhas.push(["Maior abandono", `${dash.maiorAbandono.genero} (${percentual}%)`]);
    }

    return linhas;
  }

  function escaparCampoCsv(campo) {
    const texto = String(campo ?? "");
    if (/[";\n]/.test(texto)) {
      return `"${texto.replace(/"/g, '""')}"`;
    }
    return texto;
  }

  function exportarCsv() {
    const linhas = montarLinhasCsv();
    const csv = linhas.map((linha) => linha.map(escaparCampoCsv).join(";")).join("\n");

    // BOM para acentuação correta no Excel.
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-leia-mais.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // -------------------------------------------------------------------
  // Exportação PDF (html2canvas + jsPDF) — layout claro para relatório
  // -------------------------------------------------------------------
  async function exportarPdf() {
    const elemento = document.getElementById("dbConteudoCaptura");

    if (!elemento) {
      return;
    }

    if (typeof html2canvas === "undefined" || !window.jspdf) {
      exibirAlertaAcesso("Não foi possível carregar o gerador de PDF.", {
        titulo: "Atenção",
      });
      return;
    }

    elemento.classList.add("dbExportandoPdf");
    window.scrollTo(0, 0);

    const donutsBackup = prepararDonutsParaExportacao();

    await new Promise((resolver) => {
      requestAnimationFrame(() => requestAnimationFrame(resolver));
    });

    try {
      const canvas = await html2canvas(elemento, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
        width: elemento.scrollWidth,
        height: elemento.scrollHeight,
      });

      const imagem = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("l", "mm", "a4");

      const larguraPagina = pdf.internal.pageSize.getWidth();
      const alturaPagina = pdf.internal.pageSize.getHeight();
      const margem = 8;
      const larguraUtil = larguraPagina - margem * 2;
      const alturaUtil = alturaPagina - margem * 2;

      let larguraImagem = larguraUtil;
      let alturaImagem = (canvas.height * larguraImagem) / canvas.width;

      if (alturaImagem > alturaUtil) {
        alturaImagem = alturaUtil;
        larguraImagem = (canvas.width * alturaImagem) / canvas.height;
      }

      const posicaoX = margem + (larguraUtil - larguraImagem) / 2;
      const posicaoY = margem + (alturaUtil - alturaImagem) / 2;

      pdf.addImage(imagem, "PNG", posicaoX, posicaoY, larguraImagem, alturaImagem);
      pdf.save("relatorio-leia-mais.pdf");
    } catch (erro) {
      console.error("Erro ao gerar PDF:", erro);
      exibirAlertaAcesso("Não foi possível gerar o PDF.", { titulo: "Atenção" });
    } finally {
      restaurarDonutsAposExportacao(donutsBackup);
      elemento.classList.remove("dbExportandoPdf");
    }
  }

  // -------------------------------------------------------------------
  // Popover de exportação e navegação
  // -------------------------------------------------------------------
  function configurarExportacao() {
    const botao = document.getElementById("dbBotaoExportar");
    const popover = document.getElementById("dbPopoverExportar");

    if (!botao || !popover) {
      return;
    }

    function fecharPopover() {
      popover.classList.remove("dbPopoverAberto");
      botao.setAttribute("aria-expanded", "false");
    }

    botao.addEventListener("click", (evento) => {
      evento.stopPropagation();
      const aberto = popover.classList.toggle("dbPopoverAberto");
      botao.setAttribute("aria-expanded", aberto ? "true" : "false");
    });

    document.addEventListener("click", (evento) => {
      if (!popover.contains(evento.target) && !botao.contains(evento.target)) {
        fecharPopover();
      }
    });

    document.getElementById("dbExportarPdf").addEventListener("click", () => {
      fecharPopover();
      exportarPdf();
    });

    document.getElementById("dbExportarCsv").addEventListener("click", () => {
      fecharPopover();
      exportarCsv();
    });
  }

  function configurarVoltar() {
    const botaoVoltar = document.getElementById("blBotaoVoltarDashboard");
    if (botaoVoltar) {
      botaoVoltar.addEventListener("click", voltarPaginaAnterior);
    }
  }

  configurarExportacao();
  configurarVoltar();

  // Carrega os blocos em paralelo; cada um trata o próprio erro.
  await Promise.all([
    carregarRelatorio(),
    carregarMetricas(),
    carregarDashboard(),
  ]);
});
