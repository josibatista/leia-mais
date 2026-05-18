document.addEventListener("DOMContentLoaded", () => {
  carregarMenuAdm();
});

async function carregarMenuAdm() {
  const menuContainer = document.getElementById("blMenuContainer");

  if (!menuContainer) {
    console.error("Container do menu admin não encontrado.");
    return;
  }

  try {
    const resposta = await fetch("../components/menuAdm.html");

    if (!resposta.ok) {
      throw new Error("Erro ao carregar o menu admin.");
    }

    const menuHTML = await resposta.text();
    menuContainer.innerHTML = menuHTML;

    configurarMenuAdm();
    configurarLogoutAdm();
    configurarTemaAdm();

  } catch (erro) {
    console.error("Erro ao carregar menu admin:", erro);
  }
}

function configurarMenuAdm() {
  const botaoAbrir = document.getElementById("lmMenuAbrirBotao");
  const botaoFechar = document.getElementById("lmMenuFecharBotao");
  const menuLateral = document.getElementById("lmMenuLateral");
  const menuOverlay = document.getElementById("lmMenuOverlay");

  if (!botaoAbrir || !botaoFechar || !menuLateral || !menuOverlay) {
    console.warn("Elementos do menu admin não encontrados.");
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

function configurarLogoutAdm() {
  const botaoSair = document.querySelector(".lmMenuSair");

  if (!botaoSair) return;

  botaoSair.addEventListener("click", (evento) => {
    evento.preventDefault();

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    window.location.href = "loginAdm.html";
  });
}

function configurarTemaAdm() {
  const botaoTema = document.getElementById("lmBotaoTema");
  const iconeTema = document.getElementById("lmIconeTema");

  if (!botaoTema || !iconeTema) return;

  botaoTema.addEventListener("click", () => {
    document.body.classList.toggle("lmTemaEscuro");

    if (document.body.classList.contains("lmTemaEscuro")) {
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
  });
}