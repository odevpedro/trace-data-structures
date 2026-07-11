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

const linkedListTrace: TraceDefinition = {
  id: "linked-list-insert",
  scene: {
    nodes: [
      node("a", "linked", 52, 184, 92, 56, {
        abstract: "4",
        practical: "Música A",
        memory: "nó · 4",
      }),
      node("b", "linked", 178, 60, 92, 56, {
        abstract: "7",
        practical: "Música nova",
        memory: "nó · 7",
      }, { visible: false }),
      node("c", "linked", 304, 184, 104, 56, {
        abstract: "12",
        practical: "Música B",
        memory: "nó · 12",
      }),
      node("d", "linked", 482, 184, 108, 56, {
        abstract: "18",
        practical: "Música C",
        memory: "nó · 18",
      }),
      node("head", "tag", 52, 138, 70, 25, {
        abstract: "head",
        practical: "tocando agora",
        memory: "início",
      }),
      node("saved", "tag", 244, 268, 170, 28, {
        abstract: "next = 12",
        practical: "próxima preservada",
        memory: "ref guardada",
      }, { visible: false }),
    ],
    edges: [
      { id: "old", from: "a", to: "c", directed: true },
      { id: "cd", from: "c", to: "d", directed: true },
      { id: "ab", from: "a", to: "b", directed: true, visible: false },
      { id: "bc", from: "b", to: "c", directed: true, visible: false },
    ],
  },
  code: [
    "function insertAfter(node, newNode) {",
    "  newNode.next = node.next;",
    "  node.next = newNode;",
    "}",
  ],
  steps: [
    step(
      "linked-start",
      "OBSERVE",
      [{ type: "HIGHLIGHT", targets: ["head"], emphasis: "active" }],
      "A lista contém 4 → 12 → 18.",
      "A playlist tem Música A → Música B → Música C.",
      "Cada nó guarda um valor e uma referência para o próximo.",
      metrics(0, 0, "O(1)", "Acesso à cabeça da lista é constante."),
      0,
    ),
    step(
      "linked-allocate",
      "ALLOCATE",
      [
        { type: "HIGHLIGHT", targets: ["head"], emphasis: "idle" },
        { type: "INSERT", target: "b" },
      ],
      "Um novo nó 7 é criado fora da lista.",
      "Uma nova música é preparada fora da sequência.",
      "O nó existe na memória, mas ainda não está ligado à cadeia.",
      metrics(1, 1, "O(1)", "Criar um nó isolado é constante."),
      0,
    ),
    step(
      "linked-preserve",
      "PRESERVE",
      [
        { type: "HIGHLIGHT", targets: ["b"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["old"], emphasis: "active" },
        { type: "INSERT", target: "saved" },
      ],
      "A referência 4 → 12 é preservada.",
      "A ligação de Música A para Música B é preservada.",
      "O próximo de a (12) é salvo antes de qualquer alteração.",
      metrics(2, 2, "O(1)", "Preservar uma referência é constante."),
      1,
    ),
    step(
      "linked-relink",
      "RELINK",
      [
        { type: "HIGHLIGHT", targets: ["saved"], emphasis: "idle" },
        { type: "UNLINK", from: "a", to: "c", edgeId: "old" },
        { type: "LINK", from: "a", to: "b", edgeId: "ab" },
        { type: "LINK", from: "b", to: "c", edgeId: "bc" },
        { type: "HIGHLIGHT", targets: ["b"], emphasis: "active" },
      ],
      "4 aponta para 7; 7 aponta para 12.",
      "Música A aponta para a nova faixa; a nova faixa aponta para Música B.",
      "Duas ligações são ajustadas: a → b e b → c. A cadeia permanece íntegra.",
      metrics(4, 3, "O(1)", "Inserção em lista ligada: duas operações de ponteiro, sem deslocamentos."),
      1,
    ),
    step(
      "linked-done",
      "DONE",
      [
        { type: "HIGHLIGHT", targets: ["b"], emphasis: "visited" },
        { type: "MOVE", target: "b", to: { x: 178, y: 184 } },
        { type: "HIGHLIGHT", targets: ["ab"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["bc"], emphasis: "idle" },
      ],
      "O nó 7 assenta entre 4 e 12.",
      "A nova música passa a fazer parte da playlist.",
      "O nó ocupa seu lugar na ordem linear; nenhum outro elemento foi deslocado.",
      metrics(4, 3, "O(1)", "Quatro operações totais; nenhum deslocamento em massa."),
      2,
    ),
  ],
};

const arrayTrace: TraceDefinition = {
  id: "array-middle-insert",
  scene: {
    nodes: [
      ...[0, 1, 2, 3, 4].map((index) =>
        node(`slot-${index}`, "slot", 45 + index * 112, 176, 96, 60, {
          abstract: `[${index}]`,
          practical: `posição ${index + 1}`,
          memory: `0x10${index * 4}`,
        }),
      ),
      node("four", "block", 45, 176, 96, 60, {
        abstract: "4",
        practical: "Câmera",
        memory: "0x100 · 4",
      }),
      node("eight", "block", 157, 176, 96, 60, {
        abstract: "8",
        practical: "Mapas",
        memory: "0x104 · 8",
      }),
      node("twelve", "block", 269, 176, 96, 60, {
        abstract: "12",
        practical: "Música",
        memory: "0x108 · 12",
      }),
      node("sixteen", "block", 381, 176, 96, 60, {
        abstract: "16",
        practical: "Fotos",
        memory: "0x10C · 16",
      }),
      node("six", "block", 157, 52, 96, 60, {
        abstract: "6",
        practical: "Chat",
        memory: "novo · 6",
      }),
      node("rule", "tag", 45, 270, 212, 32, {
        abstract: "índices contíguos",
        practical: "posições ordenadas",
        memory: "endereços +4 bytes",
      }),
    ],
    edges: [],
  },
  code: [
    "function insertAt(items, index, value) {",
    "  for (let i = items.length; i > index; i--) {",
    "    items[i] = items[i - 1];",
    "  }",
    "  items[index] = value;",
    "}",
  ],
  steps: [
    step(
      "array-start",
      "OBSERVE",
      [{ type: "HIGHLIGHT", targets: ["six"], emphasis: "active" }],
      "O valor 6 aguarda fora do array.",
      "O ícone Chat aguarda uma posição.",
      "Há quatro valores contíguos e uma inserção solicitada no índice 1.",
      metrics(0, 0, "O(1)", "Ler o índice de destino é constante."),
      0,
    ),
    step(
      "array-shift-16",
      "SHIFT",
      [
        { type: "HIGHLIGHT", targets: ["six"], emphasis: "idle" },
        { type: "MOVE", target: "sixteen", to: { x: 493, y: 176 } },
      ],
      "16 se desloca primeiro para não ser sobrescrito.",
      "Fotos abre a última posição.",
      "O deslocamento começa pela direita e preserva cada valor.",
      metrics(1, 1, "O(n)", "No pior caso, todos os itens posteriores se movem."),
      2,
    ),
    step(
      "array-shift-12",
      "SHIFT",
      [
        { type: "HIGHLIGHT", targets: ["sixteen"], emphasis: "visited" },
        { type: "MOVE", target: "twelve", to: { x: 381, y: 176 } },
      ],
      "12 avança uma posição.",
      "Música acompanha o deslocamento.",
      "Uma escrita adicional toca o próximo elemento posterior.",
      metrics(2, 2, "O(n)", "O custo cresce com os elementos após o índice."),
      2,
    ),
    step(
      "array-shift-8",
      "SHIFT",
      [
        { type: "HIGHLIGHT", targets: ["twelve"], emphasis: "visited" },
        { type: "MOVE", target: "eight", to: { x: 269, y: 176 } },
      ],
      "8 libera o índice 1.",
      "Mapas deixa a segunda posição livre.",
      "O espaço solicitado está livre sem perda de dados.",
      metrics(3, 3, "O(n)", "Três itens foram deslocados nesta entrada."),
      2,
    ),
    step(
      "array-insert",
      "INSERT",
      [
        { type: "HIGHLIGHT", targets: ["eight"], emphasis: "visited" },
        { type: "INSERT", target: "six", position: { x: 157, y: 176 } },
        { type: "HIGHLIGHT", targets: ["six"], emphasis: "success" },
      ],
      "6 ocupa o índice 1.",
      "Chat ocupa a posição liberada.",
      "A coleção permanece contígua depois de quatro escritas.",
      metrics(4, 4, "O(n)", "Inserção no meio; acesso por índice continua O(1)."),
      4,
    ),
  ],
};

const linearSearchTrace: TraceDefinition = {
  id: "linear-search",
  scene: {
    nodes: [
      node("target", "pill", 248, 52, 144, 44, {
        abstract: "alvo = 12",
        practical: "buscar Música",
        memory: "alvo @ 0x080 = 12",
      }),
      ...[
        ["item-0", "4", "Câmera", "0x100 · 4"],
        ["item-1", "8", "Mapas", "0x104 · 8"],
        ["item-2", "12", "Música", "0x108 · 12"],
        ["item-3", "16", "Fotos", "0x10C · 16"],
      ].map(([id, abstract, practical, memory], index) =>
        node(id, "block", 77 + index * 128, 174, 104, 64, {
          abstract,
          practical,
          memory,
        }),
      ),
      node("answer", "tag", 236, 274, 168, 34, {
        abstract: "índice = ?",
        practical: "posição = ?",
        memory: "endereço = ?",
      }),
    ],
    edges: [],
  },
  code: [
    "function linearSearch(items, target) {",
    "  for (let i = 0; i < items.length; i++) {",
    "    if (items[i] === target) return i;",
    "  }",
    "  return -1;",
    "}",
  ],
  steps: [
    step(
      "search-start",
      "OBSERVE",
      [{ type: "HIGHLIGHT", targets: ["target"], emphasis: "active" }],
      "A busca conhece o alvo, não sua posição.",
      "A interface precisa localizar Música.",
      "Sem índice auxiliar, começamos no primeiro elemento.",
      metrics(0, 0, "O(1)", "Preparar alvo e cursor é constante."),
      0,
    ),
    step(
      "search-4",
      "COMPARE",
      [
        { type: "HIGHLIGHT", targets: ["target"], emphasis: "idle" },
        { type: "COMPARE", targets: ["item-0", "target"] },
      ],
      "4 não é 12; avance.",
      "Câmera não é Música; avance.",
      "A primeira comparação falha e o cursor segue em frente.",
      metrics(1, 1, "O(n)", "Busca linear pode tocar cada item no pior caso."),
      2,
    ),
    step(
      "search-8",
      "COMPARE",
      [
        { type: "HIGHLIGHT", targets: ["item-0"], emphasis: "visited" },
        { type: "COMPARE", targets: ["item-1", "target"] },
      ],
      "8 também não é 12.",
      "Mapas também não é Música.",
      "A busca preserva o histórico visual dos itens já lidos.",
      metrics(2, 2, "O(n)", "O custo observado já é duas comparações."),
      2,
    ),
    step(
      "search-12",
      "COMPARE",
      [
        { type: "HIGHLIGHT", targets: ["item-1"], emphasis: "visited" },
        { type: "COMPARE", targets: ["item-2", "target"] },
        { type: "HIGHLIGHT", targets: ["item-2"], emphasis: "success" },
      ],
      "12 corresponde ao alvo.",
      "Música foi encontrada.",
      "A condição de igualdade encerra o loop no índice 2.",
      metrics(3, 3, "O(n)", "Caso observado: três de quatro itens tocados."),
      2,
    ),
    step(
      "search-return",
      "RETURN",
      [{ type: "RETURN_VALUE", target: "answer", value: 2 }],
      "A função retorna o índice 2.",
      "A interface recebe a terceira posição.",
      "O resultado aponta para o mesmo endereço lido no passo anterior.",
      metrics(4, 3, "O(n)", "Retornar é O(1); a busca acumulada permanece O(n)."),
      2,
    ),
  ],
};

function createIfTrace(inputs: Record<string, number>): TraceDefinition {
  const age = inputs.age ?? 16;
  const allowed = age >= 18;
  const all = ["age", "threshold", "condition", "allowed", "blocked", "result"];
  const clear: TraceEvent = { type: "HIGHLIGHT", targets: all, emphasis: "idle" };

  return {
    id: `if-age-${age}`,
    scene: {
      nodes: [
        node(
          "age",
          "memory",
          52,
          54,
          152,
          54,
          { abstract: "idade", practical: "idade informada", memory: "0x20 · idade" },
          { valueLabels: { abstract: "idade = ", practical: "idade = ", memory: "0x20 · " }, value: age },
        ),
        node(
          "threshold",
          "memory",
          436,
          54,
          152,
          54,
          { abstract: "limite", practical: "idade mínima", memory: "constante" },
          { valueLabels: { abstract: "limite = ", practical: "mínimo = ", memory: "literal · " }, value: 18 },
        ),
        node("condition", "decision", 230, 142, 180, 68, {
          abstract: "idade ≥ 18 ?",
          practical: "pode entrar?",
          memory: "COMPARE 0x20, 18",
        }),
        node("allowed", "block", 84, 256, 170, 52, {
          abstract: "ramo true",
          practical: "acesso permitido",
          memory: "PC → bloco true",
        }),
        node("blocked", "block", 386, 256, 170, 52, {
          abstract: "ramo false",
          practical: "acesso bloqueado",
          memory: "PC → bloco false",
        }),
        node(
          "result",
          "tag",
          236,
          322,
          168,
          32,
          { abstract: "resultado", practical: "decisão", memory: "retorno" },
          { visible: false, valueLabels: { abstract: "resultado = ", practical: "decisão: ", memory: "return " } },
        ),
      ],
      edges: [
        { id: "condition-true", from: "condition", to: "allowed", directed: true },
        { id: "condition-false", from: "condition", to: "blocked", directed: true },
      ],
    },
    code: [
      `const idade = ${age};`,
      "const maiorDeIdade = idade >= 18;",
      "if (maiorDeIdade) {",
      '  return "permitido";',
      "}",
      'return "bloqueado";',
    ],
    steps: [
      step(
        "if-start",
        "INPUT",
        [clear, { type: "HIGHLIGHT", targets: ["age"], emphasis: "active" }],
        `A variável idade recebe ${age}.`,
        `A pessoa informa ${age} anos.`,
        "O valor de entrada é armazenado antes da condição.",
        metrics(1, 1, "O(1)", "Atribuição de um valor primitivo."),
        0,
      ),
      step(
        "if-read",
        "READ_MEMORY",
        [clear, { type: "READ_MEMORY", address: "0x20", target: "age" }],
        "A execução lê idade da memória.",
        "O sistema recupera a idade informada.",
        "A condição depende do valor guardado em 0x20.",
        metrics(2, 1, "O(1)", "Uma leitura local tem custo constante neste modelo."),
        1,
      ),
      step(
        "if-compare",
        "COMPARE",
        [clear, { type: "COMPARE", targets: ["age", "threshold", "condition"] }],
        `${age} ≥ 18 resulta em ${String(allowed)}.`,
        `A resposta à regra é ${allowed ? "sim" : "não"}.`,
        "A comparação produz um booleano; ainda não executa os dois ramos.",
        metrics(3, 2, "O(1)", "Uma comparação escalar."),
        1,
      ),
      step(
        "if-branch",
        "BRANCH",
        [
          clear,
          {
            type: "BRANCH",
            condition: "idade >= 18",
            result: allowed,
            target: "condition",
            trueTarget: "allowed",
            falseTarget: "blocked",
          },
        ],
        `Somente o ramo ${allowed ? "true" : "false"} é executado.`,
        `O fluxo segue para “${allowed ? "permitido" : "bloqueado"}”.`,
        "O cursor de execução escolhe exatamente um caminho.",
        metrics(4, 3, "O(1)", "If/else escolhe um ramo sem percorrer coleção."),
        allowed ? 3 : 5,
      ),
      step(
        "if-return",
        "RETURN",
        [
          clear,
          { type: "RETURN_VALUE", target: "result", value: allowed ? "permitido" : "bloqueado" },
        ],
        `A função retorna “${allowed ? "permitido" : "bloqueado"}”.`,
        "A decisão fica disponível para a interface.",
        "O valor de retorno encerra este fluxo.",
        metrics(5, 3, "O(1)", "Tempo e memória constantes para este exemplo."),
        allowed ? 3 : 5,
      ),
    ],
  };
}

function createLoopTrace(inputs: Record<string, number>): TraceDefinition {
  const limit = Math.min(5, Math.max(1, inputs.limit ?? 3));
  const ids = ["i", "limit", "condition", "sum", "body", "output"];
  const clear = (): TraceEvent => ({ type: "HIGHLIGHT", targets: ids, emphasis: "idle" });
  const steps: TraceStep[] = [
    step(
      "loop-start",
      "INITIALIZE",
      [clear(), { type: "WRITE_MEMORY", address: "i", target: "i", value: 0 }],
      "O loop inicializa i com zero.",
      "A contagem começa em zero.",
      "i e soma ocupam posições separadas no frame da função.",
      metrics(1, 1, "O(1)", "Inicialização única."),
      0,
    ),
  ];

  let sum = 0;
  for (let index = 0; index < limit; index += 1) {
    steps.push(
      step(
        `loop-check-${index}`,
        "BRANCH",
        [
          clear(),
          { type: "WRITE_MEMORY", address: "i", target: "i", value: index },
          { type: "COMPARE", targets: ["i", "limit", "condition"] },
          {
            type: "BRANCH",
            condition: `${index} < ${limit}`,
            result: true,
            target: "condition",
            trueTarget: "body",
          },
        ],
        `${index} < ${limit} é true; entre no corpo.`,
        `A repetição ${index + 1} pode executar.`,
        "O cursor testa a condição antes de cada iteração.",
        metrics(2 + index * 3, 2, "O(n)", `${limit} iterações configuradas.`),
        1,
      ),
    );
    sum += index;
    steps.push(
      step(
        `loop-body-${index}`,
        "WRITE_MEMORY",
        [
          clear(),
          { type: "HIGHLIGHT", targets: ["body"], emphasis: "active" },
          { type: "WRITE_MEMORY", address: "sum", target: "sum", value: sum },
        ],
        `soma recebe ${sum}; depois i avança.`,
        `O acumulador agora vale ${sum}.`,
        "Cada iteração lê i e escreve uma nova soma.",
        metrics(3 + index * 3, 3, "O(n)", `Iteração ${index + 1} de ${limit}.`),
        2,
      ),
    );
  }

  steps.push(
    step(
      "loop-stop",
      "BRANCH",
      [
        clear(),
        { type: "WRITE_MEMORY", address: "i", target: "i", value: limit },
        { type: "COMPARE", targets: ["i", "limit", "condition"] },
        {
          type: "BRANCH",
          condition: `${limit} < ${limit}`,
          result: false,
          target: "condition",
          falseTarget: "output",
        },
        { type: "RETURN_VALUE", target: "output", value: sum },
      ],
      `${limit} < ${limit} é false; o loop termina.`,
      `Após ${limit} repetições, o resultado é ${sum}.`,
      "A condição falsa impede uma iteração extra e libera o retorno.",
      metrics(2 + limit * 3, 4, "O(n)", `Tempo proporcional a n=${limit}; espaço auxiliar O(1).`),
      4,
    ),
  );

  return {
    id: `for-loop-${limit}`,
    scene: {
      nodes: [
        node("i", "memory", 52, 58, 132, 52, { abstract: "i", practical: "contador", memory: "stack · i" }, { valueLabels: { abstract: "i = ", practical: "volta = ", memory: "i @ 0x30 = " }, value: 0 }),
        node("limit", "memory", 456, 58, 132, 52, { abstract: "n", practical: "total", memory: "stack · n" }, { valueLabels: { abstract: "n = ", practical: "total = ", memory: "n @ 0x34 = " }, value: limit }),
        node("condition", "decision", 228, 138, 184, 66, { abstract: "i < n ?", practical: "ainda repete?", memory: "CMP i, n" }),
        node("body", "block", 72, 252, 180, 54, { abstract: "soma += i", practical: "acumular volta", memory: "READ i → WRITE soma" }),
        node("sum", "memory", 388, 252, 180, 54, { abstract: "soma", practical: "acumulado", memory: "stack · soma" }, { valueLabels: { abstract: "soma = ", practical: "acumulado = ", memory: "soma @ 0x38 = " }, value: 0 }),
        node("output", "tag", 236, 322, 168, 32, { abstract: "retorno", practical: "resultado", memory: "return" }, { visible: false, valueLabels: { abstract: "retorno = ", practical: "resultado = ", memory: "return " } }),
      ],
      edges: [
        { id: "condition-body", from: "condition", to: "body", directed: true },
        { id: "condition-output", from: "condition", to: "output", directed: true },
      ],
    },
    code: [
      "let soma = 0;",
      `for (let i = 0; i < ${limit}; i++) {`,
      "  soma += i;",
      "}",
      "return soma;",
    ],
    steps,
  };
}

const memoryTrace: TraceDefinition = {
  id: "reference-memory",
  scene: {
    nodes: [
      node("call", "tag", 238, 26, 164, 34, {
        abstract: "criar Pessoa",
        practical: "novo perfil",
        memory: "CALL criarPessoa()",
      }),
      node("frame", "memory", 48, 102, 224, 210, {
        abstract: "frame criarPessoa",
        practical: "mesa de trabalho",
        memory: "CALL STACK · frame #1",
      }, { visible: false }),
      node("reference", "memory", 78, 184, 164, 58, {
        abstract: "referência pessoa",
        practical: "etiqueta do perfil",
        memory: "pessoa @ 0x40",
      }, { visible: false, valueLabels: { abstract: "pessoa → ", practical: "etiqueta → ", memory: "0x40 → " } }),
      node("heap", "memory", 376, 118, 216, 154, {
        abstract: "objeto Pessoa",
        practical: "dados do perfil",
        memory: "HEAP · 0xA104",
      }, { visible: false, valueLabels: { abstract: "Pessoa ", practical: "perfil ", memory: "0xA104 · " } }),
    ],
    edges: [{ id: "reference-heap", from: "reference", to: "heap", directed: true, visible: false }],
  },
  code: [
    "function criarPessoa() {",
    '  const pessoa = { nome: "Ana" };',
    '  pessoa.nome = "Bia";',
    "  return pessoa;",
    "}",
  ],
  steps: [
    step("memory-call", "CALL_FUNCTION", [{ type: "CALL_FUNCTION", functionName: "criarPessoa", target: "call" }], "A função criarPessoa é chamada.", "A criação de um perfil começa.", "Uma chamada prepara um novo stack frame.", metrics(1, 1, "O(1)", "Entrada em uma função."), 0),
    step("memory-frame", "PUSH_STACK_FRAME", [{ type: "HIGHLIGHT", targets: ["call"], emphasis: "visited" }, { type: "PUSH_STACK_FRAME", frameId: "frame" }], "Um frame entra na call stack.", "A função ganha uma área de trabalho temporária.", "O frame guarda variáveis locais enquanto a chamada está ativa.", metrics(2, 2, "O(1)", "Um frame de tamanho constante neste exemplo."), 0),
    step("memory-allocate", "WRITE_MEMORY", [{ type: "INSERT", target: "reference" }, { type: "WRITE_MEMORY", address: "0x40", target: "reference", value: "0xA104" }, { type: "INSERT", target: "heap" }, { type: "WRITE_MEMORY", address: "0xA104", target: "heap", value: '{ nome: "Ana" }' }, { type: "LINK", from: "reference", to: "heap", edgeId: "reference-heap" }], "A variável guarda uma referência, não o objeto inteiro.", "A etiqueta aponta para os dados do perfil.", "A referência está no frame; o objeto pedagógico está no heap.", metrics(5, 3, "O(1)", "Objeto pequeno e conhecido; alocação simplificada."), 1),
    step("memory-mutate", "WRITE_MEMORY", [{ type: "HIGHLIGHT", targets: ["reference"], emphasis: "visited" }, { type: "WRITE_MEMORY", address: "0xA104", target: "heap", value: '{ nome: "Bia" }' }], "A mutação altera o objeto em 0xA104.", "O mesmo perfil agora contém o nome Bia.", "A referência continua igual; o conteúdo no endereço apontado muda.", metrics(6, 3, "O(1)", "Atualização de uma propriedade conhecida."), 2),
    step("memory-return", "RETURN_VALUE", [{ type: "RETURN_VALUE", target: "reference", value: "0xA104" }, { type: "HIGHLIGHT", targets: ["heap"], emphasis: "success" }], "A função retorna a referência 0xA104.", "A interface recebe acesso ao perfil.", "Esta é uma simulação pedagógica, não um endereço literal do navegador.", metrics(7, 3, "O(1)", "Retornar uma referência é constante."), 3),
  ],
};

const systemDesignTrace: TraceDefinition = {
  id: "client-api-database",
  scene: {
    nodes: [
      node("client", "service", 42, 128, 150, 92, { abstract: "Cliente", practical: "Checkout", memory: "processo cliente" }),
      node("api", "service", 245, 128, 150, 92, { abstract: "API", practical: "Serviço de pedidos", memory: "processo API" }),
      node("database", "service", 448, 128, 150, 92, { abstract: "Banco", practical: "Pedidos", memory: "persistência" }, { valueLabels: { abstract: "Banco · ", practical: "Pedidos · ", memory: "storage · " } }),
      node("request", "message", 72, 260, 90, 34, { abstract: "POST /orders", practical: "pedido #42", memory: "payload 312 B" }, { visible: false }),
      node("response", "message", 478, 62, 90, 34, { abstract: "201", practical: "confirmado", memory: "response 84 B" }, { visible: false }),
    ],
    edges: [
      { id: "client-api", from: "client", to: "api", directed: true },
      { id: "api-database", from: "api", to: "database", directed: true },
    ],
  },
  code: [
    "cliente → POST /orders",
    "API → validar(payload)",
    "API → banco.insert(order)",
    "banco → orderId #42",
    "API → cliente 201 Created",
  ],
  steps: [
    step("system-start", "OBSERVE", [{ type: "HIGHLIGHT", targets: ["client"], emphasis: "active" }], "O cliente prepara uma requisição.", "O checkout confirma um novo pedido.", "Cada caixa representa um processo, não uma máquina obrigatória.", metrics(0, 1, "—", "Fluxo ainda não iniciou."), 0),
    step("system-request-api", "SEND_REQUEST", [{ type: "SEND_REQUEST", from: "client", to: "api", target: "request" }], "POST /orders chega à API.", "O pedido #42 chega ao serviço.", "A mensagem se move; cliente e API continuam no DOM.", metrics(1, 2, "latência: 40 ms", "Latência simulada, não uma garantia real."), 0),
    step("system-validate", "COMPARE", [{ type: "HIGHLIGHT", targets: ["client"], emphasis: "idle" }, { type: "COMPARE", targets: ["api", "request"] }], "A API valida o payload.", "O serviço verifica os dados do pedido.", "Validação ocorre antes da escrita persistente.", metrics(2, 2, "latência: 48 ms", "Inclui 8 ms simulados de validação."), 1),
    step("system-write", "WRITE_MEMORY", [{ type: "SEND_REQUEST", from: "api", to: "database", target: "request" }, { type: "WRITE_MEMORY", address: "orders", target: "database", value: "#42" }], "A API persiste o pedido no banco.", "Pedidos registra #42.", "A confirmação só é produzida após a escrita deste fluxo simplificado.", metrics(4, 3, "latência: 83 ms", "Inclui 35 ms simulados de banco."), 2),
    step("system-response-api", "RECEIVE_RESPONSE", [{ type: "INSERT", target: "response" }, { type: "RECEIVE_RESPONSE", from: "database", to: "api", target: "response" }], "O banco devolve o identificador.", "O serviço recebe a confirmação #42.", "Uma resposta percorre o caminho inverso.", metrics(5, 3, "latência: 91 ms", "Tempo acumulado simulado."), 3),
    step("system-response-client", "RECEIVE_RESPONSE", [{ type: "RECEIVE_RESPONSE", from: "api", to: "client", target: "response" }], "201 Created retorna ao cliente.", "O checkout mostra “pedido confirmado”.", "O fluxo síncrono termina; falhas e retry ficam para a próxima fatia.", metrics(6, 3, "latência: 126 ms", "Soma didática de rede, validação e persistência."), 4),
  ],
};

export const lessons: LessonDefinition[] = [
  {
    id: "array",
    title: "Array: inserção no meio",
    shortTitle: "Array",
    module: "data-structure",
    icon: "[]",
    difficulty: "foundation",
    prerequisites: [],
    objectives: ["Reconhecer memória contígua", "Explicar deslocamentos", "Contextualizar O(n)"],
    description: "Insira um valor sem perder os elementos que já ocupam posições contíguas.",
    example: { kind: "visual-analogy", label: "Analogia visual", note: "Reorganizar ícones ajuda a visualizar uma sequência indexada; uma tela real pode combinar outras estruturas." },
    representations: allRepresentations,
    explanation: { problem: "Inserir no índice 1 de uma coleção contígua.", model: "Deslocar os valores posteriores da direita para a esquerda.", cost: "Acesso por índice é O(1); inserção intermediária é O(n) no pior caso.", whenToUse: "Quando acesso por posição e localidade importam.", alternative: "Lista encadeada evita deslocamentos, mas perde acesso direto por índice." },
    challenge: { question: "Por que o deslocamento começa pelo último item?", hint: "Pense no valor que seria sobrescrito se 8 se movesse primeiro.", choices: [{ id: "preserve", label: "Para preservar todos os valores", correct: true }, { id: "memory", label: "Para reduzir a memória", correct: false }, { id: "sort", label: "Para ordenar o array", correct: false }], success: "Exato: mover da direita para a esquerda impede sobrescritas." },
    comparisonId: "insert-middle",
    limitation: {
      title: "E se fosse uma lista encadeada?",
      goodLabel: "Lista encadeada",
      goodValue: "2 referências",
      goodWidth: 12,
      badLabel: "Array com 10.000 itens",
      badValue: "~5.000 deslocamentos",
      badWidth: 94,
      text: "A lista evita deslocamentos, mas perde acesso direto por índice.",
    },
    trace: arrayTrace,
  },
  {
    id: "linked-list",
    title: "Lista encadeada: insira entre nós",
    shortTitle: "Lista encadeada",
    module: "data-structure",
    icon: "↗",
    difficulty: "foundation",
    prerequisites: ["array"],
    objectives: ["Distinguir nó e referência", "Explicar relink de ponteiros", "Contextualizar inserção O(1)"],
    description: "Insira um valor ajustando ligações entre nós, sem deslocar nenhum elemento.",
    example: { kind: "visual-analogy", label: "Analogia visual", note: "Reorganizar ligações entre faixas ajuda a visualizar uma lista ligada; uma implementação real gerencia memória dinamicamente." },
    representations: allRepresentations,
    explanation: { problem: "Inserir entre dois nós de uma lista ligada.", model: "Preservar o próximo original, apontar o anterior para o novo nó e o novo nó para o próximo.", cost: "Inserção local é O(1); acesso por índice é O(n) no pior caso.", whenToUse: "Quando inserções e remoções frequentes no meio da coleção são esperadas.", alternative: "Array evita ponteiros extras, mas exige deslocamento de elementos posteriores." },
    challenge: { question: "O que deve ser preservado antes do relink?", hint: "Observe a referência que sai do primeiro nó.", choices: [{ id: "preserve-link", label: "A referência para o próximo nó", correct: true }, { id: "new-value", label: "O valor do novo nó", correct: false }, { id: "head-address", label: "O endereço da cabeça da lista", correct: false }], success: "Exato: sem preservar 4 → 12, a cadeia seria perdida ao apontar 4 → 7." },
    comparisonId: "insert-middle",
    limitation: {
      title: "E se fosse um array?",
      goodLabel: "Lista",
      goodValue: "2 novas ligações",
      goodWidth: 14,
      badLabel: "Array",
      badValue: "múltiplos deslocamentos",
      badWidth: 86,
      text: "A lista favorece inserções locais; o array favorece acesso por índice.",
    },
    trace: linkedListTrace,
  },
  {
    id: "linear-search",
    title: "Busca linear: encontre o alvo",
    shortTitle: "Busca linear",
    module: "algorithm",
    icon: "⌕",
    difficulty: "foundation",
    prerequisites: ["array"],
    objectives: ["Acompanhar um cursor", "Contar comparações", "Distinguir caso observado e pior caso"],
    description: "Percorra uma sequência até que a condição de igualdade seja verdadeira.",
    example: { kind: "possible-modeling", label: "Modelagem possível", note: "Uma lista pequena sem índice auxiliar pode ser pesquisada sequencialmente; produtos reais usam estratégias variadas." },
    representations: allRepresentations,
    explanation: { problem: "Encontrar 12 sem conhecer seu índice.", model: "Comparar o alvo com um item por vez, da esquerda para a direita.", cost: "O(1) no melhor caso e O(n) no pior caso; aqui foram três comparações.", whenToUse: "Coleções pequenas, não ordenadas ou buscas ocasionais.", alternative: "Busca binária exige ordenação; hash exige um índice auxiliar." },
    challenge: {
      question: "Quando a busca linear atinge o pior caso?",
      hint: "Considere o alvo ausente ou na última posição.",
      choices: [{ id: "last", label: "Quando toca todos os itens", correct: true }, { id: "first", label: "Quando acha o primeiro item", correct: false }, { id: "sorted", label: "Sempre que a lista está ordenada", correct: false }],
      success: "Certo: alvo ausente ou no fim exige até n comparações.",
      byRepresentation: {
        abstract: {
          question: "Quantas comparações a busca linear faz no pior caso?",
          hint: "Conte os elementos do array.",
          choices: [
            { id: "n-1", label: "n − 1", correct: false },
            { id: "n", label: "n", correct: true },
            { id: "log-n", label: "log n", correct: false },
            { id: "1", label: "1 (sempre o primeiro)", correct: false },
          ],
          success: "Exato. No pior caso a busca linear percorre todos os n elementos.",
        },
        practical: {
          question: "Em qual situação a busca linear encontra o alvo mais rápido?",
          hint: "Pense na posição do alvo na lista.",
          choices: [
            { id: "meio", label: "Quando está no meio", correct: false },
            { id: "inicio", label: "Quando está no início", correct: true },
            { id: "fim", label: "Quando está no fim", correct: false },
            { id: "nunca", label: "Ela nunca encontra rápido", correct: false },
          ],
          success: "Correto! Se o alvo está na primeira posição, a busca termina em uma única comparação.",
        },
      },
    },
    trace: linearSearchTrace,
  },
  {
    id: "condition-if",
    title: "Condição if: escolha um ramo",
    shortTitle: "Condição if",
    module: "logic",
    icon: "?",
    difficulty: "foundation",
    prerequisites: [],
    objectives: ["Prever um booleano", "Observar um branch", "Relacionar valor e fluxo"],
    description: "Altere a idade, faça uma previsão e observe qual bloco realmente executa.",
    example: { kind: "possible-modeling", label: "Modelagem possível", note: "A regra de idade é didática; sistemas reais também tratam autorização, jurisdição e dados confiáveis." },
    representations: allRepresentations,
    explanation: { problem: "Escolher entre permitir e bloquear a partir de uma regra.", model: "Avaliar idade >= 18 e executar apenas o ramo correspondente.", cost: "Comparação e branch são O(1) neste exemplo.", whenToUse: "Quando a execução depende de uma condição booleana.", alternative: "Tabelas de decisão ou polimorfismo podem organizar regras maiores." },
    controls: [{ id: "age", label: "Idade", type: "number", defaultValue: 16, min: 0, max: 120 }],
    prediction: { prompt: "Antes de avançar: qual será o ramo?", options: [{ id: "allowed", label: "Permitido" }, { id: "blocked", label: "Bloqueado" }], evaluate: (inputs) => (inputs.age >= 18 ? "allowed" : "blocked") },
    challenge: {
      question: "O que o if executa quando a condição é false?",
      hint: "Observe o cursor e o ramo esmaecido.",
      choices: [{ id: "else", label: "Somente o bloco else", correct: true }, { id: "both", label: "Os dois blocos", correct: false }, { id: "again", label: "A condição novamente", correct: false }],
      success: "Isso: um if/else escolhe exatamente um dos dois caminhos.",
      byRepresentation: {
        abstract: {
          question: "Com idade 16, o programa entra em qual bloco?",
          hint: "Avalie a condição age ≥ 18 com o valor atual.",
          choices: [
            { id: "else", label: "Bloco else (bloqueado)", correct: true },
            { id: "then", label: "Bloco then (permitido)", correct: false },
            { id: "ambos", label: "Executa ambos os blocos", correct: false },
            { id: "nenhum", label: "Nenhum bloco executa", correct: false },
          ],
          success: "Sim! 16 < 18, então o else é executado.",
        },
        practical: {
          question: "O que aparece na tela se alguém de 16 anos usar o sistema?",
          hint: "Teste com a entrada 16.",
          choices: [
            { id: "liberado", label: "Acesso liberado", correct: false },
            { id: "bloqueado", label: "Acesso bloqueado", correct: true },
            { id: "erro", label: "Uma mensagem de erro", correct: false },
            { id: "nada", label: "Nada, a tela fica em branco", correct: false },
          ],
          success: "Isso mesmo! 16 < 18, então o sistema bloqueia o acesso.",
        },
      },
    },
    trace: createIfTrace({ age: 16 }),
    createTrace: createIfTrace,
  },
  {
    id: "for-loop",
    title: "Loop for: estado que evolui",
    shortTitle: "Loop for",
    module: "logic",
    icon: "↻",
    difficulty: "foundation",
    prerequisites: ["condition-if"],
    objectives: ["Separar inicialização, condição e corpo", "Observar mutações", "Evitar uma iteração extra"],
    description: "Controle o limite e acompanhe i e soma a cada repetição.",
    example: { kind: "natural-modeling", label: "Modelagem natural", note: "Repetir uma operação para cada índice de um intervalo é um uso direto de for." },
    representations: allRepresentations,
    explanation: { problem: "Acumular os inteiros de 0 até n-1.", model: "Inicializar i, testar i < n, executar o corpo e incrementar.", cost: "Tempo O(n) e espaço auxiliar O(1).", whenToUse: "Quando o número ou intervalo de repetições é conhecido.", alternative: "while expressa melhor repetições governadas por um evento ou condição aberta." },
    controls: [{ id: "limit", label: "Número de repetições", type: "number", defaultValue: 3, min: 1, max: 5 }],
    prediction: { prompt: "Qual expressão descreve a soma final?", options: [{ id: "formula", label: "n × (n − 1) / 2" }, { id: "linear", label: "n" }, { id: "square", label: "n²" }], evaluate: () => "formula" },
    challenge: {
      question: "Por que o corpo não executa quando i é igual a n?",
      hint: "A comparação usa <, não <=.",
      choices: [{ id: "false", label: "Porque i < n é false", correct: true }, { id: "return", label: "Porque return roda primeiro", correct: false }, { id: "memory", label: "Porque a memória acabou", correct: false }],
      success: "Correto: a condição falsa encerra o loop antes do corpo.",
      byRepresentation: {
        abstract: {
          question: "O que faz o loop parar?",
          hint: "Observe a condição de continuação.",
          choices: [
            { id: "limite", label: "Quando i atinge o limite", correct: true },
            { id: "soma", label: "Quando a soma zera", correct: false },
            { id: "nunca", label: "O loop nunca para", correct: false },
            { id: "tecla", label: "Quando o usuário aperta uma tecla", correct: false },
          ],
          success: "Correto. O loop executa enquanto i < limite, e para quando i alcança o limite.",
        },
        practical: {
          question: "Com limite 3, quantas vezes o corpo do loop executa?",
          hint: "Conte os passos do trace com limite 3.",
          choices: [
            { id: "2", label: "2 vezes", correct: false },
            { id: "3", label: "3 vezes", correct: true },
            { id: "4", label: "4 vezes", correct: false },
            { id: "1", label: "1 vez", correct: false },
          ],
          success: "Sim! Com limite 3, i vai de 0 a 2 (3 iterações).",
        },
      },
    },
    trace: createLoopTrace({ limit: 3 }),
    createTrace: createLoopTrace,
  },
  {
    id: "memory-reference",
    title: "Memória: valor e referência",
    shortTitle: "Memória",
    module: "memory",
    icon: "0x",
    difficulty: "foundation",
    prerequisites: ["condition-if"],
    objectives: ["Distinguir frame e heap", "Seguir uma referência", "Observar mutação compartilhada"],
    description: "Veja uma variável local apontar para um objeto e permanecer estável durante uma mutação.",
    example: { kind: "visual-analogy", label: "Simulação pedagógica", note: "Endereços e regiões são simplificados para ensinar referências; não representam literalmente o runtime do navegador." },
    representations: allRepresentations,
    explanation: { problem: "Representar uma variável que se refere a um objeto mutável.", model: "Guardar a referência no stack frame e o objeto em uma região pedagógica de heap.", cost: "Leitura e escrita de propriedades conhecidas são modeladas como O(1).", whenToUse: "Para entender aliasing, mutabilidade, chamadas e objetos.", alternative: "Valores imutáveis reduzem mutações compartilhadas, com outros custos de cópia/estrutura." },
    challenge: { question: "O que muda quando pessoa.nome recebe Bia?", hint: "A seta continua apontando para o mesmo endereço.", choices: [{ id: "object", label: "O conteúdo do objeto", correct: true }, { id: "address", label: "O endereço da referência", correct: false }, { id: "frame", label: "Toda a call stack", correct: false }], success: "Perfeito: a referência permanece, enquanto o objeto apontado muda." },
    trace: memoryTrace,
  },
  {
    id: "request-flow",
    title: "System design: cliente, API e banco",
    shortTitle: "Fluxo de pedido",
    module: "system-design",
    icon: "→",
    difficulty: "foundation",
    prerequisites: [],
    objectives: ["Seguir uma requisição", "Separar validação e persistência", "Ler latência acumulada"],
    description: "Acompanhe um pedido síncrono do cliente até a persistência e de volta.",
    example: { kind: "common-technical-use", label: "Uso técnico comum", note: "Cliente, API e banco formam um fluxo comum; topologias, protocolos e garantias variam em sistemas reais." },
    representations: ["abstract", "practical", "code"],
    explanation: { problem: "Persistir um pedido e confirmar o resultado ao cliente.", model: "Enviar, validar, escrever, responder e acumular latência.", cost: "A complexidade relevante aqui é latência e disponibilidade, não apenas Big O.", whenToUse: "Operações simples que precisam de confirmação imediata.", alternative: "Fila e worker desacoplam processamento posterior, exigindo idempotência e observabilidade." },
    challenge: { question: "Por que a API responde depois da escrita neste fluxo?", hint: "A confirmação promete que o pedido foi registrado.", choices: [{ id: "durable", label: "Para confirmar a persistência", correct: true }, { id: "faster", label: "Para reduzir a latência", correct: false }, { id: "cache", label: "Para aquecer o cache", correct: false }], success: "Isso: neste contrato simplificado, 201 só vem após a persistência." },
    trace: systemDesignTrace,
  },
];

export const learningPath = lessons;

export const lessonById = Object.fromEntries(
  lessons.map((lesson) => [lesson.id, lesson]),
) as Record<string, LessonDefinition>;

export const moduleLabels: Record<LessonDefinition["module"], string> = {
  "data-structure": "Estrutura de dados",
  algorithm: "Algoritmo",
  logic: "Lógica e fluxo",
  memory: "Memória",
  "system-design": "System design",
};

export const difficultyLabels: Record<LessonDefinition["difficulty"], string> = {
  foundation: "Fundamentos",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export function defaultInputsFor(lesson: LessonDefinition) {
  return Object.fromEntries(
    (lesson.controls ?? []).map((control) => [control.id, control.defaultValue]),
  );
}

export function traceForLesson(
  lesson: LessonDefinition,
  inputs: Record<string, number>,
) {
  return lesson.createTrace?.(inputs) ?? lesson.trace;
}
