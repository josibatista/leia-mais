document.addEventListener("DOMContentLoaded", () => {

  const inputSenha = document.getElementById("blSenhaAdm");
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

  const formCadastro = document.getElementById("blFormCadastroAdm");
  const formLogin = document.getElementById("blFormLoginAdm");

  if (formCadastro) {
    if (!protegerRotaAdmin()) {
      return;
    }

    const token = obterToken();

    formCadastro.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      const nome = document.getElementById("blNomeAdm").value.trim();
      const email = document.getElementById("blEmailAdm").value.trim();
      const senha = document.getElementById("blSenhaAdm").value.trim();
      const username = document.getElementById("blUsuarioAdm").value.trim();

      if (!nome || !email || !senha || !username) {
        exibirAlertaAcesso("Preencha todos os campos.", { titulo: "Atenção" });
        return;
      }

      try {
        const resposta = await fetch(`/usuarios`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome,
            email,
            username,
            senha,
            tipo: "administrador",
          }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          exibirAlertaAcesso(dados.error || "Erro ao cadastrar administrador.", {
            titulo: "Atenção",
          });
          return;
        }

        exibirAlertaAcesso("Administrador cadastrado com sucesso!", {
          titulo: "Sucesso",
          redirect: "/pages/usuarios/usuarios.html",
        });
      } catch (erro) {
        console.error("Erro no cadastro:", erro);
        exibirAlertaAcesso("Não foi possível conectar ao servidor.", {
          titulo: "Atenção",
        });
      }
    });
  }

  if (formLogin) {
    formLogin.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      const login = document.getElementById("blInputLoginAdm").value.trim();
      const senha = document.getElementById("blSenhaAdm").value.trim();
      const lembrar = document.getElementById("blLembrarLoginAdm")?.checked;

      if (!login || !senha) {
        exibirAlertaAcesso("Preencha e-mail/usuário e senha.", { titulo: "Atenção" });
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

        if (dados.usuario?.tipo !== "administrador") {
          limparSessao();
          exibirAlertaAcesso("Este acesso é exclusivo para administradores.", {
            titulo: "Atenção",
          });
          return;
        }

        salvarSessaoLogin(dados.token, dados.usuario, !!lembrar);

        window.location.href = "/pages/livros/acervoLivros.html";
      } catch (erro) {
        console.error("Erro no login:", erro);
        exibirAlertaAcesso("Não foi possível conectar ao servidor.", {
          titulo: "Atenção",
        });
      }
    });
  }
});
