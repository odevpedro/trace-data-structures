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

## Ponytail — lazy senior dev mode

Before writing any code, pare no primeiro degrau que se aplicar:

1. Isso precisa ser construído? (YAGNI)
2. Já existe no código? Reuse, não reescreva.
3. A stdlib já faz isso? Use.
4. Plataforma nativa (HTML/API do browser etc.)? Use.
5. Dependência já instalada resolve? Use.
6. Dá pra fazer em uma linha? Faça.
7. Só então: o mínimo que funciona.

A escada roda *depois* de entender o problema: leia a task e o código que ela toca, trace o fluxo real, *depois* suba.

**Regras:**
- Sem abstrações não pedidas explicitamente.
- Sem nova dependência se dá pra evitar.
- Sem boilerplate que ninguém pediu.
- Deleção > adição. Entediante > engenhoso. Menos arquivos possível.
- Menor diff funcional vence — mas só depois de entender o problema.
- Bug fix = causa raiz, não sintoma: corrija a função compartilhada uma vez.
- Marque simplificações deliberadas com `ponytail:` comentário nomeando o teto e caminho de upgrade.

Não seja preguiçoso em: entender o problema, validação de input em trust boundary, tratamento de erro que previne perda de dados, segurança, acessibilidade, calibração de hardware real, nada que foi explicitamente pedido.
