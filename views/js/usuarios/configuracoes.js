document.addEventListener("DOMContentLoaded", async () => {
  let token = obterToken();
  let usuario = obterUsuarioLogado();

  if (!token || !usuario) {
    exibirAlertaAcesso("Faça login para continuar.", {
      titulo: "Acesso negado",
      redirect: "/pages/usuarios/leitor/login.html",
    });
    return;
  }

  const modalEditar = document.getElementById("blModalEditarConfig");
  const modalTitulo = document.getElementById("blModalEditarTitulo");
  const labelEditar = document.getElementById("blLabelEditarConfig");
  const inputEditar = document.getElementById("blInputEditarConfig");
  const mensagemModal = document.getElementById("blMensagemModalConfig");
  const formEditar = document.getElementById("blFormEditarConfig");
  const seletorTema = document.getElementById("blSeletorTema");

  const modalExclusao = document.getElementById("blModalConfirmarExclusao");

  let campoEmEdicao = null;

  const rotulosCampo = {
    nome: "Nome",
    username: "Usuário",
    email: "E-mail",
    senha: "Nova senha",
  };

  function abrirModal(overlay) {
    overlay.classList.add("lmModalOverlayAtivo");
  }

  function fecharModal(overlay) {
    overlay.classList.remove("lmModalOverlayAtivo");
  }

  function limparMensagemModal() {
    mensagemModal.textContent = "";
    mensagemModal.className = "lmCadastroMensagem";
  }

  function exibirMensagemModal(texto, tipo) {
    mensagemModal.textContent = texto;
    mensagemModal.className = "lmCadastroMensagem";
    if (tipo) {
      mensagemModal.classList.add(tipo);
    }
  }

  async function carregarUsuario() {
    try {
      const resposta = await fetch(`/usuarios/${usuario.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error);
      }

      usuario = dados;
      salvarUsuarioNaSessao(dados);
      preencherTela();
    } catch (erro) {
      console.error(erro);
      limparSessao();
      exibirAlertaAcesso("Sessão expirada. Faça login novamente.", {
        titulo: "Acesso negado",
        redirect: "/pages/usuarios/leitor/login.html",
      });
    }
  }

  function preencherTela() {
    document.getElementById("blNomePerfil").textContent = usuario.nome;
    document.getElementById("blUsuarioPerfil").textContent = usuario.username;
    document.getElementById("blEmailPerfil").textContent = usuario.email;
    document.getElementById("blSenhaPerfil").textContent = "********";
  }

  function abrirModalEdicao(campo) {
    campoEmEdicao = campo;
    limparMensagemModal();

    modalTitulo.textContent = `Editar ${rotulosCampo[campo]}`;
    labelEditar.textContent = rotulosCampo[campo];
    inputEditar.value = campo === "senha" ? "" : usuario[campo] || "";
    inputEditar.type = campo === "senha" ? "password" : "text";
    inputEditar.placeholder =
      campo === "senha" ? "Digite a nova senha" : `Novo ${rotulosCampo[campo].toLowerCase()}`;

    abrirModal(modalEditar);
    inputEditar.focus();
  }

  await carregarUsuario();
  sincronizarSeletorTema(seletorTema);

  const botaoVoltarConfig = document.getElementById("blBotaoVoltarConfig");
  if (botaoVoltarConfig) {
    botaoVoltarConfig.addEventListener("click", () => {
      voltarPaginaAnterior();
    });
  }

  document.querySelectorAll(".blListaItensConfig button[data-campo]").forEach((botao) => {
    botao.addEventListener("click", () => {
      abrirModalEdicao(botao.dataset.campo);
    });
  });

  document.getElementById("blFecharModalEditarConfig").addEventListener("click", () => {
    fecharModal(modalEditar);
  });

  document.getElementById("blCancelarModalConfig").addEventListener("click", () => {
    fecharModal(modalEditar);
  });

  modalEditar.addEventListener("click", (evento) => {
    if (evento.target === modalEditar) {
      fecharModal(modalEditar);
    }
  });

  formEditar.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const novoValor = inputEditar.value.trim();

    if (!novoValor) {
      exibirMensagemModal("Preencha o campo.", "erro");
      return;
    }

    if (campoEmEdicao === "senha") {
      if (
        novoValor.length < 8 ||
        !/[a-zA-Z]/.test(novoValor) ||
        !/\d/.test(novoValor) ||
        !/[!@#$%^&*(),.?\":{}|<>]/.test(novoValor)
      ) {
        exibirMensagemModal(
          "Senha deve ter 8+ caracteres, letra, número e especial.",
          "erro",
        );
        return;
      }
    }

    try {
      const resposta = await fetch(`/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [campoEmEdicao]: novoValor }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        exibirMensagemModal(dados.error || "Erro ao atualizar.", "erro");
        return;
      }

      usuario = dados;
      salvarUsuarioNaSessao(dados);
      preencherTela();
      fecharModal(modalEditar);

      exibirAlertaAcesso("Atualizado com sucesso!", { titulo: "Sucesso" });
    } catch (erro) {
      console.error(erro);
      exibirMensagemModal("Erro ao atualizar.", "erro");
    }
  });

  if (seletorTema) {
    seletorTema.addEventListener("change", () => {
      aplicarTema(seletorTema.value);
    });
  }

  document.getElementById("blApagarConta").addEventListener("click", () => {
    abrirModal(modalExclusao);
  });

  document.getElementById("blFecharModalExclusao").addEventListener("click", () => {
    fecharModal(modalExclusao);
  });

  document.getElementById("blCancelarExclusao").addEventListener("click", () => {
    fecharModal(modalExclusao);
  });

  modalExclusao.addEventListener("click", (evento) => {
    if (evento.target === modalExclusao) {
      fecharModal(modalExclusao);
    }
  });

  document.getElementById("blConfirmarExclusao").addEventListener("click", async () => {
    try {
      const resposta = await fetch(`/usuarios/${usuario.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resposta.ok) {
        const dados = await resposta.json();
        exibirAlertaAcesso(dados.error || "Erro ao apagar conta.", { titulo: "Atenção" });
        return;
      }

      fecharModal(modalExclusao);
      limparSessao();

      exibirAlertaAcesso("Conta apagada com sucesso.", {
        titulo: "Sucesso",
        redirect: "/pages/usuarios/leitor/login.html",
      });
    } catch (erro) {
      console.error(erro);
      exibirAlertaAcesso("Erro ao apagar conta.", { titulo: "Atenção" });
    }
  });

  document.getElementById("blGithub").addEventListener("click", () => {
    window.open("https://github.com/josibatista/leia-mais", "_blank");
  });
});
