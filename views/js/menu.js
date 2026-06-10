document.addEventListener("DOMContentLoaded", () => {
  carregarMenu();
});

function obterCaminhoMenu() {
    return "/components/menu.html";
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
    if (item.classList.contains("lmMenuLeitor")) {
      return;
    }

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

  if (!botaoTema || !iconeTema) return;

  atualizarIconesTema(document.body.classList.contains("lmTemaEscuro"));

  botaoTema.onclick = () => {
    alternarTema();
    sincronizarSeletorTema(document.getElementById("blSeletorTema"));
  };
}

function configurarLogout() {
  const botaoSair = document.querySelector(".lmMenuSair");
  const botaoLogin = document.querySelector(".lmMenuLogin");

  if (botaoSair) {
    botaoSair.onclick = (evento) => {
      evento.preventDefault();

      limparSessao();

      window.location.href = "/pages/usuarios/leitor/loginLeitor.html";
    };
  }

  if (botaoLogin) {
    botaoLogin.onclick = (evento) => {
      evento.preventDefault();
      window.location.href = "/pages/usuarios/leitor/loginLeitor.html";
    };
  }
}