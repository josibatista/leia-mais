document.addEventListener("DOMContentLoaded", () => {
  carregarMenu();
});

function obterCaminhoMenu() {
  const estaNaRaiz =
    window.location.pathname.endsWith("/view/index.html") ||
    window.location.pathname === "/" ||
    !window.location.pathname.includes("/view/pages/");

  return estaNaRaiz
    ? "view/components/menu.html"
    : "../components/menu.html";
}

async function carregarMenu() {
  const menuContainer = document.getElementById("blMenuContainer");

  if (!menuContainer) {
    console.error("Container do menu não encontrado.");
    return;
  }

  try {
    const resposta = await fetch(obterCaminhoMenu());

    if (!resposta.ok) {
      throw new Error("Erro ao carregar o menu.");
    }

    const menuHTML = await resposta.text();
    menuContainer.innerHTML = menuHTML;

    atualizarSaudacaoUsuario();
    configurarVisibilidadeMenu();
    configurarMenuLateral();
    configurarBotaoTema();
    configurarLogout();

  } catch (erro) {
    console.error("Erro ao carregar menu:", erro);
  }
}

function obterUsuarioLogado() {
  return JSON.parse(localStorage.getItem("usuario")) || null;
}

function usuarioEstaLogado() {
  return !!localStorage.getItem("token") && !!obterUsuarioLogado();
}

function usuarioEhAdministrador() {
  const usuario = obterUsuarioLogado();
  return usuario?.tipo === "administrador";
}

function atualizarSaudacaoUsuario() {
  const saudacaoUsuario = document.getElementById("lmSaudacaoUsuario");
  const usuario = obterUsuarioLogado();

  if (!saudacaoUsuario) return;

  if (usuario?.nome && usuario.nome.trim() !== "") {
    saudacaoUsuario.innerHTML = `Olá,<br><strong>${usuario.nome}!</strong>`;
  } else {
    saudacaoUsuario.textContent = "Olá!";
  }
}

function configurarVisibilidadeMenu() {
  const estaLogado = usuarioEstaLogado();
  const ehAdmin = usuarioEhAdministrador();

  document.querySelectorAll(".lmMenuAdmin").forEach((item) => {
    item.style.display = estaLogado && ehAdmin ? "flex" : "none";
  });

  document.querySelectorAll(".lmMenuLeitor").forEach((item) => {
    item.style.display = estaLogado && !ehAdmin ? "flex" : "none";
  });

  document.querySelectorAll(".lmMenuPublico").forEach((item) => {
    item.style.display = !ehAdmin ? "flex" : "none";
  });

  document.querySelectorAll(".lmMenuLogado").forEach((item) => {
    item.style.display = estaLogado ? "flex" : "none";
  });

  document.querySelectorAll(".lmMenuVisitante").forEach((item) => {
    item.style.display = !estaLogado ? "flex" : "none";
  });
}

function configurarMenuLateral() {
  const botaoAbrir = document.getElementById("lmMenuAbrirBotao");
  const botaoFechar = document.getElementById("lmMenuFecharBotao");
  const menuLateral = document.getElementById("lmMenuLateral");
  const menuOverlay = document.getElementById("lmMenuOverlay");

  if (!botaoAbrir || !botaoFechar || !menuLateral || !menuOverlay) {
    console.warn("Elementos do menu lateral não encontrados.");
    return;
  }

  botaoAbrir.onclick = () => {
    menuLateral.classList.add("lmMenuLateralAberto");
    menuOverlay.classList.add("lmMenuOverlayAtivo");
  };

  botaoFechar.onclick = () => {
    menuLateral.classList.remove("lmMenuLateralAberto");
    menuOverlay.classList.remove("lmMenuOverlayAtivo");
  };

  menuOverlay.onclick = () => {
    menuLateral.classList.remove("lmMenuLateralAberto");
    menuOverlay.classList.remove("lmMenuOverlayAtivo");
  };
}

function configurarBotaoTema() {
  const botaoTema = document.getElementById("lmBotaoTema");
  const iconeTema = document.getElementById("lmIconeTema");
  const logoMenu = document.getElementById("lmMenuLogoLeiaMulheres");

  if (!botaoTema || !iconeTema) return;

  botaoTema.onclick = () => {
    document.body.classList.toggle("lmTemaEscuro");

    const temaEscuroAtivo =
      document.body.classList.contains("lmTemaEscuro");

    const logoTema = temaEscuroAtivo
      ? "/view/assets/logoLeiaEscuro.png"
      : "/view/assets/logoLeiaClaro.png";

    if (logoMenu) {
      logoMenu.src = logoTema;
    }

    document.querySelectorAll(".lmLogoTema").forEach((logo) => {
      logo.src = logoTema;
    });

    if (temaEscuroAtivo) {
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
  };
}

function configurarLogout() {
  const botaoSair = document.querySelector(".lmMenuSair");
  const botaoLogin = document.querySelector(".lmMenuLogin");

  if (botaoSair) {
    botaoSair.onclick = (evento) => {
      evento.preventDefault();

      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      window.location.href = "loginLeitor.html";
    };
  }

  if (botaoLogin) {
    botaoLogin.onclick = (evento) => {
      evento.preventDefault();
      window.location.href = "loginLeitor.html";
    };
  }
}