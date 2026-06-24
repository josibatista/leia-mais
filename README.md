# 📚 Leia+
![imagem](views/assets/capa.png)

O **Leia+** é uma plataforma digital desenvolvida para o projeto de extensão **Meninas Digitais (UTFPR-CP)**, com foco no apoio à ação **Leia Mulheres**. O objetivo principal é incentivar a leitura, dando foco à autoras mulheres, para que mais pessoas criem ou retomem o hábito de ler através de uma experiência gamificada, trilhas de conhecimento e um acervo curado.

## 🏷️ Badges

![HTML5](https://img.shields.io/badge/html5%20-%23E34F26.svg?&style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3%20-%231572B6.svg?&style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F0DB4F?style=for-the-badge&logo=javascript&logoColor=black)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Supabase](https://img.shields.io/badge/-Supabase-333333?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![MongoDB](https://img.shields.io/badge/-MongoDB-13aa52?style=for-the-badge&logo=mongodb&logoColor=white)
![Figma](https://img.shields.io/badge/-Figma-333333?style=for-the-badge&logo=figma&logoColor=white)
![Render](https://img.shields.io/badge/-Render-black?style=for-the-badge&logo=render&logoColor=6A07C2)
![Overleaf](https://img.shields.io/badge/-Overleaf-white?style=for-the-badge&logo=overleaf&logoColor=#098842)
![Markdown](https://img.shields.io/badge/-Markdown-00A8DE?style=for-the-badge&logo=markdown&logoColor=white)


## 📑 Índice
* [Sobre o Sistema](#-sobre-o-sistema) 
* [Como Rodar o Projeto](#-como-rodar-o-projeto) 
* [Acesso Online](#-acesso-online)
* [Documentação](#documentação) 
* [Equipe e Organização](#-equipe-e-organização) 

<br>

## 🔍 Sobre o Sistema

O sistema foi concebido para dar visibilidade a escritoras e oferecer uma jornada de leitura progressiva. Utilizando metodologias ágeis e uma arquitetura de dados híbrida, o Leia+ permite que os usuários acompanhem seu progresso, conquistem insígnias e participem de uma comunidade focada no protagonismo feminino na literatura.

### ✨ Principais Funcionalidades

- **Trilhas de Leitura:** Jornadas temáticas com níveis de complexidade crescente.
- **Acervo Digital:** Catálogo dos livros disponíveis na estante Leia Mulheres, com listagem das autoras.
- **Painel Administrativo:** Gestão de conteúdo e relatórios de engajamento para a equipe de extensão.
- (futura) **Gamificação:** Sistema de metas diárias/mensais e conquista de insígnias.
- (futura) **Clube do Livro:** Fórum para discussões e compartilhamento de resenhas.


### 🛠️ Stack Tecnológica
O projeto utiliza uma abordagem **Full-Stack**:

- **Front-end:** HTML5, CSS3 e JavaScript.
- **Design & Prototipação:** Figma.
- **Backend & Auth:** Node.js, Express, Sequelize, Mongoose e JWT.
- **Banco de Dados:** [Supabase](https://supabase.com/) (relacional) [MongoDB Atlas](https://www.mongodb.com/atlas) (não-relacional).
- **Hospedagem:** Render.
- **Documentação:** Overleaf (LaTeX) e Markdown.

### 📈 Arquitetura do Sistema

A solução adota uma **Arquitetura Híbrida**, onde:

1.  **Supabase** gerencia a integridade dos perfis de usuários e segurança (RLS), junto das entidades livro e autora.
2.  **MongoDB** armazena os documentos dinâmicos das obras e trilhas de leitura, além de armazenar os relatórios gerados.
3.  **Render** serve a interface do sistema, garantindo a acessibilidade online.

<br>

## 🚀 Como Rodar o Projeto

### 🧩 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

1. **[Node.js](https://nodejs.org/)** (v18.x ou superior)
2. **npm** (incluído com o Node.js)
3. **Conta no [Supabase](https://supabase.com/)** com um projeto criado e a _connection string_ do banco PostgreSQL disponível.
4. **Conta no [MongoDB Atlas](https://www.mongodb.com/atlas)** com um cluster criado e a _connection string_ disponível.
   > Você pode verificar sua versão do Node.js com `node -v` e do npm com `npm -v` no terminal.

---

### ⚙️ Configuração do Ambiente

#### 1. Clone o repositório

```bash
git clone https://github.com/josibatista/leia-mais.git
cd leia-mais
```

#### 2. Instale as dependências

```bash
npm install
```

```bash
npm install mongodb
```

> A instalação do mongodb será solicitada no momento de pegar a string de conexão

#### 3. Configure as variáveis de ambiente

Crie um arquivo chamado `.env` na raiz do projeto (ele já está listado no `.gitignore` e **não deve ser versionado**) e adicione as seguintes variáveis, preenchendo com os dados das suas contas:

```env
# String de conexão do Supabase (PostgreSQL)
SUPABASE_DB_URL="SUPABASE_DB_URL=postgresql://postgres.[ID_DO_PROJETO]:[SUA_SENHA]@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

# String de conexão do MongoDB Atlas
MONGO_DB_URL="mongodb+srv://[USUARIO]:[SENHA]@[CLUSTER].mongodb.net/?appName=[NOME_DO_APP]"

# Chave secreta para criptografia e geração dos tokens JWT
JWT_SECRET=[sua_chave_secreta]
```

> **Como obter as strings de conexão:**
>
> - **Id do Projeto no Supabase:** Acesse seu projeto na dashboard em [supabase.com](https://supabase.com) → _Project Settings_ → _General_, dentro de Configuration → em _General settings_ → copie o valor de _Project ID_.
> - **MongoDB Atlas:** Acesse seu cluster em [cloud.mongodb.com](https://cloud.mongodb.com) → botão _Connect_ → _Drivers_ → copie a string e substitua `<password>` pela senha do seu usuário.

---

### ▶️ Execução

Com as dependências instaladas e o `.env` configurado, inicie o servidor:

```bash
npm start
```

O terminal exibirá as mensagens de confirmação:

```
Iniciando servidor...
Banco de dados Supabase conectado.
Banco de Dados MongoDB conectado.
Servidor rodando em http://localhost:8080
```

O sistema estará disponível em **[http://localhost:8080](http://localhost:8080)**.

<br>

## 🌐 Acesso Online

O Leia+ está disponível online! O site está hospedado no [Render](https://render.com) e pode ser acessado diretamente, sem necessidade de instalação local:

> 🔗 https://leia-mais.onrender.com

<br>

## 📄Documentação e Apresentação

### 📽️ [Vídeo de Apresentação da Versão 1 do Projeto](https://canva.link/krmfavska5r1pm2)

### 📋 [Documento de Projeto Completo](docs/documentoProjeto.pdf)

### 🧪 [Plano de Testes](docs/planoDeTestes.md)

#### ✅ [Casos de Teste](docs/casosDeTestes.md)

### 🔗 [Relatório de Implementação](docs/relatorioImplementacao.md)


<br>

## 👥 Equipe e Organização

### 👩‍💻 Equipe

<table align="center">
  <tr>
    <td align="center" valign="top">
      <img src="views/assets/equipe/josiane.png" alt="Josiane Batista" width="100"/><br />
      <sub><b>Josiane Batista</b></sub><br />
      <sub>Product Owner & QA</sub>
    </td>
    <td align="center" valign="top">
      <img src="views/assets/equipe/pamela.png" alt="Pamela Berti" width="100"/><br />
      <sub><b>Pamela Berti</b></sub><br />
      <sub>Back-end</sub>
    </td>
    <td align="center" valign="top">
      <img src="views/assets/equipe/nadia.png" alt="Nadia Yuzawa" width="100"/><br />
      <sub><b>Nadia Yuzawa</b></sub><br />
      <sub>Back-end</sub>
    </td>
    <td align="center" valign="top">
      <img src="views/assets/equipe/beatriz.png" alt="Beatriz Milanezi" width="100"/><br />
      <sub><b>Beatriz Milanezi</b></sub><br />
      <sub>Front-end</sub>
    </td>
    <td align="center" valign="top">
      <img src="views/assets/equipe/maria.png" alt="Maria Clara de Jesus" width="100"/><br />
      <sub><b>Maria Clara de Jesus</b></sub><br />
      <sub>Front-end</sub>
    </td>
  </tr>
</table>

### 🗂️ Organização

O desenvolvimento segue a metodologia **Scrum** e a gestão do fluxo de trabalho e o acompanhamento das _Sprints_ são centralizados no **Trello**, assegurando transparência e organização em todas as entregas.
