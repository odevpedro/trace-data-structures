import type { ComparisonDefinition } from "../core/trace-engine/types";

export const comparisons: ComparisonDefinition[] = [
  {
    id: "insert-middle",
    title: "Inserção no meio",
    lessonIdA: "array",
    lessonIdB: "linked-list",
    labelA: "Array",
    labelB: "Lista encadeada",
    summaryA: "Array desloca elementos posteriores.",
    summaryB: "Lista altera referências locais.",
    summaryResult: "good-right",
  },
  {
    id: "array-queue",
    title: "Remoção no início",
    lessonIdA: "array",
    lessonIdB: "queue",
    labelA: "Array",
    labelB: "Fila",
    summaryA: "Array desloca todos os itens à esquerda.",
    summaryB: "Fila avança o front em O(1).",
    summaryResult: "good-right",
  },
  {
    id: "list-hash",
    title: "Busca por chave",
    lessonIdA: "linked-list",
    lessonIdB: "hash",
    labelA: "Lista encadeada",
    labelB: "Tabela hash",
    summaryA: "Lista percorre nós sequencialmente.",
    summaryB: "Hash encontra o bucket em O(1) médio.",
    summaryResult: "good-right",
  },
  {
    id: "bfs-dfs",
    title: "BFS × DFS: camadas versus profundidade",
    lessonIdA: "graph",
    lessonIdB: "dfs",
    labelA: "BFS",
    labelB: "DFS",
    summaryA: "BFS visita por camadas; encontra caminho mínimo.",
    summaryB: "DFS aprofunda ramos; não garante caminho mínimo.",
    summaryResult: "neutral",
  },
  {
    id: "bfs-dijkstra",
    title: "Menos paradas × menor custo",
    lessonIdA: "graph",
    lessonIdB: "dijkstra",
    labelA: "BFS",
    labelB: "Dijkstra",
    summaryA: "BFS minimiza o número de arestas.",
    summaryB: "Dijkstra minimiza o peso total.",
    summaryResult: "neutral",
  },
];

export const comparisonById = Object.fromEntries(
  comparisons.map((c) => [c.id, c]),
) as Record<string, ComparisonDefinition>;
