const SUPABASE_URL = 'https://htregzpvwyhrrqdzqtrd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_F5w-U17IUYOQoZySjx0RQQ_UdYMH0MP';
const SUPABASE_BUCKET = 'capa-livros';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_URL = 'http://localhost:8080';

const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!token || !usuario || usuario.tipo !== 'administrador') {
  alert('Acesso permitido apenas para administradores.');
  window.location.href = 'loginAdm.html';
} else {
  lmCarregarAutores();
}

const lmApiLivrosUrl = `${API_URL}/livros/admin`;
const lmApiAutoresUrl = `${API_URL}/autores/disponiveis`;

const lmFormularioLivro = document.getElementById('lmCadastroFormularioLivro');
const lmCampoAutor = document.getElementById('idAutor');
const lmCadastroMensagem = document.getElementById('lmCadastroMensagem');
const lmCadastroBotaoVoltar = document.getElementById('lmCadastroBotaoVoltar');

function lmExibirMensagem(texto, tipo) {
  lmCadastroMensagem.textContent = texto;
  lmCadastroMensagem.className = 'lmCadastroMensagem';

  if (tipo) {
    lmCadastroMensagem.classList.add(`lmCadastroMensagem${tipo}`);
  }
}

function lmObterNomeAutor(autor) {
  return autor.nome || 'Autor sem nome';
}

async function lmCarregarAutores() {
  try {
    const resposta = await fetch(lmApiAutoresUrl);

    if (!resposta.ok) {
      throw new Error('Erro ao carregar autores.');
    }

    const dados = await resposta.json();
    const autores = dados.autores || [];

    lmCampoAutor.innerHTML = '<option value="">Selecione um autor</option>';
    lmCampoAutor.disabled = false;

    if (!Array.isArray(autores) || autores.length === 0) {
      lmCampoAutor.innerHTML = '<option value="">Nenhum autor cadastrado</option>';
      lmCampoAutor.disabled = true;
      return;
    }

    autores.forEach(function (autor) {
      const optionAutor = document.createElement('option');

      optionAutor.value = autor.id;
      optionAutor.textContent = lmObterNomeAutor(autor);

      lmCampoAutor.appendChild(optionAutor);
    });
  } catch (erro) {
    lmCampoAutor.innerHTML = '<option value="">Erro ao carregar autores</option>';
    lmCampoAutor.disabled = true;

    lmExibirMensagem('Não foi possível carregar a lista de autores.', 'Erro');
    console.error(erro);
  }
}

async function lmUploadImagemCapa(arquivoImagem) {
  if (!arquivoImagem) {
    return null;
  }

  const extensaoArquivo = arquivoImagem.name.split('.').pop();
  const nomeArquivo = `capa-${Date.now()}.${extensaoArquivo}`;
  const caminhoArquivo = `livros/${nomeArquivo}`;

  const { error } = await supabaseClient.storage
    .from(SUPABASE_BUCKET)
    .upload(caminhoArquivo, arquivoImagem);

  if (error) {
    console.error('Erro Supabase Storage:', error);
    throw new Error(error.message || 'Erro ao enviar imagem da capa.');
  }

  const { data } = supabaseClient.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(caminhoArquivo);

  return data.publicUrl;
}

lmFormularioLivro.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  lmExibirMensagem('Enviando cadastro...', 'Info');

  const titulo = document.getElementById('titulo').value.trim();
  const editora = document.getElementById('editora').value.trim();
  const paginas = document.getElementById('paginas').value.trim();
  const autorId = lmCampoAutor.value;
  const anoPublicacao = document.getElementById('anoPublicacao').value;
  const genero = document.getElementById('genero').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const imagemCapaArquivo = document.getElementById('imagemCapa').files[0];

  if (!titulo || !editora || !paginas || !autorId || !anoPublicacao || !genero) {
    lmExibirMensagem('Preencha todos os campos obrigatórios.', 'Erro');
    return;
  }

  try {
    const imagemCapaUrl = await lmUploadImagemCapa(imagemCapaArquivo);
    const respostaLivro = await fetch(lmApiLivrosUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        titulo,
        editora,
        paginas,
        anoPublicacao,
        genero,
        descricao,
        imagemCapa: imagemCapaUrl
      })
    });

    const dadosLivro = await respostaLivro.json();

    if (!respostaLivro.ok) {
      throw new Error(dadosLivro.error || 'Erro ao cadastrar livro.');
    }

    const livroId = dadosLivro.livro.id;

    const respostaVinculo = await fetch(`${API_URL}/livros/${livroId}/autores/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        autoresIds: [Number(autorId)]
      })
    });

    const dadosVinculo = await respostaVinculo.json();

    if (!respostaVinculo.ok) {
      throw new Error(dadosVinculo.error || 'Livro cadastrado, mas não foi possível vincular o autor.');
    }

    lmFormularioLivro.reset();
    lmExibirMensagem('Livro cadastrado com sucesso.', 'Sucesso');
  } catch (erro) {
    lmExibirMensagem(erro.message || 'Não foi possível cadastrar o livro.', 'Erro');
    console.error(erro);
  }
});

lmCadastroBotaoVoltar.addEventListener('click', function () {
  window.history.back();
});

lmCarregarAutores();