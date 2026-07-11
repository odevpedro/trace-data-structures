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

const doublyTrace: TraceDefinition = {
  id: "doubly-linked-list-insert",
  scene: {
    nodes: [
      node("a", "linked", 70, 180, 98, 56, {
        abstract: "A",
        practical: "Home",
        memory: "nó · A",
      }),
      node("b", "linked", 266, 180, 98, 56, {
        abstract: "B",
        practical: "Produto",
        memory: "nó · B",
      }),
      node("c", "linked", 462, 180, 108, 56, {
        abstract: "C",
        practical: "Pagamento",
        memory: "nó · C",
      }),
      node("x", "linked", 266, 52, 104, 56, {
        abstract: "X",
        practical: "Carrinho",
        memory: "nó · X",
      }, { visible: false }),
      node("prev", "tag", 210, 272, 70, 25, {
        abstract: "prev",
        practical: "voltar",
        memory: "prev",
      }, { visible: false }),
      node("next", "tag", 360, 272, 80, 25, {
        abstract: "next",
        practical: "avançar",
        memory: "next",
      }, { visible: false }),
    ],
    edges: [
      { id: "ab", from: "a", to: "b", directed: true },
      { id: "ba", from: "b", to: "a", directed: true },
      { id: "bc", from: "b", to: "c", directed: true },
      { id: "cb", from: "c", to: "b", directed: true },
      { id: "ax", from: "a", to: "x", directed: true, visible: false },
      { id: "xa", from: "x", to: "a", directed: true, visible: false },
      { id: "xb", from: "x", to: "b", directed: true, visible: false },
      { id: "bx", from: "b", to: "x", directed: true, visible: false },
    ],
  },
  code: [
    "function insertBetween(prev, newNode, next) {",
    "  newNode.prev = prev;",
    "  newNode.next = next;",
    "  prev.next = newNode;",
    "  next.prev = newNode;",
    "}",
  ],
  steps: [
    step(
      "doubly-start",
      "OBSERVE",
      [
        { type: "HIGHLIGHT", targets: ["ab", "bc"], emphasis: "active" },
      ],
      "A → B → C. Cada nó tem next e prev.",
      "Home → Produto → Pagamento. Cada página aponta para a próxima e a anterior.",
      "Cada nó guarda duas referências: uma para o próximo e outra para o anterior.",
      metrics(0, 0, "O(1)", "Observar a estrutura da lista não altera o estado."),
      0,
    ),
    step(
      "doubly-allocate",
      "ALLOCATE",
      [
        { type: "HIGHLIGHT", targets: ["ab", "bc"], emphasis: "idle" },
        { type: "INSERT", target: "x" },
        { type: "HIGHLIGHT", targets: ["x"], emphasis: "active" },
      ],
      "Um novo nó X é criado fora da lista.",
      "Carrinho é preparado fora da sequência de navegação.",
      "O nó existe na memória, mas ainda não está ligado à cadeia bidirecional.",
      metrics(1, 1, "O(1)", "Criar um nó isolado é constante."),
      0,
    ),
    step(
      "doubly-detach",
      "DETACH",
      [
        { type: "HIGHLIGHT", targets: ["x"], emphasis: "visited" },
        { type: "UNLINK", from: "a", to: "b", edgeId: "ab" },
        { type: "UNLINK", from: "b", to: "a", edgeId: "ba" },
        { type: "HIGHLIGHT", targets: ["b"], emphasis: "active" },
      ],
      "As referências next de A e prev de B são destacadas.",
      "A ligação entre Home e Produto é removida temporariamente.",
      "Duas referências são destacadas: o next de A e o prev de B.",
      metrics(2, 2, "O(1)", "Destacar duas referências é constante."),
      0,
    ),
    step(
      "doubly-relink",
      "RELINK",
      [
        { type: "LINK", from: "a", to: "x", edgeId: "ax" },
        { type: "LINK", from: "x", to: "b", edgeId: "xb" },
        { type: "LINK", from: "b", to: "x", edgeId: "bx" },
        { type: "LINK", from: "x", to: "a", edgeId: "xa" },
        { type: "HIGHLIGHT", targets: ["x"], emphasis: "active" },
      ],
      "A → X, X → B; B → X, X → A.",
      "Home aponta para Carrinho; Carrinho aponta para Produto — nos dois sentidos.",
      "Quatro ligações são criadas: duas para frente e duas para trás.",
      metrics(4, 3, "O(1)", "Quatro ligações diretas, sem deslocamentos."),
      1,
    ),
    step(
      "doubly-done",
      "DONE",
      [
        { type: "MOVE", target: "x", to: { x: 182, y: 180 } },
        { type: "INSERT", target: "prev" },
        { type: "INSERT", target: "next" },
        { type: "HIGHLIGHT", targets: ["x"], emphasis: "success" },
      ],
      "X assenta entre A e B com referências para ambos os lados.",
      "Carrinho fica entre Home e Produto na navegação bidirecional.",
      "O nó ocupa seu lugar na ordem linear; quatro referências mantêm a cadeia.",
      metrics(4, 3, "O(1)", "Quatro operações totais; nenhum deslocamento em massa."),
      4,
    ),
  ],
};

const stackTrace: TraceDefinition = {
  id: "stack-push-pop",
  scene: {
    nodes: [
      node("s0", "slot", 48, 176, 94, 58, {
        abstract: "[0]",
        practical: "base",
        memory: "slot 0",
      }),
      node("s1", "slot", 152, 176, 94, 58, {
        abstract: "[1]",
        practical: "meio",
        memory: "slot 1",
      }),
      node("s2", "slot", 256, 176, 94, 58, {
        abstract: "[2]",
        practical: "topo",
        memory: "slot 2",
      }),
      node("a", "block", 48, 176, 94, 56, {
        abstract: "3",
        practical: "Digitar",
        memory: "3 · base",
      }, { visible: false }),
      node("b", "block", 152, 176, 94, 56, {
        abstract: "8",
        practical: "Negrito",
        memory: "8 · meio",
      }, { visible: false }),
      node("c", "block", 256, 176, 94, 56, {
        abstract: "13",
        practical: "Imagem",
        memory: "13 · topo",
      }, { visible: false }),
      node("top", "tag", 48, 130, 70, 25, {
        abstract: "topo",
        practical: "topo",
        memory: "topo",
      }, { visible: false }),
    ],
    edges: [],
  },
  code: [
    "stack.push(3);",
    "stack.push(8);",
    "stack.push(13);",
    "let value = stack.pop();",
  ],
  steps: [
    step(
      "stack-start",
      "START",
      [
        { type: "HIGHLIGHT", targets: ["s0", "s1", "s2"], emphasis: "idle" },
      ],
      "Pilha vazia. Itens esperam para entrar.",
      "Nenhuma ação registrada. Três posições disponíveis.",
      "A pilha está vazia; os slots esperam valores.",
      metrics(0, 0, "O(1)", "Estado inicial: nenhuma operação."),
      0,
    ),
    step(
      "stack-push-3",
      "PUSH",
      [
        { type: "INSERT", target: "a" },
        { type: "INSERT", target: "top" },
        { type: "HIGHLIGHT", targets: ["a", "top"], emphasis: "active" },
      ],
      "3 entra no topo da pilha.",
      "Digitar é registrado como primeira ação.",
      "O primeiro valor ocupa a base e o topo coincide com ela.",
      metrics(1, 1, "O(1)", "Push insere no topo em tempo constante."),
      0,
    ),
    step(
      "stack-push-8",
      "PUSH",
      [
        { type: "HIGHLIGHT", targets: ["a"], emphasis: "visited" },
        { type: "INSERT", target: "b" },
        { type: "MOVE", target: "top", to: { x: 152, y: 130 } },
        { type: "HIGHLIGHT", targets: ["b", "top"], emphasis: "active" },
      ],
      "8 empilhado sobre 3.",
      "Negrito é empilhado sobre Digitar.",
      "O novo valor passa a ser o topo; 3 permanece abaixo.",
      metrics(2, 2, "O(1)", "Push mantém O(1) independente do tamanho."),
      1,
    ),
    step(
      "stack-push-13",
      "PUSH",
      [
        { type: "HIGHLIGHT", targets: ["b"], emphasis: "visited" },
        { type: "INSERT", target: "c" },
        { type: "MOVE", target: "top", to: { x: 256, y: 130 } },
        { type: "HIGHLIGHT", targets: ["c", "top"], emphasis: "active" },
      ],
      "13 empilhado. Topo aponta para 13.",
      "Imagem é empilhada. Topo aponta para a última ação.",
      "Três valores na pilha; topo indica o último inserido.",
      metrics(3, 3, "O(1)", "Três pushes com custo constante cada."),
      2,
    ),
    step(
      "stack-pop",
      "POP",
      [
        { type: "HIGHLIGHT", targets: ["c"], emphasis: "visited" },
        { type: "MOVE", target: "top", to: { x: 152, y: 130 } },
        { type: "HIGHLIGHT", targets: ["top"], emphasis: "active" },
      ],
      "13 desempilhado. Topo volta para 8.",
      "Imagem é desfeita. Topo volta para Negrito.",
      "O valor no topo é removido; o topo desce para o elemento anterior.",
      metrics(4, 3, "O(1)", "Pop remove do topo em tempo constante."),
      3,
    ),
    step(
      "stack-done",
      "DONE",
      [
        { type: "HIGHLIGHT", targets: ["a", "b"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["c"], emphasis: "muted" },
        { type: "HIGHLIGHT", targets: ["top"], emphasis: "idle" },
      ],
      "Pilha preserva 3 e 8.",
      "Digitar e Negrito permanecem; Imagem foi removida.",
      "Dois valores na pilha; o topo aponta para o segundo nível.",
      metrics(4, 3, "O(1)", "Operações totais: 4; pilha com 2 elementos."),
      3,
    ),
  ],
};

const queueTrace: TraceDefinition = {
  id: "queue-enqueue-dequeue",
  scene: {
    nodes: [
      node("rail", "rail", 48, 176, 560, 58, {
        abstract: "",
        practical: "",
        memory: "",
      }),
      node("a", "block", 86, 176, 94, 56, {
        abstract: "2",
        practical: "Pedido 41",
        memory: "2 · frente",
      }),
      node("b", "block", 196, 176, 94, 56, {
        abstract: "5",
        practical: "Pedido 42",
        memory: "5 · meio",
      }),
      node("c", "block", 306, 176, 94, 56, {
        abstract: "9",
        practical: "Pedido 43",
        memory: "9 · meio",
      }),
      node("d", "block", 416, 176, 94, 56, {
        abstract: "12",
        practical: "Pedido 44",
        memory: "12 · fim",
      }, { visible: false }),
      node("front", "tag", 86, 130, 70, 25, {
        abstract: "front",
        practical: "front",
        memory: "front",
      }),
      node("rear", "tag", 306, 130, 70, 25, {
        abstract: "rear",
        practical: "rear",
        memory: "rear",
      }),
    ],
    edges: [],
  },
  code: [
    "queue.enqueue(2);",
    "queue.enqueue(5);",
    "queue.enqueue(9);",
    "queue.enqueue(12);",
    "let value = queue.dequeue();",
  ],
  steps: [
    step(
      "queue-start",
      "START",
      [
        { type: "HIGHLIGHT", targets: ["front", "rear"], emphasis: "active" },
      ],
      "Fila com quatro pedidos.",
      "Pedidos 41 a 44 aguardam processamento.",
      "Front aponta para o primeiro; rear aponta para o último.",
      metrics(0, 0, "O(1)", "Estado inicial da fila."),
      0,
    ),
    step(
      "queue-enqueue",
      "ENQUEUE",
      [
        { type: "INSERT", target: "d" },
        { type: "MOVE", target: "rear", to: { x: 416, y: 130 } },
        { type: "HIGHLIGHT", targets: ["d", "rear"], emphasis: "active" },
      ],
      "Pedido 44 chega ao fim da fila.",
      "O pedido 44 é registrado ao final.",
      "Rear avança para o novo último elemento.",
      metrics(1, 1, "O(1)", "Enqueue insere no fim em O(1)."),
      3,
    ),
    step(
      "queue-front",
      "FRONT",
      [
        { type: "HIGHLIGHT", targets: ["rear"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["d"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["a", "front"], emphasis: "active" },
      ],
      "Front aponta para pedido 41.",
      "O primeiro da fila é o pedido 41.",
      "Front indica o elemento que será removido no dequeue.",
      metrics(0, 0, "O(1)", "Consultar front não altera a estrutura."),
      4,
    ),
    step(
      "queue-dequeue",
      "DEQUEUE",
      [
        { type: "REMOVE", target: "a" },
        { type: "MOVE", target: "front", to: { x: 196, y: 130 } },
        { type: "HIGHLIGHT", targets: ["b", "front"], emphasis: "active" },
      ],
      "Pedido 41 sai pelo front.",
      "O pedido 41 é processado e removido.",
      "O front avança para o próximo elemento na fila.",
      metrics(2, 2, "O(1)", "Dequeue remove do início em O(1)."),
      4,
    ),
    step(
      "queue-done",
      "DONE",
      [
        { type: "HIGHLIGHT", targets: ["front", "rear"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["b", "c", "d"], emphasis: "idle" },
      ],
      "Front avança; fila mantém ordem.",
      "O pedido 42 agora é o primeiro; a ordem dos demais é preservada.",
      "A fila mantém a ordem FIFO após a remoção.",
      metrics(2, 2, "O(1)", "Fila com três elementos após dequeue."),
      4,
    ),
  ],
};

const dequeTrace: TraceDefinition = {
  id: "deque-push-front-back",
  scene: {
    nodes: [
      node("rail", "rail", 48, 176, 480, 58, {
        abstract: "",
        practical: "",
        memory: "",
      }),
      node("a", "block", 130, 176, 98, 56, {
        abstract: "B",
        practical: "Música B",
        memory: "B · meio",
      }),
      node("b", "block", 300, 176, 98, 56, {
        abstract: "C",
        practical: "Música C",
        memory: "C · meio",
      }),
      node("urgent", "block", 48, 176, 98, 56, {
        abstract: "A",
        practical: "Tocar agora",
        memory: "A · frente",
      }, { visible: false }),
      node("normal", "block", 424, 176, 98, 56, {
        abstract: "D",
        practical: "Música D",
        memory: "D · fim",
      }, { visible: false }),
      node("left", "tag", 130, 134, 70, 25, {
        abstract: "front",
        practical: "próxima",
        memory: "front",
      }),
      node("right", "tag", 300, 134, 70, 25, {
        abstract: "rear",
        practical: "final",
        memory: "rear",
      }),
    ],
    edges: [],
  },
  code: [
    "deque.pushFront(A);",
    "deque.pushBack(D);",
    "let next = deque.popFront();",
  ],
  steps: [
    step(
      "deque-start",
      "START",
      [
        { type: "HIGHLIGHT", targets: ["a", "b"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["left", "right"], emphasis: "active" },
      ],
      "Deque com B e C. Front e rear.",
      "Duas músicas na fila: B e C. Próxima e final destacados.",
      "O deque contém dois elementos; front e rear apontam para extremos distintos.",
      metrics(0, 0, "O(1)", "Estado inicial com dois elementos."),
      0,
    ),
    step(
      "deque-push-front",
      "PUSH_FRONT",
      [
        { type: "INSERT", target: "urgent" },
        { type: "MOVE", target: "left", to: { x: 48, y: 134 } },
        { type: "HIGHLIGHT", targets: ["urgent", "left"], emphasis: "active" },
      ],
      "A entra no front.",
      "Música A entra como 'tocar agora' no início.",
      "Um novo elemento é inserido na extremidade frontal.",
      metrics(1, 1, "O(1)", "PushFront insere no início em O(1)."),
      0,
    ),
    step(
      "deque-push-back",
      "PUSH_BACK",
      [
        { type: "HIGHLIGHT", targets: ["urgent", "left"], emphasis: "idle" },
        { type: "INSERT", target: "normal" },
        { type: "MOVE", target: "right", to: { x: 424, y: 134 } },
        { type: "HIGHLIGHT", targets: ["normal", "right"], emphasis: "active" },
      ],
      "D entra no rear.",
      "Música D é adicionada ao final da fila.",
      "Um novo elemento é inserido na extremidade posterior.",
      metrics(2, 2, "O(1)", "PushBack insere no fim em O(1)."),
      1,
    ),
    step(
      "deque-pop-front",
      "POP_FRONT",
      [
        { type: "REMOVE", target: "urgent" },
        { type: "MOVE", target: "left", to: { x: 130, y: 134 } },
        { type: "HIGHLIGHT", targets: ["a", "left"], emphasis: "active" },
      ],
      "A sai pelo front.",
      "Música A é tocada e removida da frente.",
      "O elemento frontal é removido; front avança para B.",
      metrics(3, 2, "O(1)", "PopFront remove do início em O(1)."),
      2,
    ),
    step(
      "deque-done",
      "DONE",
      [
        { type: "HIGHLIGHT", targets: ["a", "b", "normal"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["left", "right"], emphasis: "idle" },
      ],
      "Front agora é B.",
      "B é a próxima música a tocar.",
      "Deque preserva B, C, D após remoção frontal.",
      metrics(3, 2, "O(1)", "Três elementos restantes após popFront."),
      2,
    ),
  ],
};

const linearLessons: LessonDefinition[] = [
  {
    id: "doubly-linked-list",
    title: "Lista duplamente encadeada: insira com ida e volta",
    shortTitle: "Lista dupla",
    module: "data-structure",
    icon: "↔",
    difficulty: "foundation",
    prerequisites: ["linked-list"],
    objectives: [
      "Navegar nos dois sentidos",
      "Explicar quatro referências do relink",
      "Contextualizar inserção O(1)",
    ],
    description:
      "Cada item conhece o anterior e o próximo, permitindo navegar nos dois sentidos.",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "Históricos de voltar/avançar costumam usar semântica bidirecional; algumas implementações equivalentes usam duas pilhas.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Inserir entre dois nós mantendo referências anteriores e posteriores.",
      model: "Preservar next e prev, depois ajustar quatro referências.",
      cost: "Inserção local é O(1); acesso por índice é O(n).",
      whenToUse: "Quando navegação bidirecional é necessária.",
      alternative:
        "Lista simples usa menos memória por nó, mas só permite avançar.",
    },
    challenge: {
      question: "Quantas referências locais mudam nessa inserção?",
      hint: "Conte quantas setas precisam ser redesenhadas.",
      choices: [
        { id: "four", label: "Quatro", correct: true },
        { id: "two", label: "Duas", correct: false },
        { id: "one", label: "Uma", correct: false },
      ],
      success:
        "Isso: as referências next dos adjacentes e prev dos adjacentes — quatro ao todo.",
    },
    limitation: {
      title: "E se fosse uma lista simples?",
      goodLabel: "Lista dupla",
      goodValue: "navegação bidirecional",
      goodWidth: 26,
      badLabel: "Lista simples",
      badValue: "só avança",
      badWidth: 74,
      text: "A lista dupla gasta um ponteiro extra por nó em troca de navegação reversa.",
    },
    trace: doublyTrace,
  },
  {
    id: "stack",
    title: "Pilha: push e pop",
    shortTitle: "Pilha",
    module: "data-structure",
    icon: "▤",
    difficulty: "foundation",
    prerequisites: ["linked-list"],
    objectives: [
      "Compreender LIFO",
      "Observar o topo da pilha",
      "Distinguir push e pop",
    ],
    description: "O último elemento a entrar é o primeiro a sair (LIFO).",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "Desfazer/refazer e pilhas de chamadas usam diretamente a regra último a entrar, primeiro a sair.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Empilhar e desempilhar valores em ordem LIFO.",
      model: "O topo da pilha é a única posição de acesso.",
      cost: "Push e pop são O(1).",
      whenToUse: "Quando a ordem inversa de inserção é a ordem de consumo.",
      alternative:
        "Fila preserva ordem de inserção; deque permite ambos os lados.",
    },
    challenge: {
      question: "Qual valor sai primeiro depois do push?",
      hint: "Observe a posição do topo.",
      choices: [
        { id: "last", label: "O último empilhado", correct: true },
        { id: "first", label: "O primeiro empilhado", correct: false },
        { id: "smallest", label: "O menor valor", correct: false },
      ],
      success:
        "Correto: pilha é LIFO — o último a entrar é o primeiro a sair.",
    },
    limitation: {
      title: "E se fosse uma fila?",
      goodLabel: "Pilha",
      goodValue: "LIFO direto",
      goodWidth: 24,
      badLabel: "Fila",
      badValue: "LIFO exigiria esvaziar tudo",
      badWidth: 76,
      text: "Pilha é ideal para desfazer/refazer; fila inverte a ordem.",
    },
    trace: stackTrace,
  },
  {
    id: "queue",
    title: "Fila: enqueue e dequeue",
    shortTitle: "Fila",
    module: "data-structure",
    icon: "⇥",
    difficulty: "foundation",
    prerequisites: ["linked-list"],
    comparisonId: "array-queue",
    objectives: [
      "Compreender FIFO",
      "Observar front e rear",
      "Distinguir enqueue e dequeue",
    ],
    description: "Primeiro a entrar, primeiro a sair (FIFO).",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "Spoolers de impressão, brokers e workers usam filas para preservar ordem ou distribuir trabalho.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Processar itens na ordem em que chegam.",
      model: "Inserir no fim e remover do início.",
      cost:
        "Enqueue e dequeue são O(1) em uma fila baseada em lista.",
      whenToUse:
        "Quando a ordem de chegada determina o processamento.",
      alternative:
        "Pilha inverte a ordem; deque permite entrada/saída nas duas pontas.",
    },
    challenge: {
      question: "Qual elemento deve sair primeiro?",
      hint: "Observe a extremidade de saída.",
      choices: [
        { id: "first", label: "O primeiro que entrou", correct: true },
        { id: "last", label: "O último que entrou", correct: false },
        { id: "largest", label: "O maior valor", correct: false },
      ],
      success:
        "Exato: fila é FIFO — o primeiro a entrar é o primeiro a sair.",
    },
    limitation: {
      title: "E se fosse uma pilha?",
      goodLabel: "Fila",
      goodValue: "FIFO natural",
      goodWidth: 22,
      badLabel: "Pilha",
      badValue: "inverte a ordem",
      badWidth: 78,
      text: "Fila mantém ordem de chegada; pilha entregaria o pedido mais recente primeiro.",
    },
    trace: queueTrace,
  },
  {
    id: "deque",
    title: "Deque: insira nas duas extremidades",
    shortTitle: "Deque",
    module: "data-structure",
    icon: "⇆",
    difficulty: "foundation",
    prerequisites: ["queue"],
    objectives: [
      "Operar nas duas pontas",
      "Combinar fila e pilha",
      "Distinguir pushFront e popFront",
    ],
    description:
      "Permite inserir e remover tanto no início quanto no final.",
    example: {
      kind: "possible-modeling",
      label: "Modelagem possível",
      note: "A ação 'tocar agora' pode entrar no início e 'adicionar à fila' pode entrar no final, comportamento natural de um deque.",
    },
    representations: allRepresentations,
    explanation: {
      problem:
        "Inserir e remover nas duas pontas com eficiência.",
      model:
        "Manter referências para front e rear; cada operação ajusta apenas a ponta correspondente.",
      cost:
        "Inserção e remoção nas pontas são O(1).",
      whenToUse:
        "Quando fila e pilha são insuficientes e você precisa de ambos os comportamentos.",
      alternative:
        "Duas pilhas podem simular um deque com custo amortizado.",
    },
    challenge: {
      question:
        "O que diferencia um deque de uma fila comum?",
      hint: "Observe as operações disponíveis.",
      choices: [
        {
          id: "both-ends",
          label: "Opera nos dois lados",
          correct: true,
        },
        {
          id: "unique",
          label: "Só aceita valores únicos",
          correct: false,
        },
        {
          id: "sorted",
          label: "Mantém os itens ordenados",
          correct: false,
        },
      ],
      success:
        "Isso: deque permite inserção e remoção tanto no front quanto no rear.",
    },
    limitation: {
      title: "E se fosse uma fila comum?",
      goodLabel: "Deque",
      goodValue: "opera nas duas pontas",
      goodWidth: 38,
      badLabel: "Fila",
      badValue: "só opera no rear/front",
      badWidth: 62,
      text: "Deque é mais flexível; fila é mais simples e previsível.",
    },
    trace: dequeTrace,
  },
];

export { linearLessons };
