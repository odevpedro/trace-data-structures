# Instruções para agentes de IA

Antes de alterar o projeto, leia nesta ordem:

1. docs/CURRENT_STATE.md
2. docs/PRODUCT_VISION.md
3. docs/ARCHITECTURE.md
4. docs/MIGRATION_PLAN.md
5. docs/PARITY_MATRIX.md
6. docs/DESIGN_SYSTEM.md
7. docs/MOTION_SYSTEM.md
8. docs/BACKLOG.md

## Regras obrigatórias

- Não reescrever o projeto do zero.
- Não apagar ou modificar o protótipo canônico.
- Não remover funcionalidades sem substituição equivalente.
- Preservar identidade visual e motion design.
- Atualizar PARITY_MATRIX.md após cada migração.
- Implementar em pequenas fatias verticais.
- Não criar páginas vazias ou placeholders como entrega.
- Rodar testes e build antes de declarar conclusão.
- Não afirmar paridade sem comparação funcional e visual.
- Registrar limitações e pendências honestamente.

## Comandos obrigatórios

npm install
npm run check
npm run test:e2e
npm run dev
