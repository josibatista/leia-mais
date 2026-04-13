# 📚 Leia+ 

O **Leia+** é uma plataforma digital desenvolvida para o projeto de extensão **Meninas Digitais (UTFPR-CP)**, com foco no apoio à ação **Leia Mulheres**. O objetivo principal é incentivar a leitura, dando foco à autoras mulheres, para que mais pessoas criem ou retomem o hábito de ler através de uma experiência gamificada, trilhas de conhecimento e um acervo curado.

---

## 🔍 Sobre o Projeto

O sistema foi concebido para dar visibilidade a escritoras e oferecer uma jornada de leitura progressiva. Utilizando metodologias ágeis e uma arquitetura de dados híbrida, o Leia+ permite que os usuários acompanhem seu progresso, conquistem insígnias e participem de uma comunidade focada no protagonismo feminino na literatura.

### Principais Funcionalidades
* **Trilhas de Leitura:** Jornadas temáticas com níveis de complexidade crescente.
* **Gamificação:** Sistema de metas diárias/mensais e conquista de insígnias.
* **Acervo Digital:** Catálogo detalhado de obras e biografias de autoras.
* **Painel Administrativo:** Gestão de conteúdo e relatórios de engajamento para a equipe de extensão.
* (futura) **Clube do Livro:** Fórum para discussões e compartilhamento de resenhas.
  
---

## 🛠️ Stack Tecnológica

O projeto utiliza uma abordagem **Full-Stack**:

* **Frontend:** HTML5, CSS3 e JavaScript.
* **Design & Prototipação:** Figma.
* **Backend & Auth:** [Supabase](https://supabase.com/) (Autenticação e Banco Relacional).
* **Banco de Dados NoSQL:** [MongoDB Atlas](https://www.mongodb.com/atlas) (Estrutura flexível para as Trilhas).
* **Hospedagem:** GitHub Pages.
* **Documentação:** Overleaf (LaTeX).

---

## 👥 Equipe e Organização

O desenvolvimento segue a metodologia **Scrum**, adaptada para uma estrutura de *Feature Teams*:

<table>
  <thead>
    <tr>
      <th>Papel</th>
      <th>Integrante</th>
      <th>Funcao</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Product Owner & QA</strong></td>
      <td><a href="https://github.com/josibatista">Josiane</a></td>
      <td>Gestão de Backlog e Qualidade</td>
    </tr>
    <tr>
      <td rowspan="2"><strong>Feature Team A</strong></td>
      <td><a href="https://github.com/pamelaBertiBraz">Pamela</a></td>
      <td>Back-end</td>
    </tr>
    <tr>
      <td><a href="https://github.com/beatriz-lopes">Beatriz</a></td>
      <td>Front-end</td>
    </tr>
    <tr>
      <td rowspan="2"><strong>Feature Team B</strong></td>
      <td><a href="https://github.com/nadiayuzawa">Nádia</a></td>
      <td>Back-end</td>
    </tr>
    <tr>
      <td><a href="https://github.com/mariandj">Maria</a></td>
      <td>Front-end</td>
    </tr>
  </tbody>
</table>

A gestão do fluxo de trabalho e o acompanhamento das *Sprints* são centralizados no **Trello**, assegurando transparência e organização em todas as entregas.

---

## 📈 Arquitetura do Sistema

A solução adota uma **Arquitetura Híbrida**, onde:
1.  **Supabase** gerencia a integridade dos perfis de usuários e segurança (RLS).
2.  **MongoDB** armazena os documentos dinâmicos das trilhas de leitura.
3.  **GitHub Pages** serve a interface do sistema.

