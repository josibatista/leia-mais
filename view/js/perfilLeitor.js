document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "http://localhost:8080";

  const token = localStorage.getItem("token");
  let usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!token || !usuario) {
    alert("Faça login novamente.");
    window.location.href = "loginLeitor.html";
    return;
  }

  async function carregarUsuarioAtualizado() {
    try {
      const resposta = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || "Erro ao carregar usuário.");
      }

      // Atualiza localStorage
      localStorage.setItem("usuario", JSON.stringify(dados));
      usuario = dados;

      preencherDados();
    } catch (erro) {
      console.error("Erro ao buscar usuário:", erro);
      alert("Sessão inválida. Faça login novamente.");
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "loginLeitor.html";
    }
  }

  function preencherDados() {
    document.getElementById("blNomePerfil").textContent = usuario.nome || "—";
    document.getElementById("blUsuarioPerfil").textContent = usuario.username || "—";

    const letra = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "?";
    document.getElementById("blLetraPerfil").textContent = letra;
  }

  await carregarUsuarioAtualizado();

/*  const botoesEditar = document.querySelectorAll(".blIconeEditar");

  botoesEditar.forEach((botao) => {
    botao.addEventListener("click", async () => {
      const campo = botao.dataset.campo;

      if (!campo) {
        alert("Campo não identificado.");
        return;
      }

      let novoValor = prompt(`Digite o novo valor para ${campo}:`);
      if (!novoValor) return;

      novoValor = novoValor.trim();
      if (campo === "senha") {
        if (
          novoValor.length < 8 ||
          !/[a-zA-Z]/.test(novoValor) ||
          !/\d/.test(novoValor) ||
          !/[!@#$%^&*(),.?":{}|<>]/.test(novoValor)
        ) {
          alert("A senha deve ter no mínimo 8 caracteres, uma letra, um número e um caractere especial.");
          return;
        }
      }

      try {
        const resposta = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [campo]: novoValor }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          alert(dados.error || "Erro ao atualizar.");
          return;
        }

        // Atualiza usuário local
        localStorage.setItem("usuario", JSON.stringify(dados));
        usuario = dados;

        preencherDados();

        alert("Atualizado com sucesso!");
      } catch (erro) {
        console.error(erro);
        alert("Erro ao atualizar.");
      }
    });
  }); */

  const botaoSair = document.querySelector(".blBotaoSair");

  if (botaoSair) {
    botaoSair.addEventListener("click", (e) => {
      e.preventDefault();

      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      window.location.href = "loginLeitor.html";
    });
  }
});