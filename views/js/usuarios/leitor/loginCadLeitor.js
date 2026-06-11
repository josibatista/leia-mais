document.addEventListener("DOMContentLoaded", () => {

  const inputSenha = document.getElementById("blSenhaLeitor");
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

  const formLogin = document.getElementById("blFormLoginLeitor");
  const formCadastro = document.getElementById("blFormCadastroLeitor");

  if (formLogin) {
    formLogin.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      const login = document.getElementById("blInputLoginLeitor").value.trim();
      const senha = document.getElementById("blSenhaLeitor").value.trim();
      const lembrar = document.getElementById("blLembrarLoginLeitor")?.checked;

      if (!login || !senha) {
        exibirAlertaAcesso("Preencha e-mail ou username e senha.", {
          titulo: "Atenção",
        });
        return;
      }

      const payloadLogin = { login, senha };

      try {
        const resposta = await fetch(`/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payloadLogin),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          exibirAlertaAcesso(dados.error || dados.message || "Erro ao fazer login.", {
            titulo: "Atenção",
          });
          return;
        }

        if (dados.usuario?.tipo === "administrador") {
          limparSessao();
          exibirAlertaAcesso("Este acesso é exclusivo para leitores.", {
            titulo: "Atenção",
          });
          return;
        }

        salvarSessaoLogin(dados.token, dados.usuario, !!lembrar);

        window.location.href = "/pages/usuarios/leitor/principal.html";
      } catch (erro) {
        console.error("Erro no login:", erro);
        exibirAlertaAcesso("Não foi possível conectar ao servidor.", {
          titulo: "Atenção",
        });
      }
    });
  }

  if (formCadastro) {
    formCadastro.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      const nome = document.getElementById("blNomeLeitor").value.trim();
      const email = document.getElementById("blEmailLeitor").value.trim();
      const senha = document.getElementById("blSenhaLeitor").value.trim();
      const username = document.getElementById("blUsuarioLeitor").value.trim();

      if (!nome || !email || !senha || !username) {
        exibirAlertaAcesso("Preencha nome, username, e-mail e senha.", {
          titulo: "Atenção",
        });
        return;
      }

      try {
        const resposta = await fetch(`/usuarios`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome,
            email,
            username,
            senha,
            tipo: "usuario",
          }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          exibirAlertaAcesso(dados.error || dados.message || "Erro ao cadastrar.", {
            titulo: "Atenção",
          });
          return;
        }

        exibirAlertaAcesso("Cadastro realizado com sucesso!", {
          titulo: "Sucesso",
          redirect: "/pages/usuarios/leitor/login.html",
        });
      } catch (erro) {
        console.error("Erro no cadastro:", erro);
        exibirAlertaAcesso("Não foi possível conectar ao servidor.", {
          titulo: "Atenção",
        });
      }
    });
  }
});
