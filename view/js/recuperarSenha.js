document.addEventListener("DOMContentLoaded", () => {

  const inputSenha = document.getElementById('blSenha');
  const olhoSenha = document.getElementById('blOlhoSenha');

  olhoSenha.addEventListener('click', () => {

    if(inputSenha.type === 'password'){
      inputSenha.type = 'text';

      olhoSenha.classList.remove('fa-eye');
      olhoSenha.classList.add('fa-eye-slash');
    } else {
      inputSenha.type = 'password';
      
      olhoSenha.classList.remove('fa-eye-slash');
      olhoSenha.classList.add('fa-eye');
    }
  })

  const formRecuperar = document.getElementById("blFormuRecuperarSenha");

  if (formRecuperar) {
    formRecuperar.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("blEmailRecuperacao").value.trim();

      if (!email) {
        alert("Digite seu e-mail.");
        return;
      }

      try {
        const resposta = await fetch(`/esqueci-senha`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          alert(dados.error || "Erro ao enviar código.");
          return;
        }

        alert("Código gerado com sucesso! (Ambiente de teste: verifique o terminal do servidor)");

        localStorage.setItem("emailRecuperacao", email);
        window.location.href = "novaSenha.html";

      } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao conectar com o servidor.");
      }
    });
  }

  const formNovaSenha = document.getElementById("blFormNovaSenha");

  if (formNovaSenha) {
    formNovaSenha.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = localStorage.getItem("emailRecuperacao");
      const codigo = document.getElementById("codigo").value.trim();
      const novaSenha = document.getElementById("novaSenha").value.trim();

      if (!email) {
        alert("Sessão expirada. Tente novamente.");
        window.location.href = "recuperarSenha.html";
        return;
      }

      if (!codigo || !novaSenha) {
        alert("Preencha código e nova senha.");
        return;
      }

      if (novaSenha.length < 8) {
        alert("A senha deve ter no mínimo 8 caracteres.");
        return;
      }

      if (!/[a-zA-Z]/.test(novaSenha)) {
        alert("A senha deve conter pelo menos uma letra.");
        return;
      }

      if (!/\d/.test(novaSenha)) {
        alert("A senha deve conter pelo menos um número.");
        return;
      }

      if (!/[!@#$%^&*(),.?\":{}|<>]/.test(novaSenha)) {
        alert("A senha deve conter pelo menos um caractere especial.");
        return;
      }

      try {
        const res = await fetch(`/redefinir-senha`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, codigo, novaSenha }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Erro ao redefinir senha.");
          return;
        }

        alert("Senha alterada com sucesso!");

        localStorage.removeItem("emailRecuperacao");
        window.location.href = "loginLeitor.html";

      } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao conectar com o servidor.");
      }
    });
  }
});