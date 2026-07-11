# Backlog

## Pendentes

- Adicionar arestas com pesos visíveis no trace do Dijkstra (já existem nós `wAB` etc., verificar renderização)
- Criar lição de Bellman-Ford (pesos negativos)
- Criar comparação BFS × DFS
- Implementar P0: teste de integridade do protótipo (INT-001)
- Implementar P2: fila de revisão por vencimento (REV-002)
- Implementar P2: ciclo de conquista com dispensa (ACH-003)
- Adicionar testes E2E para as novas lições (P1)

## Em andamento

- _Nenhuma_

## Concluídas

- [x] 2026-07-11 — Criar `src/content/graphs.ts` com 4 lições de algoritmos em grafo (BFS, DFS, Dijkstra, Union-Find)
- [x] 2026-07-11 — Criar `src/content/linear.ts` com 4 lições lineares (doubly-linked-list, stack, queue, deque)
- [x] 2026-07-11 — Criar `src/content/indexed.ts` com 2 lições indexadas (hash, set)
- [x] 2026-07-11 — Criar `src/content/hierarchical.ts` com 4 lições hierárquicas (bst, balanced, heap, trie)
- [x] 2026-07-11 — Criar `src/content/systems.ts` com 4 lições de sistemas (btree, lru, circular, bloom)
- [x] 2026-07-11 — Criar `src/content/index.ts` como agregador que combina todas as lições e exporta `learningPath`, `lessonById`, `defaultInputsFor`, `traceForLesson`, `moduleLabels`
- [x] 2026-07-11 — Adicionar `comparisonId` às lições queue, hash, graph, dijkstra para habilitar os 3 presets restantes
- [x] 2026-07-11 — Adicionar 3 comparações em `comparisons.ts` (array-queue, list-hash, bfs-dijkstra)
- [x] 2026-07-11 — Atualizar imports de 4 páginas para `../content` (agregador)
- [x] 2026-07-11 — Registrar paridade no `PARITY_MATRIX.md` para todas as 18 lições e 3 comparações
