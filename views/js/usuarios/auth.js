const TEMPO_SESSAO_MINUTOS = 180;
const CHAVE_LEMBRAR_LOGIN = "lmLembrarLogin";
const CHAVE_SESSAO_EXPIRA_EM = "lmSessaoExpiraEm";
const CHAVE_TEMA_PREFERENCIA = "lmTemaPreferencia";

function obterTemaSalvo() {
  return localStorage.getItem(CHAVE_TEMA_PREFERENCIA) === "escuro" ? "escuro" : "claro";
}

function atualizarIconesTema(temaEscuro) {
  const iconeTema = document.getElementById("lmIconeTema");
  const logoMenu = document.getElementById("lmMenuLogoLeiaMulheres");
  const logoTema = temaEscuro
    ? "/assets/logoLeiaEscuro.png"
    : "/assets/logoLeiaClaro.png";

  if (logoMenu) {
    logoMenu.src = logoTema;
  }

  document.querySelectorAll(".lmLogoTema").forEach((logo) => {
    logo.src = logoTema;
  });

  if (!iconeTema) {
    return;
  }

  if (temaEscuro) {
    iconeTema.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3
      7 7 0 0 0 21 12.79z"></path>
    `;
  } else {
    iconeTema.innerHTML = `
      <circle cx="12" cy="12" r="4"></circle>
      <line x1="12" y1="2" x2="12" y2="4"></line>
      <line x1="12" y1="20" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="4" y2="12"></line>
      <line x1="20" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line>
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line>
    `;
  }
}

function aplicarTema(tema) {
  const temaEscuro = tema === "escuro";
  document.body.classList.toggle("lmTemaEscuro", temaEscuro);
  localStorage.setItem(CHAVE_TEMA_PREFERENCIA, temaEscuro ? "escuro" : "claro");
  atualizarIconesTema(temaEscuro);
  return tema;
}

function aplicarTemaSalvo() {
  return aplicarTema(obterTemaSalvo());
}

function alternarTema() {
  const temaAtual = document.body.classList.contains("lmTemaEscuro") ? "escuro" : "claro";
  const novoTema = temaAtual === "escuro" ? "claro" : "escuro";
  return aplicarTema(novoTema);
}

function sincronizarSeletorTema(seletor) {
  if (!seletor) {
    return;
  }
  seletor.value = obterTemaSalvo();
}

function obterArmazenamentoSessao() {
  if (localStorage.getItem(CHAVE_LEMBRAR_LOGIN) === "true") {
    return localStorage;
  }
  return sessionStorage;
}

function sessaoExpiradaNoStorage(storage) {
  const expiraEm = storage.getItem(CHAVE_SESSAO_EXPIRA_EM);
  if (!expiraEm) {
    return false;
  }
  return Date.now() > Number(expiraEm);
}

function limparSessao() {
  ["token", "usuario", CHAVE_SESSAO_EXPIRA_EM].forEach((chave) => {
    localStorage.removeItem(chave);
    sessionStorage.removeItem(chave);
  });
  localStorage.removeItem(CHAVE_LEMBRAR_LOGIN);
}

function validarSessaoAtual() {
  const storage = obterArmazenamentoSessao();
  const token = storage.getItem("token");
  const usuario = storage.getItem("usuario");

  if (!token || !usuario) {
    limparSessao();
    return false;
  }

  if (sessaoExpiradaNoStorage(storage)) {
    limparSessao();
    return false;
  }

  return true;
}

function obterToken() {
  if (!validarSessaoAtual()) {
    return null;
  }
  return obterArmazenamentoSessao().getItem("token");
}

function obterUsuarioLogado() {
  if (!validarSessaoAtual()) {
    return null;
  }

  try {
    return JSON.parse(obterArmazenamentoSessao().getItem("usuario"));
  } catch {
    limparSessao();
    return null;
  }
}

function usuarioEstaLogado() {
  return !!obterToken() && !!obterUsuarioLogado();
}

function usuarioEhAdministrador() {
  const usuario = obterUsuarioLogado();
  return usuario?.tipo === "administrador";
}

function salvarSessaoLogin(token, usuario, lembrar) {
  limparSessao();

  const storage = lembrar ? localStorage : sessionStorage;
  const expiraEm = Date.now() + TEMPO_SESSAO_MINUTOS * 60 * 1000;

  storage.setItem("token", token);
  storage.setItem("usuario", JSON.stringify(usuario));
  storage.setItem(CHAVE_SESSAO_EXPIRA_EM, String(expiraEm));

  if (lembrar) {
    localStorage.setItem(CHAVE_LEMBRAR_LOGIN, "true");
  } else {
    localStorage.removeItem(CHAVE_LEMBRAR_LOGIN);
  }
}

function salvarUsuarioNaSessao(usuario) {
  if (!validarSessaoAtual()) {
    return;
  }
  obterArmazenamentoSessao().setItem("usuario", JSON.stringify(usuario));
}

function garantirAlertaOverlay() {
  if (document.getElementById("lmAlertaOverlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "lmAlertaOverlay";
  overlay.className = "lmAlertaOverlay";
  overlay.innerHTML = `
    <div class="lmAlertaBox">
      <h3 id="lmAlertaTitulo">Atenção</h3>
      <p id="lmAlertaMensagem">Mensagem do alerta.</p>
      <button type="button" id="lmAlertaBotao" class="lmAlertaBotao">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

function exibirAlertaAcesso(mensagem, opcoes = {}) {
  const titulo = opcoes.titulo || "Acesso negado";
  const redirect = opcoes.redirect || null;
  const aoFechar = opcoes.aoFechar || null;

  garantirAlertaOverlay();

  const overlay = document.getElementById("lmAlertaOverlay");
  const tituloAlerta = document.getElementById("lmAlertaTitulo");
  const mensagemAlerta = document.getElementById("lmAlertaMensagem");
  const botaoAlerta = document.getElementById("lmAlertaBotao");

  if (!overlay || !tituloAlerta || !mensagemAlerta || !botaoAlerta) {
    window.alert(mensagem);
    if (redirect) {
      window.location.href = redirect;
    }
    return;
  }

  tituloAlerta.textContent = titulo;
  mensagemAlerta.textContent = mensagem;
  overlay.classList.add("ativo");

  botaoAlerta.onclick = () => {
    overlay.classList.remove("ativo");
    if (typeof aoFechar === "function") {
      aoFechar();
    }
    if (redirect) {
      window.location.href = redirect;
    }
  };
}

function ocultarConteudoProtegido() {
  document.querySelectorAll("main, header, .lmCadastroConteudoPrincipal").forEach((elemento) => {
    elemento.style.display = "none";
  });
}

function protegerRotaAdmin() {
  if (usuarioEstaLogado() && usuarioEhAdministrador()) {
    return true;
  }

  const executarBloqueio = () => {
    ocultarConteudoProtegido();
    exibirAlertaAcesso("Acesso permitido apenas para administradores.", {
      titulo: "Acesso negado",
      redirect: "/pages/usuarios/adm/login.html",
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", executarBloqueio, { once: true });
  } else {
    executarBloqueio();
  }

  return false;
}

function protegerRotaLeitor() {
  const usuario = obterUsuarioLogado();

  if (usuarioEstaLogado() && usuario?.tipo !== "administrador") {
    return true;
  }

  const executarBloqueio = () => {
    ocultarConteudoProtegido();
    exibirAlertaAcesso("Faça login como leitor para acessar esta página.", {
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

function voltarPaginaAnterior() {
  window.history.back();
}

(function inicializarValidacaoSessao() {
  [localStorage, sessionStorage].forEach((storage) => {
    if (storage.getItem("token") && sessaoExpiradaNoStorage(storage)) {
      limparSessao();
    }
  });
})();

aplicarTemaSalvo();