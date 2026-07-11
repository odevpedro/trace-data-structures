import type {
  LessonDefinition,
  Representation,
  SceneNodeDefinition,
  TraceDefinition,
  TraceEvent,
  TraceMetrics,
  TraceStep,
} from "../core/trace-engine/types";

const allRepresentations: Representation[] = ["abstract", "practical", "memory", "code"];

function node(
  id: string,
  kind: SceneNodeDefinition["kind"],
  x: number,
  y: number,
  width: number,
  height: number,
  labels: SceneNodeDefinition["labels"],
  extra: Partial<SceneNodeDefinition> = {},
): SceneNodeDefinition {
  return { id, kind, position: { x, y }, width, height, labels, ...extra };
}

function metrics(
  operations: number,
  touched: number,
  complexity: string,
  context: string,
): TraceMetrics {
  return { operations, touched, complexity, context };
}

function step(
  id: string,
  eventLabel: string,
  events: TraceEvent[],
  abstract: string,
  practical: string,
  description: string,
  stepMetrics: TraceMetrics,
  codeLine?: number,
): TraceStep {
  return {
    id,
    eventLabel,
    events,
    captions: {
      abstract,
      practical,
      memory: description,
      code: abstract,
    },
    description,
    metrics: stepMetrics,
    codeLine,
  };
}

// ── GRAPH / BFS ─────────────────────────────────────────────────────

const bfsTrace: TraceDefinition = {
  id: "bfs",
  scene: {
    nodes: [
      node("a", "block", 52, 130, 80, 52, {
        abstract: "A",
        practical: "Central",
        memory: "A",
      }),
      node("b", "block", 200, 40, 80, 52, {
        abstract: "B",
        practical: "Norte",
        memory: "B",
      }),
      node("c", "block", 200, 220, 80, 52, {
        abstract: "C",
        practical: "Sul",
        memory: "C",
      }),
      node("d", "block", 340, 130, 80, 52, {
        abstract: "D",
        practical: "Leste",
        memory: "D",
      }),
      node("e", "block", 480, 130, 80, 52, {
        abstract: "E",
        practical: "Museu",
        memory: "E",
      }),
      node("queue", "tag", 52, 300, 130, 28, {
        abstract: "[A]",
        practical: "[Central]",
        memory: "fila",
      }),
    ],
    edges: [
      { id: "ab", from: "a", to: "b", directed: true },
      { id: "ac", from: "a", to: "c", directed: true },
      { id: "bd", from: "b", to: "d", directed: true },
      { id: "ce", from: "c", to: "e", directed: true },
      { id: "de", from: "d", to: "e", directed: true },
    ],
  },
  code: [
    "function bfs(graph, start, target) {",
    "  const queue = [start];",
    "  const visited = new Set([start]);",
    "  while (queue.length) {",
    "    const node = queue.shift();",
    "    if (node === target) return;",
    "    for (const neighbor of graph[node]) {",
    "      if (!visited.has(neighbor)) {",
    "        queue.push(neighbor);",
    "        visited.add(neighbor);",
    "      }",
    "    }",
    "  }",
    "}",
  ],
  steps: [
    step(
      "bfs-start",
      "START",
      [{ type: "HIGHLIGHT", targets: ["a", "queue"], emphasis: "active" }],
      "BFS parte de A. Fila = [A].",
      "BFS parte da Central. Fila = [Central].",
      "A fila inicial contém apenas o nó de partida.",
      metrics(0, 0, "O(1)", "Inicialização da fila com o nó inicial."),
      1,
    ),
    step(
      "bfs-expand-a",
      "EXPAND",
      [
        { type: "HIGHLIGHT", targets: ["a"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["b", "c"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["ab", "ac"], emphasis: "active" },
      ],
      "A sai da fila. B e C entram.",
      "Central sai da fila. Norte e Sul entram.",
      "Visitar A e enfileirar seus vizinhos B e C.",
      metrics(2, 2, "O(V+E)", "BFS toca cada nó e cada aresta uma vez."),
      4,
    ),
    step(
      "bfs-expand-bc",
      "EXPAND",
      [
        { type: "HIGHLIGHT", targets: ["a"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["b"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["c"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["d", "e"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["bd", "ce"], emphasis: "active" },
      ],
      "B sai. D entra. C sai. E entra.",
      "Norte sai (Leste entra). Sul sai (Museu entra).",
      "B e C são expandidos, revelando D e E.",
      metrics(4, 4, "O(V+E)", "BFS visita todos os nós acessíveis em camadas."),
      4,
    ),
    step(
      "bfs-found",
      "FOUND",
      [
        { type: "HIGHLIGHT", targets: ["b", "c"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["e"], emphasis: "success" },
        { type: "HIGHLIGHT", targets: ["ac", "ce"], emphasis: "success" },
      ],
      "E encontrado. Caminho: A → C → E.",
      "Museu encontrado. Caminho: Central → Sul → Museu.",
      "O alvo E é encontrado; o caminho tem 2 arestas (menos paradas).",
      metrics(5, 5, "O(V+E)", "Busca concluída após visitar todos os nós até encontrar o alvo."),
      5,
    ),
    step(
      "bfs-done",
      "DONE",
      [
        { type: "HIGHLIGHT", targets: ["e"], emphasis: "success" },
        { type: "HIGHLIGHT", targets: ["ac", "ce"], emphasis: "success" },
      ],
      "BFS concluído. Menos paradas.",
      "BFS concluído. Rota com menos paradas encontrada.",
      "BFS garante o menor número de arestas para grafos não-ponderados.",
      metrics(5, 5, "O(V+E)", "BFS: O(V+E) tempo, O(V) espaço para a fila."),
      11,
    ),
  ],
};

// ── DFS ─────────────────────────────────────────────────────────────

const dfsTrace: TraceDefinition = {
  id: "dfs",
  scene: {
    nodes: [
      node("root", "block", 164, 36, 80, 52, {
        abstract: "A",
        practical: "Arquivos",
        memory: "A",
      }),
      node("b", "block", 32, 144, 100, 52, {
        abstract: "B",
        practical: "Documentos",
        memory: "B",
      }),
      node("c", "block", 296, 144, 88, 52, {
        abstract: "C",
        practical: "Fotos",
        memory: "C",
      }),
      node("d", "block", 32, 252, 100, 52, {
        abstract: "D",
        practical: "Projetos",
        memory: "D",
      }),
      node("e", "block", 164, 252, 88, 52, {
        abstract: "E",
        practical: "Cursos",
        memory: "E",
      }),
      node("f", "block", 296, 252, 80, 52, {
        abstract: "F",
        practical: "2026",
        memory: "F",
      }),
      node("target", "block", 32, 360, 110, 52, {
        abstract: "G",
        practical: "contrato.pdf",
        memory: "G",
      }),
      node("stack", "tag", 296, 360, 100, 28, {
        abstract: "[A]",
        practical: "[Arquivos]",
        memory: "pilha",
      }),
    ],
    edges: [
      { id: "ab", from: "root", to: "b", directed: true },
      { id: "ac", from: "root", to: "c", directed: true },
      { id: "bd", from: "b", to: "d", directed: true },
      { id: "be", from: "b", to: "e", directed: true },
      { id: "cf", from: "c", to: "f", directed: true },
      { id: "fg", from: "f", to: "target", directed: true },
    ],
  },
  code: [
    "function dfs(graph, node, target, visited = new Set()) {",
    "  if (node === target) return true;",
    "  visited.add(node);",
    "  for (const neighbor of graph[node]) {",
    "    if (!visited.has(neighbor)) {",
    "      if (dfs(graph, neighbor, target, visited)) return true;",
    "    }",
    "  }",
    "  return false;",
    "}",
  ],
  steps: [
    step(
      "dfs-start",
      "START",
      [{ type: "HIGHLIGHT", targets: ["root", "stack"], emphasis: "active" }],
      "DFS parte de A. Pilha = [A].",
      "DFS parte de Arquivos. Pilha = [Arquivos].",
      "A pilha começa com o nó raiz.",
      metrics(0, 0, "O(1)", "Inicialização da pilha com o nó inicial."),
      0,
    ),
    step(
      "dfs-descend",
      "DESCEND",
      [
        { type: "HIGHLIGHT", targets: ["root"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["b", "d"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["ab", "bd"], emphasis: "active" },
      ],
      "A → B → D. D não é alvo.",
      "Arquivos → Documentos → Projetos. Projetos não é contrato.pdf.",
      "DFS aprofunda pelo primeiro ramo: A, depois B, depois D.",
      metrics(3, 3, "O(V+E)", "Cada passo percorre uma aresta para aprofundar."),
      3,
    ),
    step(
      "dfs-backtrack",
      "BACKTRACK",
      [
        { type: "HIGHLIGHT", targets: ["d"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["b"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["e"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["be"], emphasis: "active" },
      ],
      "Volta a B. B → E. E não é alvo.",
      "Volta a Documentos. Documentos → Cursos. Cursos não é contrato.pdf.",
      "Retorno de D para B, depois descida para E.",
      metrics(5, 4, "O(V+E)", "Backtracking visita nós já explorados sem custo adicional."),
      4,
    ),
    step(
      "dfs-next-branch",
      "NEXT_BRANCH",
      [
        { type: "HIGHLIGHT", targets: ["b", "e"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["root"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["c", "f"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["ac", "cf"], emphasis: "active" },
      ],
      "Volta a A. A → C → F.",
      "Volta a Arquivos. Arquivos → Fotos → 2026.",
      "Após esgotar o ramo B, retrocede a A e segue para C.",
      metrics(7, 6, "O(V+E)", "DFS explora o próximo ramo após backtracking completo."),
      3,
    ),
    step(
      "dfs-found",
      "FOUND",
      [
        { type: "HIGHLIGHT", targets: ["c", "f"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["target"], emphasis: "success" },
        { type: "HIGHLIGHT", targets: ["fg"], emphasis: "success" },
      ],
      "F → G. Alvo encontrado!",
      "2026 → contrato.pdf. Alvo encontrado!",
      "O alvo G é encontrado ao final do ramo C-F.",
      metrics(8, 7, "O(V+E)", "DFS encontra o alvo sem garantir caminho mínimo."),
      3,
    ),
  ],
};

// ── DIJKSTRA ────────────────────────────────────────────────────────

const dijkstraTrace: TraceDefinition = {
  id: "dijkstra",
  scene: {
    nodes: [
      node("a", "block", 34, 130, 90, 52, {
        abstract: "A·0",
        practical: "Casa·0",
        memory: "A·0",
      }),
      node("b", "block", 170, 34, 90, 52, {
        abstract: "B·∞",
        practical: "Avenida·∞",
        memory: "B·∞",
      }),
      node("c", "block", 170, 220, 90, 52, {
        abstract: "C·∞",
        practical: "Ponte·∞",
        memory: "C·∞",
      }),
      node("d", "block", 340, 130, 100, 52, {
        abstract: "D·∞",
        practical: "Trabalho·∞",
        memory: "D·∞",
      }),
      node("wAB", "tag", 80, 80, 50, 24, {
        abstract: "2",
        practical: "2min",
        memory: "2",
      }),
      node("wAC", "tag", 80, 200, 50, 24, {
        abstract: "5",
        practical: "5min",
        memory: "5",
      }),
      node("wBC", "tag", 170, 134, 50, 24, {
        abstract: "1",
        practical: "1min",
        memory: "1",
      }),
      node("wBD", "tag", 280, 34, 50, 24, {
        abstract: "4",
        practical: "4min",
        memory: "4",
      }),
      node("wCD", "tag", 280, 220, 50, 24, {
        abstract: "1",
        practical: "1min",
        memory: "1",
      }),
      node("pq", "tag", 340, 300, 130, 28, {
        abstract: "[(A,0)]",
        practical: "[(Casa,0)]",
        memory: "fila prioridade",
      }),
    ],
    edges: [
      { id: "ab", from: "a", to: "b", directed: true },
      { id: "ac", from: "a", to: "c", directed: true },
      { id: "bc", from: "b", to: "c", directed: true },
      { id: "bd", from: "b", to: "d", directed: true },
      { id: "cd", from: "c", to: "d", directed: true },
    ],
  },
  code: [
    "function dijkstra(graph, start) {",
    "  const distances = {};",
    "  const pq = new MinHeap();",
    "  distances[start] = 0;",
    "  pq.insert(start, 0);",
    "  while (!pq.isEmpty()) {",
    "    const { node, dist } = pq.extractMin();",
    "    for (const { neighbor, weight } of graph[node]) {",
    "      const newDist = dist + weight;",
    "      if (newDist < (distances[neighbor] ?? Infinity)) {",
    "        distances[neighbor] = newDist;",
    "        pq.insert(neighbor, newDist);",
    "      }",
    "    }",
    "  }",
    "  return distances;",
    "}",
  ],
  steps: [
    step(
      "dijkstra-start",
      "START",
      [{ type: "HIGHLIGHT", targets: ["a", "pq"], emphasis: "active" }],
      "Dijkstra: A=0, demais ∞.",
      "Dijkstra: Casa=0, demais ∞.",
      "Distância inicial zero para A; todos os outros são infinito.",
      metrics(0, 0, "O(1)", "Inicialização das distâncias."),
      2,
    ),
    step(
      "dijkstra-relax-ab-ac",
      "RELAX",
      [
        { type: "HIGHLIGHT", targets: ["a"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["b", "c", "wAB", "wAC"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["ab", "ac"], emphasis: "active" },
      ],
      "A→B=2, A→C=5. B=2, C=5.",
      "Casa→Avenida=2min, Casa→Ponte=5min. Avenida=2, Ponte=5.",
      "Relaxamento das arestas saindo de A: B recebe 2, C recebe 5.",
      metrics(2, 2, "O(log V)", "Duas atualizações na fila de prioridade."),
      8,
    ),
    step(
      "dijkstra-select-b",
      "SELECT_MIN",
      [
        { type: "HIGHLIGHT", targets: ["a"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["b"], emphasis: "active" },
      ],
      "B é o mínimo (2). Relaxa B.",
      "Avenida é o mínimo (2min). Relaxa Avenida.",
      "O nó com menor distância (B=2) é extraído da fila.",
      metrics(3, 3, "O(log V)", "Extração do mínimo na fila de prioridade."),
      6,
    ),
    step(
      "dijkstra-relax-b",
      "RELAX",
      [
        { type: "HIGHLIGHT", targets: ["b"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["c", "d", "wBC", "wBD"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["bc", "bd"], emphasis: "active" },
      ],
      "B→C=1, B→D=4. C=3, D=6.",
      "Avenida→Ponte=1min, Avenida→Trabalho=4min. Ponte=3, Trabalho=6.",
      "C melhora de 5 para 3 via B; D recebe 6 via B.",
      metrics(5, 4, "O(log V)", "Relaxamento de duas arestas com atualização de distâncias."),
      8,
    ),
    step(
      "dijkstra-relax-c",
      "RELAX",
      [
        { type: "HIGHLIGHT", targets: ["b"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["c"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["d", "wCD"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["cd"], emphasis: "active" },
      ],
      "C é mínimo (3). C→D=1. D=4.",
      "Ponte é mínimo (3min). Ponte→Trabalho=1min. Trabalho=4.",
      "D melhora de 6 para 4 via C.",
      metrics(7, 5, "O(log V)", "C é extraído e sua aresta para D é relaxada."),
      8,
    ),
    step(
      "dijkstra-done",
      "DONE",
      [
        { type: "HIGHLIGHT", targets: ["d"], emphasis: "success" },
        { type: "HIGHLIGHT", targets: ["ab", "bc", "cd"], emphasis: "success" },
      ],
      "D=4. Caminho: A→B→C→D = 4.",
      "Trabalho=4min. Caminho: Casa→Avenida→Ponte→Trabalho = 4min.",
      "Menor custo total encontrado: A → B → C → D com peso 4.",
      metrics(7, 5, "O((V+E)log V)", "Dijkstra: extrações e relaxamentos com heap binário."),
      11,
    ),
  ],
};

// ── UNION-FIND ──────────────────────────────────────────────────────

const unionFindTrace: TraceDefinition = {
  id: "union-find",
  scene: {
    nodes: [
      node("a", "block", 50, 56, 90, 52, {
        abstract: "A",
        practical: "Notebook",
        memory: "A",
      }),
      node("b", "block", 50, 160, 90, 52, {
        abstract: "B",
        practical: "Roteador A",
        memory: "B",
      }),
      node("c", "block", 330, 160, 90, 52, {
        abstract: "C",
        practical: "Roteador B",
        memory: "C",
      }),
      node("d", "block", 330, 56, 90, 52, {
        abstract: "D",
        practical: "TV",
        memory: "D",
      }),
      node("root1", "tag", 50, 240, 130, 28, {
        abstract: "raiz A",
        practical: "rede A",
        memory: "raiz: A",
      }),
      node("root2", "tag", 330, 240, 130, 28, {
        abstract: "raiz C",
        practical: "rede B",
        memory: "raiz: C",
      }),
      node("query", "tag", 150, 320, 150, 28, {
        abstract: "connected(A,D)?",
        practical: "mesma rede?",
        memory: "find(A)==find(D)?",
      }),
    ],
    edges: [
      { id: "ab", from: "a", to: "b", directed: true },
      { id: "cd", from: "c", to: "d", directed: true },
      { id: "bc", from: "b", to: "c", directed: true, visible: false },
    ],
  },
  code: [
    "uf.union('A', 'B');       // A e B na mesma rede",
    "uf.union('C', 'D');       // C e D na mesma rede",
    "uf.union('B', 'C');       // une as duas redes",
    "const connected = uf.find('A') === uf.find('D');",
  ],
  steps: [
    step(
      "uf-start",
      "START",
      [
        { type: "HIGHLIGHT", targets: ["ab", "cd"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["root1", "root2"], emphasis: "idle" },
      ],
      "A-B e C-D são pares separados.",
      "Notebook-Roteador A e TV-Roteador B são pares separados.",
      "Dois conjuntos disjuntos: {A,B} e {C,D}.",
      metrics(0, 0, "O(1)", "Estado inicial dos conjuntos."),
      0,
    ),
    step(
      "uf-find",
      "FIND",
      [
        { type: "HIGHLIGHT", targets: ["a", "d"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["query"], emphasis: "active" },
      ],
      "find(A)=A, find(D)=D. Diferentes.",
      "find(Notebook)=Notebook, find(TV)=TV. Diferentes.",
      "Cada elemento ainda é raiz do seu próprio conjunto.",
      metrics(2, 2, "O(α(n))", "Duas operações find com compressão de caminho."),
      3,
    ),
    step(
      "uf-union",
      "UNION",
      [
        { type: "HIGHLIGHT", targets: ["bc"], emphasis: "active" },
        { type: "INSERT", target: "bc" },
        { type: "HIGHLIGHT", targets: ["root1", "root2"], emphasis: "active" },
      ],
      "union(B, C). Redes se conectam.",
      "union(Roteador A, Roteador B). Redes se conectam.",
      "As raízes A e C são unidas; um conjunto só agora.",
      metrics(3, 3, "O(α(n))", "Union por rank: a árvore menor vira filha da maior."),
      2,
    ),
    step(
      "uf-compress",
      "COMPRESS",
      [
        { type: "HIGHLIGHT", targets: ["a", "b", "c", "d"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["root1"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["bc"], emphasis: "idle" },
      ],
      "Compressão de caminho. A e D têm mesma raiz.",
      "Compressão de caminho. Notebook e TV têm mesma raiz.",
      "find(A) e find(D) agora retornam a mesma raiz após compressão.",
      metrics(4, 3, "O(α(n))", "Compressão de caminho encurta a árvore para consultas futuras."),
      3,
    ),
    step(
      "uf-done",
      "DONE",
      [
        { type: "HIGHLIGHT", targets: ["query"], emphasis: "success" },
        { type: "HIGHLIGHT", targets: ["ab", "bc", "cd"], emphasis: "success" },
      ],
      "connected(A,D) = true. Notebook e TV na mesma rede.",
      "connected(Notebook,TV) = true. Notebook e TV na mesma rede.",
      "Union-Find responde conectividade em tempo quase constante.",
      metrics(5, 3, "O(α(n))", "Find final confirma que A e D compartilham a mesma raiz."),
      3,
    ),
  ],
};

// ── LESSON DEFINITIONS ──────────────────────────────────────────────

export const graphLessons: LessonDefinition[] = [
  {
    id: "graph",
    title: "Grafo: BFS — rota com menos paradas",
    shortTitle: "BFS",
    module: "algorithm",
    icon: "◌",
    difficulty: "intermediate",
    prerequisites: ["queue"],
    comparisonId: "bfs-dijkstra",
    objectives: [
      "Modelar conexões como nós e arestas",
      "Entender busca em camadas",
      "Identificar caminho mínimo em grafos não-ponderados",
    ],
    description: "Nós e arestas representam conexões. BFS encontra o menor número de paradas.",
    example: { kind: "natural-modeling", label: "Modelagem natural", note: "Mapas, redes sociais e dependências são naturalmente grafos. A animação usa BFS para encontrar o menor número de conexões." },
    representations: allRepresentations,
    explanation: {
      problem: "Encontrar o caminho com menos arestas entre dois pontos.",
      model: "Expandir a busca em camadas, usando uma fila para visitar vizinhos na ordem de descoberta.",
      cost: "BFS visita cada nó e aresta uma vez: O(V + E).",
      whenToUse: "Quando todas as arestas têm peso igual e o objetivo é minimizar paradas.",
      alternative: "Dijkstra considera pesos diferentes; DFS não garante caminho mínimo.",
    },
    challenge: {
      question: "Por que B e C são visitados antes de D?",
      hint: "Observe a distância de A.",
      choices: [
        { id: "closer", label: "Estão mais próximos de A", correct: true },
        { id: "smaller", label: "Têm valores menores", correct: false },
        { id: "created-first", label: "Foram criados primeiro", correct: false },
      ],
      success: "Isso: BFS visita por camadas — B e C estão a 1 aresta de A, D está a 2.",
    },
    trace: bfsTrace,
  },
  {
    id: "dfs",
    title: "DFS: explore profundamente",
    shortTitle: "DFS",
    module: "algorithm",
    icon: "⇣",
    difficulty: "intermediate",
    prerequisites: ["stack", "graph"],
    objectives: [
      "Compreender exploração em profundidade",
      "Identificar backtracking",
      "Diferenciar BFS e DFS",
    ],
    description: "Percorre um ramo até o fim antes de voltar e explorar alternativas.",
    example: { kind: "common-technical-use", label: "Uso técnico comum", note: "DFS é usada em busca em profundidade, detecção de ciclos, componentes e travessia de árvores, como uma busca recursiva em pastas." },
    representations: allRepresentations,
    explanation: {
      problem: "Explorar todas as possibilidades de um grafo sem garantia de caminho mínimo.",
      model: "Usar uma pilha (explícita ou recursão) para aprofundar antes de retroceder.",
      cost: "DFS visita cada nó e aresta uma vez: O(V + E).",
      whenToUse: "Quando a memória é limitada ou você quer explorar todo o espaço de busca.",
      alternative: "BFS encontra caminho mínimo em grafos não-ponderados; Dijkstra em ponderados.",
    },
    challenge: {
      question: "Quando a DFS explora C?",
      hint: "Observe a ordem dos ramos.",
      choices: [
        { id: "after-b", label: "Depois de concluir o ramo B", correct: true },
        { id: "before-d", label: "Antes de visitar D", correct: false },
        { id: "same-time", label: "Ao mesmo tempo que B", correct: false },
      ],
      success: "Isso: DFS aprofunda um ramo inteiro antes de visitar o próximo.",
    },
    trace: dfsTrace,
  },
  {
    id: "dijkstra",
    title: "Dijkstra: menor custo em grafo ponderado",
    shortTitle: "Dijkstra",
    module: "algorithm",
    icon: "↝",
    difficulty: "advanced",
    prerequisites: ["graph", "heap"],
    comparisonId: "bfs-dijkstra",
    objectives: [
      "Modelar pesos em arestas",
      "Entender relaxamento de distâncias",
      "Usar fila de prioridade",
    ],
    description: "Encontra caminhos mínimos quando as arestas possuem pesos não negativos.",
    example: { kind: "common-technical-use", label: "Uso técnico comum", note: "Roteadores, mapas e sistemas de logística usam famílias de algoritmos de menor caminho. Produtos reais adicionam trânsito, restrições e heurísticas." },
    representations: allRepresentations,
    explanation: {
      problem: "Encontrar o caminho de menor custo total em um grafo com pesos.",
      model: "Manter distâncias provisórias, relaxar arestas e extrair o mínimo com uma fila de prioridade.",
      cost: "O((V + E) log V) com heap binário.",
      whenToUse: "Arestas com pesos diferentes e objetivo de menor custo total.",
      alternative: "BFS é mais rápido se todos os pesos são iguais; Bellman-Ford aceita pesos negativos.",
    },
    challenge: {
      question: "Por que C muda de 5 para 3?",
      hint: "A rota pela Avenida é mais barata.",
      choices: [
        { id: "smaller", label: "Porque 3 é menor que 5", correct: true },
        { id: "created-later", label: "Porque C foi criado depois", correct: false },
        { id: "still-infinite", label: "Porque D ainda é infinito", correct: false },
      ],
      success: "Correto: relaxamento encontrou caminho mais barato via B (2+1=3 < 5).",
    },
    trace: dijkstraTrace,
  },
  {
    id: "union-find",
    title: "Union-Find: conecte e consulte componentes",
    shortTitle: "Union-Find",
    module: "algorithm",
    icon: "∪",
    difficulty: "intermediate",
    prerequisites: ["graph"],
    objectives: [
      "Entender conjuntos disjuntos",
      "Operações find e union",
      "Aplicar compressão de caminho",
    ],
    description: "Mantém grupos disjuntos e responde rapidamente se dois elementos pertencem ao mesmo componente.",
    example: { kind: "common-technical-use", label: "Uso técnico comum", note: "É usado em conectividade dinâmica, Kruskal, redes e agrupamento. O exemplo mostra dois roteadores unindo redes domésticas." },
    representations: allRepresentations,
    explanation: {
      problem: "Determinar se dois elementos estão no mesmo conjunto sem recalcular tudo.",
      model: "Cada conjunto tem um representante (raiz). Find retorna a raiz; Union junta duas raízes.",
      cost: "Quase O(1) com compressão de caminho e união por rank.",
      whenToUse: "Conexões dinâmicas: redes, Kruskal, detecção de ciclos.",
      alternative: "BFS/DFS podem responder conectividade, mas precisam percorrer o grafo a cada consulta.",
    },
    challenge: {
      question: "O que o Union-Find responde com eficiência?",
      hint: "É uma operação de consulta.",
      choices: [
        { id: "connected", label: "Se dois elementos estão conectados", correct: true },
        { id: "shortest", label: "O menor caminho ponderado", correct: false },
        { id: "alphabetical", label: "A ordem alfabética", correct: false },
      ],
      success: "Isso: Union-Find responde conectividade entre dois elementos em tempo quase constante.",
    },
    trace: unionFindTrace,
  },
];
