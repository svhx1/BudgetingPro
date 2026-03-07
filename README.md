# Projeto Budgeting Webapp

Repositório configurado utilizando a Arquitetura de 3 Camadas proposta no **Doe Framework**. O objetivo desta estrutura é maximizar a confiabilidade, dividindo as preocupações de operação, orquestração e execução.

## A Arquitetura de 3 Camadas

1. **Layer 1: Directive (O Que Fazer)**
   - Localizada na pasta `directives/`.
   - Contém POPs em Markdown com os objetivos e regras de negócio.
2. **Layer 2: Orchestration (Tomada de Decisão)**
   - O Agente de IA que lê as diretrizes e decide como acionar a execução, lida com erros, atualiza guias baseados em aprendizado.
3. **Layer 3: Execution (Fazer o Trabalho)**
   - Localizada na pasta `execution/`.
   - Scripts determinísticos (Python/Node) responsáveis por manipulação de APIs e de banco de dados.

## Pastas Temporárias

A pasta `.tmp/` no projeto serve para arquivos intermediários criados durante a execução, e seu conteúdo é ignorado no versionamento (`.gitignore`).

## Variáveis e Credenciais

Crie um arquivo `.env` para informações do ambiente local usando como base o `.env.example`. Credenciais OAuth (`credentials.json`, `token.json`) devem permanecer ignoradas.
