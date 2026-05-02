document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8080";

  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!token || !usuario) {
    alert("Faça login novamente.");
    window.location.href = "loginLeitor.html";
    return;
  }

  console.log("USUARIO:", usuario);

  //preencher dados
  document.getElementById("blSaudacao").textContent = `Olá, ${usuario.nome}`;
  document.getElementById("blNomePerfil").textContent = usuario.nome || "—";
  document.getElementById("blUsuarioPerfil").textContent = usuario.username || "—";
  document.getElementById("blSenhaPerfil").textContent = "********";

  //avatar
  const letra = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "?";
  document.getElementById("blLetraPerfil").textContent = letra;

  //editar
  const botoesEditar = document.querySelectorAll(".blIconeEditar");

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

        localStorage.setItem("usuario", JSON.stringify(dados));

        alert("Atualizado com sucesso!");
        location.reload();
      } catch (erro) {
        console.error(erro);
        alert("Erro ao atualizar.");
      }
    });
  });
});