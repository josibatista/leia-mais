document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080";

    const formCadastro = document.getElementById("blFormCadastroAdm");
    const formLogin = document.getElementById("blFormLoginAdm");

    if (formCadastro) {
        formCadastro.addEventListener("submit", async (evento) => {
            evento.preventDefault();

            const nome = document.getElementById("blNomeAdm").value.trim();
            const email = document.getElementById("blEmailAdm").value.trim();
            const senha = document.getElementById("blSenhaAdm").value.trim();
            const username = document.getElementById("blUsuarioAdm").value.trim();

            if (!nome || !email || !senha || !username) {
                alert("Preencha todos os campos.");
                return;
            }

            try {
                const resposta = await fetch(`${API_URL}/usuarios`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nome,
                        email,
                        username,
                        senha,
                        tipo: "administrador" 
                    }),
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    alert(dados.error || "Erro ao cadastrar administrador.");
                    return;
                }

                alert("Administrador cadastrado com sucesso!");

                window.location.href = "loginAdm.html";
            } catch (erro) {
                console.error("Erro no cadastro:", erro);
                alert("Não foi possível conectar ao servidor.");
            }
        });
    }

    if (formLogin) {
        formLogin.addEventListener("submit", async (evento) => {
            evento.preventDefault();

            const login = document.getElementById("blInputLoginAdm").value.trim();
            const senha = document.getElementById("blSenhaAdm").value.trim();

            if (!login || !senha) {
                alert("Preencha e-mail/usuário e senha.");
                return;
            }

            try {
                const resposta = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ login, senha }),
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    alert(dados.error || "Erro ao fazer login.");
                    return;
                }

                //garantir que é admin
                if (dados.usuario.tipo !== "administrador") {
                    alert("Acesso permitido apenas para administradores.");
                    return;
                }

                localStorage.setItem("token", dados.token);
                localStorage.setItem("usuario", JSON.stringify(dados.usuario));

                alert("Login realizado com sucesso!");

                window.location.href = "perfilLeitor.html";

            } catch (erro) {
                console.error("Erro no login:", erro);
                alert("Não foi possível conectar ao servidor.");
            }
        });
    }
});