# Trace

Plataforma educacional visual para observar programação, memória e arquitetura como estados de uma timeline.

Este workspace segue uma migração incremental:

- a aplicação modular está em `src/`;
- o protótipo original permanece intacto em `prototype/trace_complete_market_v2.html`;
- a auditoria, arquitetura, roadmap e matriz de paridade estão em `docs/`.

## Executar

Requer Node.js 22 ou mais recente.

```bash
npm install
npm run dev
```

Rotas principais:

- `/` — landing;
- `/app/learn` — jornada da vertical slice;
- `/app/lesson/array` — player genérico;
- `/app/lesson/linked-list` — lista encadeada;
- `/app/compare/insert-middle` — comparação Array × Lista;
- `/app/review` — três flashcards;
- `/app/lesson/request-flow` — fluxo cliente/API/banco;
- `/app/lesson/graph` — BFS em grafo;
- `/app/lesson/dfs` — DFS em grafo;
- `/app/lesson/dijkstra` — Dijkstra em grafo ponderado;
- `/app/lesson/union-find` — Union-Find para componentes;
- `/prototype/trace_complete_market_v2.html` — protótipo preservado.

## Validar

```bash
npm test
npm run build
npm run test:e2e
```

Os testes E2E usam o Google Chrome instalado em `/usr/bin/google-chrome`. Para outro caminho:

```bash
CHROME_PATH=/caminho/para/chrome npm run test:e2e
```

## Estado da migração

A primeira vertical implementa Array, busca linear, `if`, `for`, memória/referências, flashcards, um fluxo curto de system design, conquista e persistência em IndexedDB. Lições de algoritmos em grafo (BFS, DFS, Dijkstra, Union-Find) foram adicionadas em `src/content/graphs.ts`. As demais lições e comparações do protótipo continuam acessíveis, mas ainda não foram migradas. Consulte [docs/PARITY_MATRIX.md](docs/PARITY_MATRIX.md) antes de substituir qualquer funcionalidade legada.
