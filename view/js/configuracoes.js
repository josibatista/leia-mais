document.addEventListener("DOMContentLoaded", async () => {

  let token = localStorage.getItem("token");
  let usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!token || !usuario) {
    alert("Faça login novamente.");
    window.location.href = "loginLeitor.html";
    return;
  }

  async function carregarUsuario() {
    try {
      const res = await fetch(`/usuarios/${usuario.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      usuario = data;
      localStorage.setItem("usuario", JSON.stringify(data));

      preencherTela();

    } catch (erro) {
      console.error(erro);
      alert("Sessão expirada.");
      localStorage.clear();
      window.location.href = "loginLeitor.html";
    }
  }

  function preencherTela() {
    document.getElementById("blNomePerfil").textContent = usuario.nome;
    document.getElementById("blUsuarioPerfil").textContent = usuario.username;
    document.getElementById("blEmailPerfil").textContent = usuario.email;
    document.getElementById("blSenhaPerfil").textContent = "********";
  }

  await carregarUsuario();

  const botoesEditar = document.querySelectorAll(".blBotaoEditar");

  botoesEditar.forEach((botao) => {
    botao.addEventListener("click", async () => {
      const campo = botao.dataset.campo;

      let novoValor = prompt(`Digite o novo valor para ${campo}:`);
      if (!novoValor) return;

      novoValor = novoValor.trim();

      if (campo === "senha") {
        if (novoValor.length < 8 ||
            !/[a-zA-Z]/.test(novoValor) ||
            !/\d/.test(novoValor) ||
            !/[!@#$%^&*(),.?\":{}|<>]/.test(novoValor)) {
          alert("Senha deve ter 8+ caracteres, letra, número e especial.");
          return;
        }
      }

      try {
        const res = await fetch(`/usuarios/${usuario.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [campo]: novoValor }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error);
          return;
        }

        usuario = data;
        localStorage.setItem("usuario", JSON.stringify(data));

        preencherTela();
        alert("Atualizado com sucesso!");

      } catch (erro) {
        console.error(erro);
        alert("Erro ao atualizar.");
      }
    });
  });

  document.getElementById("blApagarConta").addEventListener("click", async () => {
    const confirmar = confirm("Deseja realmente apagar sua conta?");

    if (!confirmar) return;

    try {
      const res = await fetch(`/usuarios/${usuario.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        return;
      }

      localStorage.clear();
      alert("Conta apagada com sucesso.");
      window.location.href = "loginLeitor.html";

    } catch (erro) {
      console.error(erro);
      alert("Erro ao apagar conta.");
    }
  });

  /* SOBROU DO MENU ANTIGO 
  
  const botaoSair = document.querySelector(".blBotaoSair");

  if (botaoSair) {
    botaoSair.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "loginLeitor.html";
    });
  } */

  document.getElementById("blGithub").addEventListener("click", () => {
    window.open("https://github.com/josibatista/leia-mais", "_blank");
  });
});