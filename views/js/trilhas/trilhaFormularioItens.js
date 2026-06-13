const TF_NIVEIS_TRILHA = [
  { valor: 1, rotulo: "Iniciante" },
  { valor: 2, rotulo: "Básico" },
  { valor: 3, rotulo: "Intermediário" },
  { valor: 4, rotulo: "Avançado" },
  { valor: 5, rotulo: "Especialista" },
];

function tfFormatarNivelTrilha(nivel) {
  const nivelEncontrado = TF_NIVEIS_TRILHA.find(
    (item) => Number(item.valor) === Number(nivel),
  );

  return nivelEncontrado?.rotulo || "Nível não informado";
}

function tfPreencherSelectNivel(selectElement, valorSelecionado = "") {
  if (!selectElement) {
    return;
  }

  selectElement.innerHTML = '<option value="">Selecione</option>';

  TF_NIVEIS_TRILHA.forEach((nivel) => {
    const option = document.createElement("option");
    option.value = String(nivel.valor);
    option.textContent = nivel.rotulo;

    if (String(valorSelecionado) === String(nivel.valor)) {
      option.selected = true;
    }

    selectElement.appendChild(option);
  });
}

function tfCriarGerenciadorItens({
  listaElemento,
  aoAlterar = null,
  exibirMensagem = null,
}) {
  const itens = [];

  function notificarAlteracao() {
    if (typeof aoAlterar === "function") {
      aoAlterar(itens);
    }
  }

  function chaveItem(item) {
    return `${item.tipo}:${item.id}`;
  }

  function itemJaExiste(tipo, id) {
    return itens.some((item) => item.tipo === tipo && String(item.id) === String(id));
  }

  function adicionarItem(tipo, id, titulo) {
    if (!id || !titulo) {
      if (typeof exibirMensagem === "function") {
        exibirMensagem("Selecione um item válido da lista.", "Erro");
      }
      return false;
    }

    if (itemJaExiste(tipo, id)) {
      if (typeof exibirMensagem === "function") {
        exibirMensagem("Este item já foi adicionado à trilha.", "Erro");
      }
      return false;
    }

    itens.push({
      tipo,
      id: String(id),
      titulo: String(titulo).trim(),
      tipoRotulo: tipo === "livro" ? "Livro" : "Obra",
    });

    renderizarLista();
    notificarAlteracao();
    return true;
  }

  function removerItem(indice) {
    if (indice < 0 || indice >= itens.length) {
      return;
    }

    itens.splice(indice, 1);
    renderizarLista();
    notificarAlteracao();
  }

  function moverItem(indice, direcao) {
    const novoIndice = indice + direcao;

    if (novoIndice < 0 || novoIndice >= itens.length) {
      return;
    }

    const itemAtual = itens[indice];
    itens[indice] = itens[novoIndice];
    itens[novoIndice] = itemAtual;

    renderizarLista();
    notificarAlteracao();
  }

  function limparItens() {
    itens.length = 0;
    renderizarLista();
    notificarAlteracao();
  }

  function carregarItens(dadosItens) {
    itens.length = 0;

    (dadosItens || []).forEach((item) => {
      const tipo = item.itemTipo === "livro" ? "livro" : "obra";
      const id = tipo === "livro" ? item.id : item._id || item.id;
      const titulo = item.titulo || "Título não informado";

      itens.push({
        tipo,
        id: String(id),
        titulo,
        tipoRotulo: tipo === "livro" ? "Livro" : "Obra",
      });
    });

    renderizarLista();
    notificarAlteracao();
  }

  function montarPayload() {
    const obras = [];
    const livros = [];

    itens.forEach((item, indice) => {
      const ordem = indice + 1;

      if (item.tipo === "obra") {
        obras.push({ obraId: item.id, ordem });
      } else {
        livros.push({ livroId: Number(item.id), ordem });
      }
    });

    return { obras, livros };
  }

  function renderizarLista() {
    if (!listaElemento) {
      return;
    }

    listaElemento.innerHTML = "";

    if (!itens.length) {
      const mensagem = document.createElement("p");
      mensagem.className = "lmMensagemListaItensTrilha";
      mensagem.textContent = "Nenhum item adicionado à trilha.";
      listaElemento.appendChild(mensagem);
      return;
    }

    const lista = document.createElement("ol");
    lista.className = "lmListaItensTrilha";

    itens.forEach((item, indice) => {
      const linha = document.createElement("li");
      linha.className = "lmItemTrilhaOrdenado";

      const ordem = document.createElement("span");
      ordem.className = "lmItemTrilhaOrdem";
      ordem.textContent = `${indice + 1}.`;

      const titulo = document.createElement("span");
      titulo.className = "lmItemTrilhaTitulo";
      titulo.textContent = item.titulo;

      const tipo = document.createElement("span");
      tipo.className = "lmItemTrilhaTipo";
      tipo.textContent = item.tipoRotulo;

      const acoes = document.createElement("div");
      acoes.className = "lmItemTrilhaAcoes";

      const botaoSubir = document.createElement("button");
      botaoSubir.type = "button";
      botaoSubir.className = "lmBotaoOrdemTrilha";
      botaoSubir.textContent = "↑";
      botaoSubir.setAttribute("aria-label", "Subir item");
      botaoSubir.disabled = indice === 0;
      botaoSubir.addEventListener("click", () => moverItem(indice, -1));

      const botaoDescer = document.createElement("button");
      botaoDescer.type = "button";
      botaoDescer.className = "lmBotaoOrdemTrilha";
      botaoDescer.textContent = "↓";
      botaoDescer.setAttribute("aria-label", "Descer item");
      botaoDescer.disabled = indice === itens.length - 1;
      botaoDescer.addEventListener("click", () => moverItem(indice, 1));

      const botaoRemover = document.createElement("button");
      botaoRemover.type = "button";
      botaoRemover.className = "lmBotaoOrdemTrilha lmBotaoRemoverItemTrilha";
      botaoRemover.textContent = "×";
      botaoRemover.setAttribute("aria-label", "Remover item");
      botaoRemover.addEventListener("click", () => removerItem(indice));

      acoes.appendChild(botaoSubir);
      acoes.appendChild(botaoDescer);
      acoes.appendChild(botaoRemover);

      linha.appendChild(ordem);
      linha.appendChild(titulo);
      linha.appendChild(tipo);
      linha.appendChild(acoes);
      lista.appendChild(linha);
    });

    listaElemento.appendChild(lista);
  }

  return {
    itens,
    adicionarItem,
    removerItem,
    moverItem,
    limparItens,
    carregarItens,
    montarPayload,
    renderizarLista,
  };
}

function tfConfigurarAutocomplete({
  campo,
  lista,
  itensDisponiveis,
  obterRotulo,
  obterId,
}) {
  function renderizarSugestoes(filtro = "") {
    lista.innerHTML = "";

    const filtroNormalizado = filtro.toLowerCase();
    const itensFiltrados = itensDisponiveis.filter((item) =>
      obterRotulo(item).toLowerCase().includes(filtroNormalizado),
    );

    itensFiltrados.forEach((item) => {
      const elemento = document.createElement("div");
      elemento.className = "lmCadastroAutocompleteItem";
      elemento.textContent = obterRotulo(item);
      elemento.dataset.id = obterId(item);

      elemento.addEventListener("click", () => {
        campo.value = obterRotulo(item);
        campo.dataset.id = obterId(item);
        campo.dataset.titulo = obterRotulo(item);
        lista.classList.remove("ativo");
      });

      lista.appendChild(elemento);
    });

    if (itensFiltrados.length > 0) {
      lista.classList.add("ativo");
    } else {
      lista.classList.remove("ativo");
    }
  }

  campo.addEventListener("input", () => {
    campo.dataset.id = "";
    campo.dataset.titulo = "";
    renderizarSugestoes(campo.value);
  });

  campo.addEventListener("focus", () => {
    renderizarSugestoes(campo.value);
  });

  return { renderizarSugestoes };
}

const TF_SUPABASE_URL = "https://htregzpvwyhrrqdzqtrd.supabase.co";
const TF_SUPABASE_ANON_KEY =
  "sb_publishable_F5w-U17IUYOQoZySjx0RQQ_UdYMH0MP";
const TF_SUPABASE_BUCKET = "capa-livros";

function tfResolverCapaTrilha(imagemCapa) {
  const capa = String(imagemCapa || "").trim();

  if (!capa || capa === "null" || capa === "undefined") {
    return "/assets/capaPadrao.jpg";
  }

  return capa;
}

function tfValidarArquivoImagem(arquivoImagem) {
  return Boolean(arquivoImagem && arquivoImagem.type.startsWith("image/"));
}

function tfObterClienteSupabase() {
  if (typeof supabase === "undefined") {
    return null;
  }

  return supabase.createClient(TF_SUPABASE_URL, TF_SUPABASE_ANON_KEY);
}

async function tfUploadImagemCapaTrilha(arquivoImagem) {
  if (!arquivoImagem) {
    return null;
  }

  if (!tfValidarArquivoImagem(arquivoImagem)) {
    throw new Error("Selecione um arquivo de imagem válido.");
  }

  const clienteSupabase = tfObterClienteSupabase();

  if (!clienteSupabase) {
    throw new Error("Não foi possível conectar ao serviço de imagens.");
  }

  const extensaoArquivo = arquivoImagem.name.split(".").pop();
  const nomeArquivo = `capa-trilha-${Date.now()}.${extensaoArquivo}`;
  const caminhoArquivo = `trilhas/${nomeArquivo}`;

  const { error } = await clienteSupabase.storage
    .from(TF_SUPABASE_BUCKET)
    .upload(caminhoArquivo, arquivoImagem);

  if (error) {
    console.error("Erro Supabase Storage:", error);
    throw new Error(error.message || "Erro ao enviar imagem da capa.");
  }

  const { data } = clienteSupabase.storage
    .from(TF_SUPABASE_BUCKET)
    .getPublicUrl(caminhoArquivo);

  return data.publicUrl;
}

function tfConfigurarPreviewCapaTrilha(inputElemento, previewElemento, capaAtual) {
  if (!inputElemento || !previewElemento) {
    return;
  }

  const capaInicial = tfResolverCapaTrilha(capaAtual);
  previewElemento.src = capaInicial;

  inputElemento.addEventListener("change", function () {
    const arquivo = inputElemento.files[0];

    if (!arquivo) {
      previewElemento.src = capaInicial;
      return;
    }

    if (!tfValidarArquivoImagem(arquivo)) {
      inputElemento.value = "";
      previewElemento.src = capaInicial;
      return;
    }

    previewElemento.src = URL.createObjectURL(arquivo);
  });
}

function tfAtualizarPreviewCapaTrilha(previewElemento, capaAtual) {
  if (!previewElemento) {
    return;
  }

  previewElemento.src = tfResolverCapaTrilha(capaAtual);
}