# Execution Layer (Layer 3)

Esta pasta é destinada a scripts determinísticos em Python ou JS/TS. 

## Princípios
- Lide com as chamadas de API, processamento de dados, operações de arquivo e integrações com banco de dados aqui.
- O código deve ser confiável, passível de testes, rápido e bem comentado.
- Use variáveis de ambiente (`.env`) e as credenciais necessárias que estão restritas no arquivo `.gitignore`.

**Nota:** O agente Orquestrador chamará as ferramentas desta camada baseando-se nas diretrizes definidas em `directives/`.
