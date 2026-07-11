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

const bstTrace: TraceDefinition = {
  id: "bst-insert",
  scene: {
    nodes: [
      node("root", "tree", 172, 70, 88, 56, {
        abstract: "8",
        practical: "Marina",
        memory: "raiz · 8",
      }),
      node("left", "tree", 60, 180, 88, 56, {
        abstract: "3",
        practical: "Carlos",
        memory: "esquerda · 3",
      }),
      node("right", "tree", 284, 180, 88, 56, {
        abstract: "10",
        practical: "Rafael",
        memory: "direita · 10",
      }),
      node("leaf", "tree", 60, 290, 80, 48, {
        abstract: "1",
        practical: "Ana",
        memory: "folha · 1",
      }),
      node("incoming", "tree", 172, 290, 80, 48, {
        abstract: "6",
        practical: "João",
        memory: "inserir · 6",
      }, { visible: false }),
      node("rule", "tag", 284, 290, 150, 28, {
        abstract: "menor←nó→maior",
        practical: "anterior←contato→posterior",
        memory: "menor ← nó → maior",
      }),
    ],
    edges: [
      { id: "rl", from: "root", to: "left", directed: true },
      { id: "rr", from: "root", to: "right", directed: true },
      { id: "ll", from: "left", to: "leaf", directed: true },
      { id: "li", from: "left", to: "incoming", directed: true, visible: false },
    ],
  },
  code: [
    "if (value < node.value) goLeft();",
    "else if (value > node.value) goRight();",
    "else found!",
  ],
  steps: [
    step(
      "bst-start",
      "START",
      [{ type: "HIGHLIGHT", targets: ["root"], emphasis: "active" }],
      "BST com raiz 8. Subárvores esquerda/direita.",
      "Agenda com Marina na raiz. Contatos à esquerda e direita.",
      "Cada nó tem no máximo dois filhos; a comparação decide o caminho.",
      metrics(0, 0, "O(1)", "Estado inicial da árvore."),
      0,
    ),
    step(
      "bst-compare-root",
      "COMPARE",
      [
        { type: "HIGHLIGHT", targets: ["root"], emphasis: "visited" },
        { type: "COMPARE", targets: ["root", "incoming"] },
        { type: "INSERT", target: "incoming" },
      ],
      "6 < 8, vá para esquerda.",
      "João < Marina, vá para esquerda.",
      "Comparação com a raiz decide o ramo esquerdo.",
      metrics(1, 2, "O(log n)", "Primeira comparação: 6 < 8."),
      0,
    ),
    step(
      "bst-compare-left",
      "COMPARE",
      [
        { type: "HIGHLIGHT", targets: ["left"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["incoming"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["li"], emphasis: "idle" },
      ],
      "6 > 3, vá para direita.",
      "João > Carlos, vá para direita.",
      "Comparação com o nó esquerdo decide o ramo direito.",
      metrics(2, 3, "O(log n)", "Segunda comparação: 6 > 3."),
      0,
    ),
    step(
      "bst-insert",
      "INSERT",
      [
        { type: "HIGHLIGHT", targets: ["left"], emphasis: "visited" },
        { type: "LINK", from: "left", to: "incoming", edgeId: "li" },
        { type: "HIGHLIGHT", targets: ["incoming"], emphasis: "success" },
      ],
      "6 insere à direita de 3.",
      "João insere à direita de Carlos.",
      "O novo nó é ligado como filho direito de 3.",
      metrics(3, 4, "O(log n)", "Inserção após encontrar posição."),
      1,
    ),
    step(
      "bst-done",
      "DONE",
      [
        { type: "MOVE", target: "incoming", to: { x: 172, y: 290 } },
        { type: "HIGHLIGHT", targets: ["incoming"], emphasis: "visited" },
      ],
      "6 é folha direita de 3.",
      "João é contato à direita de Carlos.",
      "Árvore preserva a propriedade: menores à esquerda, maiores à direita.",
      metrics(3, 4, "O(log n)*", "Nenhum nó existente foi deslocado."),
      2,
    ),
  ],
};

const balancedTrace: TraceDefinition = {
  id: "avl-rotate",
  scene: {
    nodes: [
      node("n30", "tree", 172, 74, 88, 56, {
        abstract: "30",
        practical: "Carlos",
        memory: "raiz · 30",
      }),
      node("n20", "tree", 60, 180, 88, 56, {
        abstract: "20",
        practical: "Bruno",
        memory: "esquerda · 20",
      }),
      node("n10", "tree", 60, 290, 80, 48, {
        abstract: "10",
        practical: "Ana",
        memory: "folha · 10",
      }, { visible: false }),
      node("balance", "tag", 172, 20, 130, 28, {
        abstract: "fator = +2",
        practical: "desbalanceada",
        memory: "fator = +2",
      }, { visible: false }),
    ],
    edges: [
      { id: "r30_20", from: "n30", to: "n20", directed: true },
      { id: "r20_10", from: "n20", to: "n10", directed: true, visible: false },
      { id: "r20_30", from: "n20", to: "n30", directed: true, visible: false },
    ],
  },
  code: [
    "// After insertion, check balance factor",
    "// Balance factor = height(left) - height(right)",
    "// If |factor| > 1, rotate",
  ],
  steps: [
    step(
      "avl-start",
      "START",
      [{ type: "HIGHLIGHT", targets: ["n30"], emphasis: "active" }],
      "30 na raiz, 20 à esquerda.",
      "Carlos na raiz, Bruno à esquerda.",
      "Árvore começa com dois nós; altura à esquerda é 1, à direita é 0.",
      metrics(0, 0, "O(1)", "Estado inicial da árvore."),
      0,
    ),
    step(
      "avl-insert",
      "INSERT",
      [{ type: "INSERT", target: "n10" }, { type: "HIGHLIGHT", targets: ["n10"], emphasis: "active" }],
      "10 insere à esquerda de 20.",
      "Ana insere à esquerda de Bruno.",
      "Nova folha à esquerda de 20 aumenta altura da subárvore esquerda.",
      metrics(1, 2, "O(log n)", "Inserção em BST primeiro, depois verifica balanço."),
      0,
    ),
    step(
      "avl-imbalance",
      "IMBALANCE",
      [
        { type: "HIGHLIGHT", targets: ["n30", "n20", "n10"], emphasis: "active" },
        { type: "INSERT", target: "balance" },
      ],
      "Fator = +2. Árvore desbalanceada.",
      "Diferença de altura crítica. Carlos detecta desbalanço.",
      "Altura esquerda = 2, direita = 0. Fator = +2, precisa rotacionar.",
      metrics(2, 3, "O(1)", "Cálculo do fator de balanceamento."),
      2,
    ),
    step(
      "avl-rotate",
      "ROTATE",
      [
        { type: "UNLINK", from: "n30", to: "n20", edgeId: "r30_20" },
        { type: "LINK", from: "n20", to: "n30", edgeId: "r20_30" },
        { type: "HIGHLIGHT", targets: ["n20"], emphasis: "success" },
      ],
      "Rotação à direita. 20 sobe.",
      "Bruno sobe para raiz, Carlos desce para direita.",
      "20 vira raiz, 30 vira filho direito. Árvore balanceada.",
      metrics(3, 3, "O(1)", "Rotação ajusta ponteiros em tempo constante."),
      2,
    ),
    step(
      "avl-done",
      "DONE",
      [
        { type: "MOVE", target: "n20", to: { x: 172, y: 74 } },
        { type: "MOVE", target: "n30", to: { x: 284, y: 180 } },
        { type: "HIGHLIGHT", targets: ["balance"], emphasis: "idle" },
      ],
      "Árvore balanceada. 20 é raiz.",
      "Bruno é raiz, Carlos à direita, Ana à esquerda.",
      "Fator de balanceamento agora é 0 ou ±1 em todos os nós.",
      metrics(3, 3, "O(log n)*", "Inserção + rotação mantêm altura O(log n)."),
      2,
    ),
  ],
};

const heapTrace: TraceDefinition = {
  id: "heap-bubble-up",
  scene: {
    nodes: [
      node("root", "tree", 168, 64, 96, 56, {
        abstract: "8",
        practical: "Prioridade 8",
        memory: "raiz · 8",
      }),
      node("left", "tree", 56, 180, 96, 56, {
        abstract: "6",
        practical: "Prioridade 6",
        memory: "esquerda · 6",
      }),
      node("right", "tree", 280, 180, 96, 56, {
        abstract: "5",
        practical: "Prioridade 5",
        memory: "direita · 5",
      }),
      node("incoming", "tree", 168, 290, 96, 56, {
        abstract: "9",
        practical: "Urgente 9",
        memory: "inserir · 9",
      }, { visible: false }),
      node("label", "tag", 168, 20, 130, 28, {
        abstract: "max-heap",
        practical: "fila de prioridade",
        memory: "max-heap",
      }),
    ],
    edges: [
      { id: "rl", from: "root", to: "left", directed: true },
      { id: "rr", from: "root", to: "right", directed: true },
      { id: "li", from: "left", to: "incoming", directed: true, visible: false },
    ],
  },
  code: [
    "heap.insert(9); // bubble-up",
    "while (child > parent) swap(child, parent);",
  ],
  steps: [
    step(
      "heap-start",
      "START",
      [{ type: "HIGHLIGHT", targets: ["root"], emphasis: "active" }],
      "Max-heap com 8 na raiz.",
      "Prioridade 8 é a mais alta na fila.",
      "Heap completo: 8 → 6 e 5. Propriedade: pai ≥ filhos.",
      metrics(0, 0, "O(1)", "Estado inicial do heap."),
      0,
    ),
    step(
      "heap-insert",
      "INSERT",
      [{ type: "INSERT", target: "incoming" }, { type: "HIGHLIGHT", targets: ["incoming"], emphasis: "active" }],
      "9 inserido como filho esquerdo de 6.",
      "Urgente 9 chega como filho de Prioridade 6.",
      "Inserção na próxima folha disponível mantém a forma completa.",
      metrics(1, 1, "O(log n)", "Inserção na primeira posição vaga."),
      0,
    ),
    step(
      "heap-compare-6",
      "COMPARE",
      [
        { type: "COMPARE", targets: ["incoming", "left"] },
        { type: "HIGHLIGHT", targets: ["incoming"], emphasis: "warning" },
        { type: "HIGHLIGHT", targets: ["left"], emphasis: "active" },
      ],
      "9 > 6, precisa subir.",
      "Urgente 9 maior que Prioridade 6, precisa subir.",
      "Filho maior que pai viola a propriedade do max-heap.",
      metrics(2, 2, "O(log n)", "Comparação com o pai."),
      1,
    ),
    step(
      "heap-swap-6",
      "SWAP",
      [
        { type: "HIGHLIGHT", targets: ["incoming"], emphasis: "active" },
        { type: "MOVE", target: "incoming", to: { x: 56, y: 64 } },
        { type: "MOVE", target: "left", to: { x: 168, y: 290 } },
      ],
      "9 troca com 6.",
      "Urgente 9 sobe, Prioridade 6 desce.",
      "Bubble-up: 9 e 6 trocam de posição.",
      metrics(3, 2, "O(log n)", "Troca entre pai e filho."),
      1,
    ),
    step(
      "heap-compare-8",
      "COMPARE",
      [
        { type: "COMPARE", targets: ["incoming", "root"] },
        { type: "HIGHLIGHT", targets: ["incoming"], emphasis: "warning" },
        { type: "HIGHLIGHT", targets: ["root"], emphasis: "active" },
      ],
      "9 > 8, precisa subir de novo.",
      "Urgente 9 maior que Prioridade 8, precisa subir.",
      "Nova comparação com o novo pai.",
      metrics(4, 3, "O(log n)", "Segunda comparação com o pai."),
      1,
    ),
    step(
      "heap-swap-8",
      "SWAP",
      [
        { type: "MOVE", target: "root", to: { x: 168, y: 180 } },
        { type: "MOVE", target: "incoming", to: { x: 168, y: 64 } },
        { type: "HIGHLIGHT", targets: ["incoming"], emphasis: "success" },
      ],
      "9 troca com 8. Agora 9 é raiz.",
      "Urgente 9 sobe ao topo. Prioridade 8 desce.",
      "Nova raiz 9, 8 desce para o lugar de 6.",
      metrics(5, 3, "O(log n)", "Segunda troca completa o bubble-up."),
      1,
    ),
    step(
      "heap-done",
      "DONE",
      [
        { type: "HIGHLIGHT", targets: ["incoming"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["root"], emphasis: "visited" },
      ],
      "9 é a nova raiz. Propriedade restaurada.",
      "Urgente 9 é a maior prioridade. Fila consistente.",
      "Max-heap restaurado: 9 ≥ 8 e 9 ≥ 5.",
      metrics(5, 3, "O(log n)*", "Bubble-up concluído em 2 níveis."),
      2,
    ),
  ],
};

const trieTrace: TraceDefinition = {
  id: "trie-insert",
  scene: {
    nodes: [
      node("root", "circle", 200, 44, 44, 44, {
        abstract: "∅",
        practical: "busca",
        memory: "raiz · ∅",
      }),
      node("c", "circle", 112, 130, 36, 36, {
        abstract: "C",
        practical: "c",
        memory: "nó · C",
      }),
      node("a", "circle", 200, 130, 36, 36, {
        abstract: "A",
        practical: "a",
        memory: "nó · A",
      }),
      node("t", "circle", 288, 130, 36, 36, {
        abstract: "T",
        practical: "t",
        memory: "nó · T",
      }),
      node("r", "circle", 200, 220, 36, 36, {
        abstract: "R",
        practical: "r",
        memory: "nó · R",
      }, { visible: false }),
      node("word", "tag", 200, 280, 100, 28, {
        abstract: "CAR",
        practical: "car",
        memory: "palavra · CAR",
      }, { visible: false }),
    ],
    edges: [
      { id: "rc", from: "root", to: "c", directed: true },
      { id: "ca", from: "c", to: "a", directed: true },
      { id: "at", from: "a", to: "t", directed: true },
      { id: "ar", from: "a", to: "r", directed: true, visible: false },
    ],
  },
  code: [
    'trie.insert("CAR"); // C → A → R (A already exists from "CAT")',
  ],
  steps: [
    step(
      "trie-start",
      "START",
      [{ type: "HIGHLIGHT", targets: ["root", "c", "a", "t"], emphasis: "active" }],
      "Trie: C → A → T (CAT).",
      "Busca com CAT na árvore de prefixos.",
      "Trie contém CAT. Cada caractere é um nó; prefixos são compartilhados.",
      metrics(0, 0, "O(1)", "Estado inicial da trie."),
      0,
    ),
    step(
      "trie-c",
      "PREFIX",
      [
        { type: "HIGHLIGHT", targets: ["c"], emphasis: "success" },
        { type: "HIGHLIGHT", targets: ["root", "a", "t"], emphasis: "idle" },
      ],
      "C existe. Avance.",
      "Letra C já está na árvore.",
      "Primeiro caractere de CAR já existe como nó filho da raiz.",
      metrics(1, 1, "O(k)", "Verificação do primeiro caractere."),
      0,
    ),
    step(
      "trie-a",
      "PREFIX",
      [
        { type: "HIGHLIGHT", targets: ["a"], emphasis: "success" },
        { type: "HIGHLIGHT", targets: ["c", "t"], emphasis: "idle" },
      ],
      "A existe. Avance.",
      "Letra A já está na árvore.",
      "Segundo caractere compartilha o prefixo CA com CAT.",
      metrics(2, 2, "O(k)", "Verificação do segundo caractere."),
      0,
    ),
    step(
      "trie-r",
      "CREATE",
      [
        { type: "INSERT", target: "r" },
        { type: "LINK", from: "a", to: "r", edgeId: "ar" },
        { type: "HIGHLIGHT", targets: ["r"], emphasis: "success" },
      ],
      "R não existe. Crie.",
      "Letra R precisa ser criada.",
      "Novo nó R é criado como filho de A.",
      metrics(3, 3, "O(k)", "Criação do novo nó e ligação."),
      0,
    ),
    step(
      "trie-done",
      "DONE",
      [
        { type: "INSERT", target: "word" },
        { type: "HIGHLIGHT", targets: ["word"], emphasis: "success" },
      ],
      "CAR inserido. C → A → R.",
      "Palavra CAR registrada na busca.",
      "Trie agora contém CAT e CAR compartilhando o prefixo CA.",
      metrics(3, 3, "O(k)*", "Tamanho da chave determina o custo."),
      0,
    ),
  ],
};

export const hierarchicalLessons: LessonDefinition[] = [
  {
    id: "bst",
    title: "Árvore binária de busca: insira por comparação",
    shortTitle: "BST",
    module: "data-structure",
    icon: "Y",
    difficulty: "foundation",
    prerequisites: ["linked-list"],
    objectives: [
      "Compreender a comparação binária em cada nó",
      "Inserir um valor navegando pelos ramos",
      "Identificar o pior caso O(n) em árvore degenerada",
    ],
    description: "Cada comparação decide entre o ramo esquerdo e o direito.",
    example: {
      kind: "visual-analogy",
      label: "Analogia visual",
      note: "Uma agenda ordenada ensina busca por comparação. Sistemas de produção normalmente preferem árvores balanceadas ou B-trees, não uma BST simples.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Inserir e buscar em ordem hierárquica.",
      model: "Comparar com a raiz; ir para esquerda se menor, direita se maior.",
      cost: "Inserção e busca são O(log n) médio, O(n) no pior caso (árvore degenerada).",
      whenToUse: "Dados dinâmicos que precisam de ordem e busca mais rápida que lista.",
      alternative: "Array ordenado com busca binária custa O(log n) para busca, mas inserção é O(n).",
    },
    challenge: {
      question: "Depois de comparar 6 com 3, para onde seguir?",
      hint: "6 é maior que 3.",
      choices: [
        { id: "right", label: "Direita", correct: true },
        { id: "left", label: "Esquerda", correct: false },
        { id: "root", label: "Voltar à raiz", correct: false },
      ],
      success: "Isso: 6 > 3, então segue para o ramo direito.",
    },
    limitation: {
      title: "E se fosse uma lista ordenada?",
      goodLabel: "BST",
      goodValue: "busca O(log n)",
      goodWidth: 34,
      badLabel: "Lista",
      badValue: "busca O(n)",
      badWidth: 66,
      text: "BST equilibra inserção e busca; lista ordenada é mais simples mas busca é linear.",
    },
    trace: bstTrace,
  },
  {
    id: "balanced",
    title: "Árvore balanceada: rotação AVL",
    shortTitle: "Árvore balanceada",
    module: "data-structure",
    icon: "⚖",
    difficulty: "intermediate",
    prerequisites: ["bst"],
    objectives: [
      "Identificar desbalanceamento pelo fator",
      "Executar rotação para restaurar balanço",
      "Garantir operações O(log n) no pior caso",
    ],
    description: "Mantém a altura controlada para preservar operações logarítmicas.",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "A animação usa uma rotação AVL. Java TreeMap usa Red-Black Tree: outra estratégia de balanceamento com o mesmo objetivo de evitar degeneração.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Evitar que a árvore se torne degenerada (uma lista).",
      model: "Após cada inserção, calcular o fator de balanceamento e rotacionar se necessário.",
      cost: "Inserção, busca e remoção são O(log n) garantidos.",
      whenToUse: "Quando o pior caso O(n) de uma BST simples é inaceitável.",
      alternative: "BST simples é mais fácil de implementar, mas pode degenerar.",
    },
    challenge: {
      question: "Qual nó vira a nova raiz após a rotação?",
      hint: "O nó do meio sobe.",
      choices: [
        { id: "20", label: "20", correct: true },
        { id: "30", label: "30", correct: false },
        { id: "10", label: "10", correct: false },
      ],
      success: "Correto: 20 sobe para raiz, 30 desce para direita, 10 fica à esquerda.",
    },
    trace: balancedTrace,
  },
  {
    id: "heap",
    title: "Heap: inserção com subida",
    shortTitle: "Heap",
    module: "data-structure",
    icon: "▲",
    difficulty: "intermediate",
    prerequisites: ["bst"],
    objectives: [
      "Inserir mantendo a propriedade de max-heap",
      "Executar bubble-up para restaurar a ordem",
      "Comparar heap com array ordenado",
    ],
    description: "O elemento de maior prioridade permanece na raiz (max-heap).",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "Filas de prioridade, escalonadores e alguns algoritmos usam heaps. O exemplo mostra um max-heap completo, incluindo a subida até a raiz.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Manter o maior elemento sempre acessível na raiz.",
      model: "Inserir na próxima folha disponível e subir o valor até restaurar a propriedade do heap.",
      cost: "Inserção e remoção são O(log n); acesso ao máximo é O(1).",
      whenToUse: "Quando só o elemento de maior prioridade importa.",
      alternative: "Array ordenado dá acesso O(1) ao máximo, mas inserção é O(n).",
    },
    challenge: {
      question: "Por que 9 sobe no heap?",
      hint: "Compare com o pai.",
      choices: [
        { id: "greater", label: "Porque é maior que o pai", correct: true },
        { id: "first", label: "Porque foi inserido primeiro", correct: false },
        { id: "left", label: "Porque está à esquerda", correct: false },
      ],
      success: "Isso: no max-heap, o filho sobe quando é maior que o pai.",
    },
    limitation: {
      title: "E se fosse um array ordenado?",
      goodLabel: "Heap",
      goodValue: "inserção O(log n)",
      goodWidth: 32,
      badLabel: "Array",
      badValue: "inserção O(n)",
      badWidth: 68,
      text: "Heap aceita inserção mais rápida; array dá acesso imediato ao máximo.",
    },
    trace: heapTrace,
  },
  {
    id: "trie",
    title: "Trie: insira por prefixo",
    shortTitle: "Trie",
    module: "data-structure",
    icon: "T",
    difficulty: "intermediate",
    prerequisites: ["bst"],
    objectives: [
      "Compartilhar prefixos entre palavras",
      "Inserir uma palavra navegando por caracteres",
      "Diferenciar busca por prefixo de busca por chave exata",
    ],
    description: "Cada caminho representa um prefixo compartilhado.",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "Tries e índices de prefixo são escolhas comuns para autocomplete, correção e busca incremental.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Armazenar strings com prefixos compartilhados para busca rápida.",
      model: "Cada nó representa um caractere; caminhos compartilham prefixos.",
      cost: "Inserção e busca são O(k), onde k é o tamanho da chave.",
      whenToUse: "Autocomplete, corretor ortográfico, busca por prefixo.",
      alternative: "Hash table é mais rápida por chave exata, mas não suporta prefixo.",
    },
    challenge: {
      question: "Quais letras não precisam ser recriadas?",
      hint: "Observe o prefixo compartilhado.",
      choices: [
        { id: "ca", label: "C e A", correct: true },
        { id: "ar", label: "A e R", correct: false },
        { id: "only-r", label: "Somente R", correct: false },
      ],
      success: "Exato: C e A já existem; só R precisa ser criado.",
    },
    trace: trieTrace,
  },
];
