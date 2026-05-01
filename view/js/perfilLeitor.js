document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    alert("Usuário não encontrado. Faça login novamente.");
    window.location.href = "loginLeitor.html";
    return;
  }

  const letra = usuario.nome.charAt(0).toUpperCase();
  document.getElementById("blLetraPerfil").textContent = letra;
  document.getElementById("blSaudacao").textContent = `Olá, ${usuario.nome}!`;
  document.getElementById("blNomePerfil").textContent = usuario.nome;
  document.getElementById("blUsuarioPerfil").textContent = usuario.email;
  document.getElementById("blSenhaPerfil").textContent = "********";
});
