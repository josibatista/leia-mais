# Suítes de Execução de Testes – Leia+

## Objetivo

Este documento define os conjuntos de testes que deverão ser executados durante a validação do sistema Leia+.

As suítes utilizam os casos de teste previamente definidos no documento de Casos de Teste e devem ser executadas conforme a necessidade de cada ciclo de desenvolvimento.

---

# 1. Smoke Suite

## Objetivo

Validar rapidamente se as funcionalidades críticas do sistema permanecem operacionais após uma nova implantação.

## Critério de Aprovação

Todos os testes da suíte devem ser aprovados.

## Casos de Teste

| ID da Suíte | Caso de Teste                                        | Status |
| ----------- | ---------------------------------------------------- | ------ |
| SMK-01      | CT-006 – Realizar login com credenciais válidas      | ⬜      |
| SMK-02      | CT-018 – Visualizar catálogo de livros               | ⬜      |
| SMK-03      | CT-043 – Iniciar trilha disponível                   | ⬜      |
| SMK-04      | CT-026 – Cadastrar livro com dados válidos           | ⬜      |
| SMK-05      | CT-055 – Administrador acessar painel administrativo | ⬜      |

## Resultado da Execução

| Data | Versão | Resultado Geral |
| ---- | ------ | --------------- |
|      |        |                 |

## Observações

*

---

# 2. Regressão Suite

## Objetivo

Garantir que alterações realizadas no sistema não impactem funcionalidades previamente aprovadas.

## Critério de Aprovação

Todos os fluxos críticos devem permanecer funcionando conforme esperado.

## Casos de Teste

| ID da Suíte | Caso de Teste                                        | Status |
| ----------- | ---------------------------------------------------- | ------ |
| REG-01      | CT-006 – Realizar login com credenciais válidas      | ⬜      |
| REG-02      | CT-010 – Realizar logout após autenticação           | ⬜      |
| REG-03      | CT-018 – Visualizar catálogo de livros               | ⬜      |
| REG-04      | CT-029 – Editar informações de livro existente       | ⬜      |
| REG-05      | CT-043 – Iniciar trilha disponível                   | ⬜      |
| REG-06      | CT-049 – Iniciar nova trilha com outra ativa         | ⬜      |
| REG-07      | CT-055 – Administrador acessar painel administrativo | ⬜      |

## Resultado da Execução

| Data | Versão | Resultado Geral |
| ---- | ------ | --------------- |
|      |        |                 |

## Observações

*

---

# 3. Compatibilidade Suite

## Objetivo

Validar o funcionamento do sistema nos navegadores suportados.

## Critério de Aprovação

Todos os fluxos selecionados devem funcionar corretamente em todos os navegadores definidos.

## Casos de Teste

| ID da Suíte | Caso de Teste | Navegador        | Status |
| ----------- | ------------- | ---------------- | ------ |
| CMP-01      | CT-059        | Google Chrome    | ⬜      |
| CMP-02      | CT-060        | Microsoft Edge   | ⬜      |
| CMP-03      | CT-061        | Navegador Mobile | ⬜      |

## Resultado da Execução

| Data | Versão | Resultado Geral |
| ---- | ------ | --------------- |
|      |        |                 |

## Observações

*

---

# 4. Sessões Exploratórias

## Objetivo

Identificar defeitos, inconsistências e problemas de usabilidade não previstos pelos casos de teste formais.

---

### EXP-01 – Módulo de Usuários

| Campo     | Valor |
| --------- | ----- |
| Data      |       |
| Executor  |       |
| Tempo     |       |
| Resultado |       |

#### Defeitos Encontrados

| ID | Descrição |
| -- | --------- |
|    |           |

#### Observações

*

---

### EXP-02 – Módulo de Acervo

| Campo     | Valor |
| --------- | ----- |
| Data      |       |
| Executor  |       |
| Tempo     |       |
| Resultado |       |

#### Defeitos Encontrados

| ID | Descrição |
| -- | --------- |
|    |           |

#### Observações

*

---

### EXP-03 – Módulo de Trilhas

| Campo     | Valor |
| --------- | ----- |
| Data      |       |
| Executor  |       |
| Tempo     |       |
| Resultado |       |

#### Defeitos Encontrados

| ID | Descrição |
| -- | --------- |
|    |           |

#### Observações

*

---

### EXP-04 – Módulo Administrativo

| Campo     | Valor |
| --------- | ----- |
| Data      |       |
| Executor  |       |
| Tempo     |       |
| Resultado |       |

#### Defeitos Encontrados

| ID | Descrição |
| -- | --------- |
|    |           |

#### Observações

*

---

# Resumo Executivo

| Suíte           | Resultado |
| --------------- | --------- |
| Smoke           | ⬜         |
| Regressão       | ⬜         |
| Compatibilidade | ⬜         |
| Exploratório    | ⬜         |

## Conclusão

Registrar o resultado geral da execução das suítes e a recomendação para liberação ou não da versão testada.
