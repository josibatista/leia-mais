# Casos de Teste – Leia+

| Cenário | ID     | Caso de Teste                                         | Pré-condição                  | Resultado Esperado                       |
| ------- | ------ | ----------------------------------------------------- | ----------------------------- | ---------------------------------------- |
| CEN-01  | CT-001 | Realizar cadastro com dados válidos                   | Usuário não cadastrado        | Conta criada com sucesso                 |
| CEN-01  | CT-002 | Realizar cadastro com e-mail já existente             | E-mail previamente cadastrado | Sistema impede cadastro                  |
| CEN-01  | CT-003 | Realizar cadastro com campos obrigatórios vazios      | Nenhuma                       | Sistema informa campos obrigatórios      |
| CEN-01  | CT-004 | Realizar cadastro com e-mail inválido                 | Nenhuma                       | Sistema impede cadastro                  |
| CEN-01  | CT-005 | Realizar cadastro com senha inválida                  | Nenhuma                       | Sistema impede cadastro                  |
| CEN-02  | CT-006 | Realizar login com credenciais válidas                | Usuário cadastrado            | Usuário autenticado                      |
| CEN-02  | CT-007 | Realizar login com senha incorreta                    | Usuário cadastrado            | Mensagem de erro exibida                 |
| CEN-02  | CT-008 | Realizar login com usuário inexistente                | Nenhuma                       | Mensagem de erro exibida                 |
| CEN-02  | CT-009 | Realizar login sem preencher campos                   | Nenhuma                       | Login não realizado                      |
| CEN-03  | CT-010 | Realizar logout após autenticação                     | Usuário autenticado           | Sessão encerrada                         |
| CEN-04  | CT-011 | Excluir conta confirmando operação                    | Usuário autenticado           | Conta removida                           |
| CEN-04  | CT-012 | Cancelar exclusão de conta                            | Usuário autenticado           | Conta mantida                            |
| CEN-05  | CT-013 | Acessar acervo sem autenticação                       | Usuário não autenticado       | Acesso permitido                         |
| CEN-05  | CT-014 | Acessar perfil sem autenticação                       | Usuário não autenticado       | Acesso bloqueado                         |
| CEN-05  | CT-015 | Acessar área administrativa sem autenticação          | Usuário não autenticado       | Acesso bloqueado                         |
| CEN-06  | CT-016 | Navegar entre páginas pelo menu                       | Sistema disponível            | Navegação realizada corretamente         |
| CEN-06  | CT-017 | Selecionar opção inexistente do menu                  | Sistema disponível            | Sistema trata a navegação adequadamente  |
| CEN-07  | CT-018 | Visualizar catálogo de livros                         | Sistema disponível            | Acervo exibido                           |
| CEN-07  | CT-019 | Visualizar catálogo sem livros cadastrados            | Nenhum livro cadastrado       | Mensagem adequada exibida                |
| CEN-08  | CT-020 | Visualizar detalhes de um livro                       | Livro cadastrado              | Informações exibidas corretamente        |
| CEN-08  | CT-021 | Visualizar informações de autora                      | Autora cadastrada             | Informações exibidas corretamente        |
| CEN-09  | CT-022 | Buscar livro por título existente                     | Livro cadastrado              | Livro localizado                         |
| CEN-09  | CT-023 | Buscar livro por autora existente                     | Autora cadastrada             | Livros relacionados exibidos             |
| CEN-09  | CT-024 | Buscar livro por gênero existente                     | Livro cadastrado              | Resultados exibidos                      |
| CEN-09  | CT-025 | Buscar termo inexistente                              | Sistema disponível            | Nenhum resultado encontrado              |
| CEN-10  | CT-026 | Cadastrar livro com dados válidos                     | Administrador autenticado     | Livro cadastrado                         |
| CEN-10  | CT-027 | Cadastrar livro com campos obrigatórios vazios        | Administrador autenticado     | Cadastro impedido                        |
| CEN-10  | CT-028 | Usuário comum tentar cadastrar livro                  | Usuário comum autenticado     | Acesso negado                            |
| CEN-11  | CT-029 | Editar informações de livro existente                 | Livro cadastrado              | Alterações salvas                        |
| CEN-11  | CT-030 | Editar livro informando dados inválidos               | Livro cadastrado              | Alteração impedida                       |
| CEN-12  | CT-031 | Excluir livro existente                               | Livro cadastrado              | Livro removido                           |
| CEN-12  | CT-032 | Cancelar exclusão de livro                            | Livro cadastrado              | Livro mantido                            |
| CEN-13  | CT-033 | Cadastrar autora com dados válidos                    | Administrador autenticado     | Autora cadastrada                        |
| CEN-13  | CT-034 | Cadastrar autora com campos obrigatórios vazios       | Administrador autenticado     | Cadastro impedido                        |
| CEN-14  | CT-035 | Vincular autora a livro                               | Livro e autora cadastrados    | Associação realizada                     |
| CEN-14  | CT-036 | Vincular autora inexistente a livro                   | Livro cadastrado              | Operação impedida                        |
| CEN-15  | CT-037 | Cadastrar trilha com dados válidos                    | Administrador autenticado     | Trilha cadastrada                        |
| CEN-15  | CT-038 | Cadastrar trilha sem informações obrigatórias         | Administrador autenticado     | Cadastro impedido                        |
| CEN-16  | CT-039 | Editar trilha existente                               | Trilha cadastrada             | Alterações salvas                        |
| CEN-16  | CT-040 | Editar trilha com dados inválidos                     | Trilha cadastrada             | Alteração impedida                       |
| CEN-16  | CT-041 | Bloquear trilha existente                             | Trilha cadastrada             | Trilha bloqueada com sucesso             |
| CEN-16  | CT-042 | Liberar trilha existente                              | Trilha bloqueada              | Trilha liberada com sucesso              |
| CEN-17  | CT-043 | Excluir trilha existente                              | Trilha cadastrada             | Trilha removida                          |
| CEN-17  | CT-044 | Cancelar exclusão de trilha                           | Trilha cadastrada             | Trilha mantida                           |
| CEN-18  | CT-045 | Iniciar trilha disponível                             | Usuário autenticado           | Trilha iniciada                          |
| CEN-18  | CT-046 | Iniciar trilha inexistente                            | Usuário autenticado           | Operação impedida                        |
| CEN-19  | CT-047 | Registrar conclusão de etapa da trilha                | Trilha ativa                  | Progresso atualizado                     |
| CEN-19  | CT-048 | Registrar etapa já concluída                          | Etapa previamente concluída   | Sistema mantém consistência do progresso |
| CEN-20  | CT-049 | Pausar trilha ativa                                   | Trilha ativa                  | Status alterado para pausada             |
| CEN-20  | CT-050 | Pausar trilha não iniciada                            | Usuário autenticado           | Operação impedida                        |
| CEN-21  | CT-051 | Iniciar nova trilha com outra ativa                   | Usuário com trilha ativa      | Trilha anterior pausada automaticamente  |
| CEN-21  | CT-052 | Manter apenas uma trilha ativa simultaneamente        | Usuário autenticado           | Apenas uma trilha permanece ativa        |
| CEN-22  | CT-053 | Consultar histórico de trilhas concluídas             | Histórico existente           | Histórico exibido                        |
| CEN-22  | CT-054 | Consultar histórico sem registros                     | Nenhuma trilha realizada      | Mensagem adequada exibida                |
| CEN-23  | CT-055 | Administrador cadastrar novo administrador            | Administrador autenticado     | Cadastro realizado                       |
| CEN-23  | CT-056 | Usuário comum tentar cadastrar administrador          | Usuário comum autenticado     | Operação bloqueada                       |
| CEN-24  | CT-057 | Administrador acessar painel administrativo           | Administrador autenticado     | Painel exibido                           |
| CEN-24  | CT-058 | Usuário comum acessar painel administrativo           | Usuário comum autenticado     | Acesso negado                            |
| CEN-25  | CT-059 | Visualizar métricas administrativas                   | Dados existentes              | Métricas exibidas                        |
| CEN-25  | CT-060 | Visualizar dashboard sem dados                        | Nenhum dado disponível        | Sistema exibe estado vazio adequadamente |
| CEN-26  | CT-061 | Acessar sistema no Google Chrome                      | Sistema disponível            | Funcionamento correto                    |
| CEN-26  | CT-062 | Acessar sistema no Microsoft Edge                     | Sistema disponível            | Funcionamento correto                    |
| CEN-26  | CT-063 | Acessar sistema no Mozilla Firefox                    | Sistema disponível            | Funcionamento correto                    |
| CEN-26  | CT-064 | Acessar sistema no Safari                             | Sistema disponível            | Funcionamento correto                    |
| CEN-26  | CT-065 | Acessar sistema no navegador móvel                    | Sistema disponível            | Funcionamento correto                    |
| CEN-27  | CT-066 | Visualizar sistema em desktop                         | Sistema disponível            | Layout adaptado corretamente             |
| CEN-27  | CT-067 | Visualizar sistema em tablet                          | Sistema disponível            | Layout adaptado corretamente             |
| CEN-27  | CT-068 | Visualizar sistema em smartphone                      | Sistema disponível            | Layout adaptado corretamente             |
| CEN-28  | CT-069 | Informar e-mail válido                                | Tela de cadastro disponível   | E-mail aceito                            |
| CEN-28  | CT-070 | Informar e-mail inválido                              | Tela de cadastro disponível   | E-mail rejeitado                         |
| CEN-29  | CT-071 | Informar senha dentro do padrão definido              | Tela de cadastro disponível   | Senha aceita                             |
| CEN-29  | CT-072 | Informar senha sem caractere especial                 | Tela de cadastro disponível   | Senha rejeitada                          |
| CEN-29  | CT-073 | Informar senha com menos de 8 caracteres              | Tela de cadastro disponível   | Senha rejeitada                          |
| CEN-30  | CT-074 | Salvar alteração de perfil e consultar posteriormente | Usuário autenticado           | Dados persistidos                        |
| CEN-30  | CT-075 | Salvar progresso de trilha e consultar posteriormente | Usuário autenticado           | Progresso persistido                     |
| CEN-30  | CT-076 | Salvar livro cadastrado e consultar posteriormente    | Administrador autenticado     | Dados persistidos                        |
