document.addEventListener("DOMContentLoaded", () => {
    carregarMenuLeitor();
});

async function carregarMenuLeitor() {
    const menuContainer = document.getElementById("blMenuContainer");

    if (!menuContainer) {
        console.error("Container do menu não encontrado.");
        return;
    }

    try {
        const resposta = await fetch(`../components/menuLeitor.html`);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar o menu.");
        }

        const menuHTML = await resposta.text();
        menuContainer.innerHTML = menuHTML;
        console.log("HTML carregado no container:", menuContainer.innerHTML);

        atualizarSaudacaoUsuario();
        configurarMenuLateral();
        configurarBotaoTema();
        configurarLogout();

    } catch (erro) {
        console.error("Erro ao carregar menu:", erro);
    }
}

function atualizarSaudacaoUsuario() {
    const saudacaoUsuario = document.getElementById("lmSaudacaoUsuario");
    const usuario = JSON.parse(localStorage.getItem("usuario")) || {};

    if (!saudacaoUsuario) return;

    if (usuario.nome && usuario.nome.trim() !== "") {
        saudacaoUsuario.innerHTML = `Olá,<br><strong>${usuario.nome}!</strong>`;
    } else {
        saudacaoUsuario.textContent = "Olá!";
    }
}

function configurarMenuLateral() {
    const botaoAbrir = document.getElementById("lmMenuAbrirBotao");
    const botaoFechar = document.getElementById("lmMenuFecharBotao");
    const menuLateral = document.getElementById("lmMenuLateral");
    const menuOverlay = document.getElementById("lmMenuOverlay");

    console.log("botaoAbrir:", botaoAbrir);
    console.log("botaoFechar:", botaoFechar);
    console.log("menuLateral:", menuLateral);
    console.log("menuOverlay:", menuOverlay);

    if (!botaoAbrir || !botaoFechar || !menuLateral || !menuOverlay) {
        console.warn("Elementos do menu lateral não encontrados.");
        return;
    }

    botaoAbrir.addEventListener("click", () => {
        menuLateral.classList.add("lmMenuLateralAberto");
        menuOverlay.classList.add("lmMenuOverlayAtivo");
    });

    botaoFechar.addEventListener("click", () => {
        menuLateral.classList.remove("lmMenuLateralAberto");
        menuOverlay.classList.remove("lmMenuOverlayAtivo");
    });

    menuOverlay.addEventListener("click", () => {
        menuLateral.classList.remove("lmMenuLateralAberto");
        menuOverlay.classList.remove("lmMenuOverlayAtivo");
    });
}

function configurarBotaoTema() {
    const botaoTema = document.getElementById("lmBotaoTema");
    const iconeTema = document.getElementById("lmIconeTema");
    const logoMenu = document.getElementById("lmMenuLogoLeiaMulheres");

    if (!botaoTema || !iconeTema) {
        return;
    }

    botaoTema.addEventListener("click", () => {
        document.body.classList.toggle("lmTemaEscuro");

        if (document.body.classList.contains("lmTemaEscuro")) {
            if (logoMenu) {
                logoMenu.src = "../assets/logoLeiaEscuro.png";
            }

            iconeTema.innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3
                7 7 0 0 0 21 12.79z"></path>
            `;
        } else {
            if (logoMenu) {
                logoMenu.src = "../assets/logoLeiaClaro.png";
            }

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

function configurarLogout() {
    const botaoSair = document.querySelector(".lmMenuSair");

    if (!botaoSair) return;

    botaoSair.addEventListener("click", (evento) => {
        evento.preventDefault();

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        window.location.href = "loginLeitor.html";
    });
}