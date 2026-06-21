# Relatório de Implementação de Requisitos Funcionais

| ID   | Descrição do Requisito                                                                                                                                     | Prioridade | Implementado |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------- |
| RF01 | O sistema deve permitir que o usuário gerencie seu perfil pessoal.                                                                                         | Essencial  |    ✅    |
| RF02 | O sistema deve permitir que o usuário se autentique (login), obrigatoriamente, mediante nome de usuário (ou email) e senha.                                | Essencial  |    ✅    |
| RF03 | O sistema deve permitir que o usuário encerre sua sessão (logout) a qualquer momento.                                                                      | Importante |    ✅    |
| RF04 | O sistema deve permitir que o usuário solicite a exclusão definitiva de sua conta, exigindo confirmação de segurança antes da deleção dos dados.           | Essencial  |    ✅    |
| RF05 | O sistema deve restringir o acesso de usuários não autenticados apenas à consulta do acervo “Leia Mulheres” e catálogo de trilhas.                         | Importante |    ✅    |
| RF06 | O sistema deve exibir um menu de navegação para acesso às funcionalidades da plataforma.                                                                   | Essencial  |    ✅    |
| RF07 | O sistema deve exibir no perfil do usuário indicadores visuais de progresso: quantidade de livros lidos, quantidade de xp e páginas lidas.                | Importante |    ✅    |
| RF08 | O sistema deve disponibilizar um campo para o usuário registrar o número de páginas lidas em um determinado período.                                       | Desejável  |    ✅    |
| RF09 | O sistema deve permitir que o usuário atribua uma nota (1 a 5 estrelas) aos livros lidos.                                                                  | Desejável  |    ✅    |
| RF10 | O sistema deve oferecer recursos para que o usuário compartilhe seu progresso em formato de mídia externa.                                                 | Desejável  |    ❎    |
| RF11 | O sistema deve permitir que o usuário estabeleça metas de leitura personalizáveis por períodos diários, semanais ou mensais.                               | Desejável  |    ❎    |
| RF12 | O sistema deve exibir no perfil do usuário o status da meta de leitura mais recente estabelecida.                                                          | Desejável  |    ❎    |
| RF13 | O sistema deve exibir automaticamente as insígnias alcançadas no perfil do usuário correspondente ao seu nível de XP.                                      | Desejável  |    ❎    |
| RF14 | O sistema deve permitir que o usuário visualize o status de seus livros (para ler, lendo e lidos).                                                         | Desejável  |    ✅    |
| RF15 | O sistema deve permitir que o usuário visualize o status de suas trilhas (salvas, pausadas e concluídas).                                               | Desejável  |    ✅    |
| RF16 | O sistema deve somar pontos de XP, automaticamente, no perfil do usuário ao concluir trilhas inteiras.                                                     | Desejável  |    ✅    |
| RF17 | O sistema deve permitir que o usuário registre resenhas e opiniões sobre as obras em leitura ou concluídas.                                                | Desejável  |    ❎    |
| RF18 | O sistema deve apresentar interface de consulta ao catálogo de livros (acervo) pertencente ao projeto “Leia Mulheres”.                                     | Essencial  |    ✅    |
| RF19 | O sistema deve exibir informações detalhadas sobre as autoras e livros, presente no acervo “Leia Mulheres”.                                                 | Desejável  |    ⚠️    |
| RF20 | O sistema deve permitir busca de livros por título, autora ou gênero.                                                                                       | Desejável  |    ✅    |
| RF21 | O sistema deve permitir que o usuário acesse, visualize e registre a conclusão de etapas das trilhas de leitura.                                           | Essencial  |    ✅    |
| RF22 | O sistema deve permitir que o usuário pause ou se desvincule de uma trilha de leitura.                                                                     | Importante |    ✅    |
| RF23 | O sistema deve restringir o usuário a apenas uma trilha ativa por vez, pausando automaticamente a anterior ao iniciar uma nova.                            | Importante |    ✅    |
| RF24 | O sistema deve registrar e armazenar o histórico de progresso individual do usuário em cada trilha de leitura realizada.                                   | Essencial  |    ✅    |
| RF25 | O sistema deve permitir que usuários sugiram temas específicos para a criação de novas trilhas de leitura.                                                 | Desejável  |    ❎    |
| RF26 | O sistema deve permitir o cadastro de novos administradores exclusivamente por usuários que possuam perfil de administrador.                               | Importante |    ✅    |
| RF27 | O sistema deve permitir que apenas administradores gerenciem livros do acervo do projeto “Leia Mulheres”.                                                  | Essencial  |    ✅    |
| RF28 | O sistema deve permitir que apenas administradores gerenciem autoras e vincule a livros do acervo.                                                         | Importante |    ⚠️    |
| RF29 | O sistema deve permitir que apenas administradores gerenciem as trilhas de leitura.                                                                        | Essencial  |    ✅    |
| RF30 | O sistema deve permitir que administradores categorizem e listem trilhas de leitura baseadas em temas específicos.                                         | Importante |    ✅    |
| RF31 | O sistema deve calcular e exibir para administradores a média de páginas/livros lidos pelos usuários por período.                                          | Importante |    ⚠️    |
| RF32 | O sistema deve permitir que administradores acessem relatórios em formato de gráficos (dashboards) sobre usuários, livros, autoras e trilhas.              | Importante |    ✅    |
| RF33 | O sistema deve permitir que o administrador realize o download dos relatórios nos formatos CSV e PDF.                                                      | Desejável  |    ⚠️    |
| RF34 | O sistema deve permitir que os administradores criem e gerenciem desafios de leitura para os usuários.                                                     | Desejável  |    ❎    |
| RF35 | O sistema deve disponibilizar fóruns de discussão vinculados aos livros ou desafios.                                                                       | Desejável  |    ❎    |
| RF36 | O sistema deve gerar ícone com a inicial do nome do usuário para o perfil.                                                                                 | Desejável  |    ✅    |
| RF37 | O sistema deve fornecer configurações de preferências do aplicativo.                                                                                       | Importante |    ✅    |
| RF38 | O sistema deve permitir que usuários com múltiplos níveis de acesso alternem entre os modos de perfil (administrador e leitor) diretamente pela interface. | Desejável  |    ❎    |


## Legenda dos Status de Implementação

- ✅ **Implementado** — O requisito foi desenvolvido e está funcionando conforme o esperado.
- ⚠️ **Parcialmente implementado** — O requisito foi desenvolvido, mas ainda necessita de pequenos ajustes ou refinamentos.
- ❎ **Não implementado** — O requisito ainda não foi desenvolvido e constitui trabalho futuro.

<br>

## Resumo Geral da Implementação

| Status | Quantidade | IDs dos Requisitos |
|--------|------------|-------------------|
| ✅ Implementado | 25 | RF01, RF02, RF03, RF04, RF05, RF06, RF07, RF08, RF09, RF14, RF15, RF16, RF18, RF20, RF21, RF22, RF23, RF24, RF26, RF27, RF29, RF30, RF32, RF36, RF37 |
| ⚠️ Parcialmente implementado | 4 | RF19, RF28, RF31, RF33 |
| ❎ Não implementado | 9 | RF10, RF11, RF12, RF13, RF17, RF25, RF34, RF35, RF38 |
| **Total** | **38** | — |

## Visão Geral por Prioridade

| Prioridade | Total | ✅ | ⚠️ | ❎ |
|------------|-------|----|----|-----|
| Essencial  |   9   |  9 |  0 |  0  |
| Importante |  11   |  9 |  2 |  0  |
| Desejável  |  18   |  7 |  2 |  9  |
| **Total**  | **38**| **25** | **4** | **9** |

