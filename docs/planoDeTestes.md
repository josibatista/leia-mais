# Plano de Testes – Leia+

## 1. Identificação do Documento

| Item | Descrição |
|--------|--------|
| Projeto | Leia+ |
| Versão | 1.0 |
| Tipo de Documento | Plano de Testes |
| Responsável | Equipe de Qualidade |
| Data | A definir |

---

## 2. Objetivo

Este plano de testes tem como objetivo definir a estratégia de validação do sistema Leia+, garantindo que as funcionalidades essenciais estejam operando conforme os requisitos especificados, com foco na experiência do usuário, integridade dos dados e funcionamento adequado dos fluxos críticos da aplicação.

---

## 3. Escopo

Serão testadas as funcionalidades classificadas como Essenciais e Importantes nos requisitos do projeto.

### Incluído no Escopo

- Autenticação de usuários;
- Gerenciamento de perfis;
- Consulta ao acervo de livros;
- Gerenciamento administrativo de livros;
- Gerenciamento administrativo de autoras;
- Gerenciamento de trilhas de leitura;
- Controle de progresso em trilhas;
- Controle de permissões por perfil;
- Painel administrativo e relatórios;
- Navegação principal da aplicação;
- Responsividade básica;
- Compatibilidade básica entre navegadores.

### Escopo Futuro (desejável)

- Funcionalidades classificadas como Desejáveis;
- Testes de carga e estresse;
- Testes avançados de segurança;
- Testes formais de acessibilidade;
- Testes de recuperação de desastres.

---

## 4. Estratégia de Testes

### 4.1 Testes Funcionais

Objetivo: validar se as funcionalidades implementadas atendem aos requisitos funcionais especificados.

Abrange:

- Fluxos principais do usuário visitante;
- Fluxos principais do usuário leitor;
- Fluxos administrativos;
- Regras de negócio;
- Validações de dados;
- Controle de permissões.

---

### 4.2 Testes de Integração

Objetivo: verificar a comunicação correta entre os componentes da aplicação.

Abrange:

- Front-end ↔ Backend;
- Backend ↔ Supabase;
- Backend ↔ MongoDB;
- Integração entre módulos de usuários, livros e trilhas.

---

### 4.3 Testes Smoke

Objetivo: verificar rapidamente se as funcionalidades críticas permanecem operacionais após novas implantações.

Abrange:

- Acesso ao sistema;
- Login;
- Consulta ao acervo;
- Consulta de trilhas;
- Acesso administrativo.

---

### 4.4 Testes de Regressão

Objetivo: garantir que alterações realizadas não afetem funcionalidades previamente aprovadas.

Abrange:

- Fluxos críticos de autenticação;
- Consulta ao acervo;
- Controle de trilhas;
- Funcionalidades administrativas.

---

### 4.5 Testes Exploratórios

Objetivo: identificar comportamentos inesperados, problemas de usabilidade e falhas não previstas nos requisitos.

Abrange:

- Navegação geral;
- Fluxos alternativos;
- Comportamentos de erro;
- Experiência de uso.

---

### 4.6 Testes de Compatibilidade e Responsividade

Objetivo: validar o funcionamento adequado da aplicação em diferentes navegadores e tamanhos de tela.

Ambientes previstos:

- Google Chrome;
- Microsoft Edge;
- Chrome Mobile.

Dispositivos:

- Desktop;
- Tablet;
- Smartphone.

---

## 5. Ambiente de Testes

### Aplicação

- Ambiente hospedado via Render;
- Front-end Web Responsivo.

### Tecnologias

- HTML5;
- CSS3;
- JavaScript;
- Supabase;
- MongoDB.

### Dados de Teste

Serão utilizados:

- Usuários leitores;
- Usuários administradores;
- Livros cadastrados;
- Autoras cadastradas;
- Trilhas cadastradas.

---



## 6. Riscos

| Risco | Impacto |
|---------|---------|
| Indisponibilidade do Supabase | Alto |
| Indisponibilidade do MongoDB | Alto |
| Alterações tardias de requisitos | Médio |
| Falta de dados para execução dos testes | Médio |
| Integração incorreta entre bancos distintos | Alto |

---

## 7. Ferramentas

### Testes Manuais

- Navegador Web;
- Planilha de acompanhamento.

### Testes Automatizados

- Playwright.

---

## 8. Cenários de Teste

Os cenários abaixo servirão como base para a futura elaboração dos casos de teste.

### 🏛️ CEN-01 – Cadastro de usuário leitor

Validar o cadastro de novos usuários com dados válidos e inválidos.

**Requisitos:** RF01

---

### 🏛️ CEN-02 – Login de usuário

Validar autenticação utilizando credenciais válidas e inválidas.

**Requisitos:** RF02

---

### 🏛️ CEN-03 – Logout de usuário

Validar encerramento da sessão do usuário.

**Requisitos:** RF03

---

### 🏛️ CEN-04 – Exclusão de conta

Validar exclusão definitiva da conta mediante confirmação.

**Requisitos:** RF04

---

### 🏛️ CEN-05 – Controle de acesso para visitantes

Validar restrições de acesso para usuários não autenticados.

**Requisitos:** RF05

---

### 🏛️ CEN-06 – Navegação principal do sistema

Validar funcionamento do menu de navegação.

**Requisitos:** RF06

---

### 🏛️ CEN-07 – Consulta ao catálogo de livros

Validar visualização do acervo de livros.

**Requisitos:** RF18

---

### 🏛️ CEN-08 – Visualização dos detalhes de livros e autoras

Validar exibição das informações detalhadas.

**Requisitos:** RF19

---

### 🏛️ CEN-09 – Busca de livros

Validar pesquisa por título, autora e gênero.

**Requisitos:** RF20

---

### 🏛️ CEN-10 – Cadastro de livros pelo administrador

Validar inclusão de livros no acervo.

**Requisitos:** RF27

---

### 🏛️ CEN-11 – Edição de livros pelo administrador

Validar alteração de informações de livros.

**Requisitos:** RF27

---

### 🏛️ CEN-12 – Exclusão de livros pelo administrador

Validar remoção de livros do acervo.

**Requisitos:** RF27

---

### 🏛️ CEN-13 – Cadastro de autoras pelo administrador

Validar inclusão de autoras.

**Requisitos:** RF28

---

### 🏛️ CEN-14 – Associação de autoras a livros

Validar vinculação correta entre autora e obra.

**Requisitos:** RF28

---

### 🏛️ CEN-15 – Cadastro de trilhas pelo administrador

Validar criação de trilhas de leitura.

**Requisitos:** RF29, RF30

---

### 🏛️ CEN-16 – Edição de trilhas pelo administrador

Validar alteração das informações das trilhas.

**Requisitos:** RF29

---

### 🏛️ CEN-17 – Exclusão de trilhas pelo administrador

Validar remoção de trilhas.

**Requisitos:** RF29

---

### 🏛️ CEN-18 – Início de trilha de leitura

Validar início de uma trilha pelo usuário.

**Requisitos:** RF21

---

### 🏛️ CEN-19 – Registro de progresso em trilha

Validar conclusão de etapas da trilha.

**Requisitos:** RF21, RF24

---

### 🏛️ CEN-20 – Pausa de trilha

Validar pausa manual da trilha.

**Requisitos:** RF22

---

### 🏛️ CEN-21 – Restrição de trilha ativa

Validar que apenas uma trilha permaneça ativa simultaneamente.

**Requisitos:** RF23

---

### 🏛️ CEN-22 – Consulta do histórico de progresso

Validar armazenamento e recuperação do histórico de trilhas.

**Requisitos:** RF24

---

### 🏛️ CEN-23 – Cadastro de administradores

Validar criação de novos administradores apenas por administradores.

**Requisitos:** RF26

---

### 🏛️ CEN-24 – Acesso ao painel administrativo

Validar acesso exclusivo para administradores.

**Requisitos:** RF31, RF32

---

### 🏛️ CEN-25 – Visualização de métricas administrativas

Validar exibição de indicadores e estatísticas.

**Requisitos:** RF31, RF32

---

### 🏛️ CEN-26 – Compatibilidade entre navegadores

Validar funcionamento nos navegadores suportados.

**Requisitos:** RNF04

---

### 🏛️ CEN-27 – Responsividade da interface

Validar adaptação para dispositivos móveis e desktop.

**Requisitos:** RNF05

---

### 🏛️ CEN-28 – Validação de e-mail

Validar aceitação apenas de e-mails válidos.

**Requisitos:** RNF08

---

### 🏛️ CEN-29 – Validação de senha

Validar regras mínimas de senha.

**Requisitos:** RNF09

---

### 🏛️ CEN-30 – Persistência dos dados

Validar manutenção dos dados após operações de gravação e consulta.

**Requisitos:** RNF12