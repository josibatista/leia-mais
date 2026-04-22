document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:8080';

    const formLogin = document.getElementById('blFormLoginLeitor');
    const formCadastro = document.getElementById('blFormCadastroLeitor');

    if (formLogin) {
        formLogin.addEventListener('submit', async (evento) => {
            evento.preventDefault();

            const email = document.getElementById('blEmailLeitor').value.trim();
            const senha = document.getElementById('blSenhaLeitor').value.trim();

            if (!email || !senha) {
                alert('Preencha e-mail e senha.');
                return;
            }

            try {
                const resposta = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, senha })
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    alert(dados.error || 'Erro ao fazer login.');
                    return;
                }

                localStorage.setItem('token', dados.token);
                localStorage.setItem('usuario', JSON.stringify(dados.usuario));

                alert('Login realizado com sucesso!');
             
                window.location.href = 'index.html';

            } catch (erro) {
                console.error('Erro no login:', erro);
                alert('Não foi possível conectar ao servidor.');
            }
        });
    }

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (evento) => {
            evento.preventDefault();

            const nome = document.getElementById('blNomeLeitor').value.trim();
            const email = document.getElementById('blEmailLeitor').value.trim();
            const senha = document.getElementById('blSenhaLeitor').value.trim();

            if (!nome || !email || !senha) {
                alert('Preencha nome, e-mail e senha.');
                return;
            }

            try {
                const resposta = await fetch(`${API_URL}/usuarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome,
                        email,
                        senha,
                        tipo: 'usuario'
                    })
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    alert(dados.error || 'Erro ao cadastrar.');
                    return;
                }

                alert('Cadastro realizado com sucesso!');
                window.location.href = 'loginLeitor.html';

            } catch (erro) {
                console.error('Erro no cadastro:', erro);
                alert('Não foi possível conectar ao servidor.');
            }
        });
    }
});