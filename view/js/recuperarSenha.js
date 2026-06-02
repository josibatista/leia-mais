const CHAVE_USERNAME_RECUPERACAO = "usernameRecuperacao";

function exibirCodigoRecuperacao(codigo, username) {
  garantirAlertaOverlay();

  const overlay = document.getElementById("lmAlertaOverlay");
  const tituloAlerta = document.getElementById("lmAlertaTitulo");
  const mensagemAlerta = document.getElementById("lmAlertaMensagem");
  const botaoAlerta = document.getElementById("lmAlertaBotao");

  if (!overlay || !tituloAlerta || !mensagemAlerta || !botaoAlerta) {
    return;
  }

  tituloAlerta.textContent = "Código de recuperação";
  mensagemAlerta.textContent = `Código de recuperação: ${codigo}`;
  botaoAlerta.textContent = "Continuar";
  overlay.classList.add("ativo");

  botaoAlerta.onclick = () => {
    overlay.classList.remove("ativo");
    botaoAlerta.textContent = "OK";
    sessionStorage.setItem(CHAVE_USERNAME_RECUPERACAO, username);
    localStorage.removeItem("emailRecuperacao");
    window.location.href = "novaSenha.html";
  };
}

function obterMensagemErroRecuperacao(resposta, dados) {
  if (resposta.status === 404) {
    return "Usuário não existe.";
  }

  if (resposta.status === 422) {
    const erro = dados.error || "";
    if (/email/i.test(erro)) {
      return "Informe seu usuário.";
    }
    return erro || "Informe seu usuário.";
  }

  return dados.error || "Erro ao validar usuário.";
}

document.addEventListener("DOMContentLoaded", () => {
  const inputSenha = document.getElementById("blNovaSenha");
  const olhoSenha = document.getElementById("blOlhoSenha");

  if (inputSenha && olhoSenha) {
    olhoSenha.addEventListener("click", () => {
      if (inputSenha.type === "password") {
        inputSenha.type = "text";
        olhoSenha.classList.remove("fa-eye");
        olhoSenha.classList.add("fa-eye-slash");
      } else {
        inputSenha.type = "password";
        olhoSenha.classList.remove("fa-eye-slash");
        olhoSenha.classList.add("fa-eye");
      }
    });
  }

  const formRecuperar = document.getElementById("blFormuRecuperarSenha");

  if (formRecuperar) {
    formRecuperar.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      const username = document.getElementById("blUsernameRecuperacao").value.trim();

      if (!username) {
        exibirAlertaAcesso("Informe seu usuário.", { titulo: "Atenção" });
        return;
      }

      try {
        const resposta = await fetch(`/esqueci-senha`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          exibirAlertaAcesso(obterMensagemErroRecuperacao(resposta, dados), {
            titulo: "Atenção",
          });
          return;
        }

        if (!dados.codigo) {
          exibirAlertaAcesso("Não foi possível gerar o código de recuperação.", {
            titulo: "Atenção",
          });
          return;
        }

        exibirCodigoRecuperacao(dados.codigo, username);
      } catch (erro) {
        console.error("Erro:", erro);
        exibirAlertaAcesso("Erro ao conectar com o servidor.", { titulo: "Atenção" });
      }
    });
  }

  const formNovaSenha = document.getElementById("blFormNovaSenha");

  if (formNovaSenha) {
    formNovaSenha.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      const username = sessionStorage.getItem(CHAVE_USERNAME_RECUPERACAO);
      const codigo = document.getElementById("blCodigoRecuperacao").value.trim();
      const novaSenha = document.getElementById("blNovaSenha").value.trim();

      if (!username) {
        exibirAlertaAcesso("Sessão expirada. Tente novamente.", {
          titulo: "Atenção",
          redirect: "recuperarSenha.html",
        });
        return;
      }

      if (!codigo || !novaSenha) {
        exibirAlertaAcesso("Preencha código e nova senha.", { titulo: "Atenção" });
        return;
      }

      if (novaSenha.length < 8) {
        exibirAlertaAcesso("A senha deve ter no mínimo 8 caracteres.", { titulo: "Atenção" });
        return;
      }

      if (!/[a-zA-Z]/.test(novaSenha)) {
        exibirAlertaAcesso("A senha deve conter pelo menos uma letra.", { titulo: "Atenção" });
        return;
      }

      if (!/\d/.test(novaSenha)) {
        exibirAlertaAcesso("A senha deve conter pelo menos um número.", { titulo: "Atenção" });
        return;
      }

      if (!/[!@#$%^&*(),.?\":{}|<>]/.test(novaSenha)) {
        exibirAlertaAcesso("A senha deve conter pelo menos um caractere especial.", {
          titulo: "Atenção",
        });
        return;
      }

      try {
        const resposta = await fetch(`/redefinir-senha`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, codigo, novaSenha }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          exibirAlertaAcesso(dados.error || "Erro ao redefinir senha.", { titulo: "Atenção" });
          return;
        }

        sessionStorage.removeItem(CHAVE_USERNAME_RECUPERACAO);
        localStorage.removeItem("emailRecuperacao");

        exibirAlertaAcesso("Senha alterada com sucesso!", {
          titulo: "Sucesso",
          redirect: "loginLeitor.html",
        });
      } catch (erro) {
        console.error("Erro:", erro);
        exibirAlertaAcesso("Erro ao conectar com o servidor.", { titulo: "Atenção" });
      }
    });
  }
});
