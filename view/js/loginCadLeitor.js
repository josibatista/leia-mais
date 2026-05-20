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

      if (!login || !senha) {
        alert("Preencha e-mail ou username e senha.");
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
          alert(dados.error || dados.message || "Erro ao fazer login.");
          return;
        }

        if (dados.usuario?.tipo === "administrador") {
          exibirAlerta("Este acesso é exclusivo para leitores.");
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          return;
        }

        localStorage.setItem("token", dados.token);
        localStorage.setItem("usuario", JSON.stringify(dados.usuario));

        window.location.href = "acervoLivros.html";
      } catch (erro) {
        console.error("Erro no login:", erro);
        alert("Não foi possível conectar ao servidor.");
      }
    });
  }

  function exibirAlerta(mensagem, titulo = "Atenção") {
    const overlay = document.getElementById("lmAlertaOverlay");
    const tituloAlerta = document.getElementById("lmAlertaTitulo");
    const mensagemAlerta = document.getElementById("lmAlertaMensagem");
    const botaoAlerta = document.getElementById("lmAlertaBotao");

    if (!overlay || !tituloAlerta || !mensagemAlerta || !botaoAlerta) {
      exibirAlerta("Este acesso é exclusivo para leitores.");
      return;
    }

    tituloAlerta.textContent = titulo;
    mensagemAlerta.textContent = mensagem;
    overlay.classList.add("ativo");

    botaoAlerta.onclick = () => {
      overlay.classList.remove("ativo");
    };
  }

  if (formCadastro) {
    formCadastro.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      const nome = document.getElementById("blNomeLeitor").value.trim();
      const email = document.getElementById("blEmailLeitor").value.trim();
      const senha = document.getElementById("blSenhaLeitor").value.trim();
      const username = document.getElementById("blUsuarioLeitor").value.trim();

      if (!nome || !email || !senha || !username) {
        alert("Preencha nome, username, e-mail e senha.");
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
          alert(dados.error || dados.message || "Erro ao cadastrar.");
          return;
        }

        alert("Cadastro realizado com sucesso!");
        window.location.href = "loginLeitor.html";
      } catch (erro) {
        console.error("Erro no cadastro:", erro);
        alert("Não foi possível conectar ao servidor.");
      }
    });
  }
});