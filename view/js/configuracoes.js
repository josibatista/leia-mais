document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8080";

  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!token || !usuario) {
    alert("Faça login novamente.");
    window.location.href = "loginLeitor.html";
    return;
  }

  document.getElementById("blSaudacao").textContent = `Olá, ${usuario.nome}!`;
  document.getElementById("blNomePerfil").textContent = usuario.nome;
  document.getElementById("blUsuarioPerfil").textContent = usuario.username;
  document.getElementById("blEmailPerfil").textContent = usuario.email;
  document.getElementById("blSenhaPerfil").textContent = "********";

  const botoesEditar = document.querySelectorAll(".blBotaoEditar");

  botoesEditar.forEach((botao) => {
    botao.addEventListener("click", async () => {
      const campo = botao.dataset.campo;

      let novoValor = prompt(`Digite o novo valor para ${campo}:`);

      if (!novoValor) {
        return;
      }

      novoValor = novoValor.trim();

      const dadosAtualizados = {
        [campo]: novoValor,
      };

      try {
        const resposta = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dadosAtualizados),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          alert(dados.error || "Erro ao atualizar dados.");
          return;
        }

        localStorage.setItem("usuario", JSON.stringify(dados));

        alert("Dados atualizados com sucesso!");
        location.reload();
      } catch (erro) {
        console.error("Erro ao atualizar usuário:", erro);
        alert("Não foi possível atualizar os dados.");
      }
    });
  });

  const botaoApagarConta = document.getElementById("blApagarConta");

  botaoApagarConta.addEventListener("click", async () => {
    const confirmar = confirm(
      "Tem certeza que deseja apagar sua conta? Essa ação não poderá ser desfeita.",
    );

    if (!confirmar) {
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resposta.ok) {
        const dados = await resposta.json();
        alert(dados.error || "Erro ao apagar conta.");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      alert("Conta apagada com sucesso.");
      window.location.href = "loginLeitor.html";
    } catch (erro) {
      console.error("Erro ao apagar conta:", erro);
      alert("Não foi possível apagar a conta.");
    }
  });
});
