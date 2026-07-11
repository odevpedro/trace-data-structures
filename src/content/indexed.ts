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

const hashTrace: TraceDefinition = {
  id: "hash-chain",
  scene: {
    nodes: [
      node("b0", "bucket", 186, 74, 100, 36, {
        abstract: "b0",
        practical: "[0]",
        memory: "bucket 0",
      }, { visible: false }),
      node("b1", "bucket", 296, 74, 100, 36, {
        abstract: "b1",
        practical: "[1]",
        memory: "bucket 1",
      }, { visible: false }),
      node("b2", "bucket", 406, 74, 100, 36, {
        abstract: "b2",
        practical: "[2]",
        memory: "bucket 2",
      }, { visible: false }),
      node("b3", "bucket", 186, 172, 248, 58, {
        abstract: "b3",
        practical: "[3]",
        memory: "bucket 3",
      }),
      node("b4", "bucket", 186, 258, 248, 36, {
        abstract: "b4",
        practical: "[4]",
        memory: "bucket 4",
      }, { visible: false }),
      node("existing", "block", 198, 180, 120, 42, {
        abstract: "Leo",
        practical: "Contato Leo",
        memory: "nó · Leo",
      }),
      node("token", "block", 42, 172, 120, 42, {
        abstract: "Ana",
        practical: "Contato Ana",
        memory: "nó · Ana",
      }),
      node("hash", "tag", 42, 74, 130, 28, {
        abstract: "hash(Ana)→3",
        practical: "hash(Ana)→[3]",
        memory: "hash → bucket",
      }),
      node("result", "tag", 186, 330, 130, 28, {
        abstract: "resultado",
        practical: "contato encontrado",
        memory: "retorno",
      }, { visible: false }),
    ],
    edges: [
      { id: "route", from: "token", to: "b3", directed: true, visible: false },
    ],
  },
  code: [
    'int index = hash("Ana"); // hash("Ana") = 3',
    'buckets[index].add("Ana");',
  ],
  steps: [
    step(
      "hash-start",
      "START",
      [{ type: "HIGHLIGHT", targets: ["token"], emphasis: "active" }],
      "Hash prepara a busca por Ana.",
      "Hash prepara a busca por Ana.",
      "Hash prepara a busca por Ana.",
      metrics(0, 0, "O(1)", "Preparação da busca com função hash."),
    ),
    step(
      "hash-hash",
      "HASH",
      [
        { type: "HIGHLIGHT", targets: ["token"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["hash", "b3"], emphasis: "active" },
      ],
      "hash(Ana) = 3. Bucket 3 é o destino.",
      "hash(Ana) = 3. Bucket 3 é o destino.",
      "hash(Ana) = 3. Bucket 3 é o destino.",
      metrics(1, 1, "O(1)", "Aplicar hash à chave é O(1)."),
    ),
    step(
      "hash-route",
      "ROUTE",
      [
        { type: "HIGHLIGHT", targets: ["hash"], emphasis: "idle" },
        { type: "LINK", from: "token", to: "b3", edgeId: "route" },
        { type: "HIGHLIGHT", targets: ["token", "b3"], emphasis: "active" },
      ],
      "Ana é direcionada ao bucket 3.",
      "Ana é direcionada ao bucket 3.",
      "Ana é direcionada ao bucket 3.",
      metrics(2, 2, "O(1)", "Direcionar ao bucket é O(1)."),
    ),
    step(
      "hash-collision",
      "COLLISION",
      [
        { type: "HIGHLIGHT", targets: ["token", "b3"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["existing"], emphasis: "warning" },
        { type: "HIGHLIGHT", targets: ["b3"], emphasis: "warning" },
      ],
      "Leo já ocupa bucket 3. Colisão detectada.",
      "Leo já ocupa bucket 3. Colisão detectada.",
      "Leo já ocupa bucket 3. Colisão detectada.",
      metrics(3, 3, "O(1)", "Detecção de colisão requer verificação."),
    ),
    step(
      "hash-chain",
      "CHAIN",
      [
        { type: "HIGHLIGHT", targets: ["existing"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["token"], emphasis: "success" },
        { type: "HIGHLIGHT", targets: ["b3"], emphasis: "idle" },
      ],
      "Ana é encadeada a Leo no bucket 3.",
      "Ana é encadeada a Leo no bucket 3.",
      "Ana é encadeada a Leo no bucket 3.",
      metrics(4, 4, "O(1)", "Encadeamento resolve colisão sem realocar."),
    ),
  ],
};

const setTrace: TraceDefinition = {
  id: "set-reject-duplicate",
  scene: {
    nodes: [
      node("container", "container", 48, 150, 344, 150, {
        abstract: "SET",
        practical: "Visualizações únicas",
        memory: "Set<String>",
      }),
      node("a", "block", 76, 180, 74, 52, {
        abstract: "A",
        practical: "Ana",
        memory: "elemento A",
      }),
      node("b", "block", 166, 180, 78, 52, {
        abstract: "B",
        practical: "Bruno",
        memory: "elemento B",
      }),
      node("c", "block", 260, 180, 80, 52, {
        abstract: "C",
        practical: "Clara",
        memory: "elemento C",
      }),
      node("incoming", "block", 220, 46, 78, 52, {
        abstract: "B",
        practical: "Bruno",
        memory: "novo · B",
      }),
      node("reject", "tag", 166, 300, 130, 28, {
        abstract: "duplicado",
        practical: "já contabilizado",
        memory: "rejeitado",
      }, { visible: false }),
    ],
    edges: [],
  },
  code: [
    'Set<String> unique = new HashSet<>();',
    'unique.add("A");',
    'unique.add("B");',
    'unique.add("C");',
    'unique.add("B"); // ignored!',
  ],
  steps: [
    step(
      "set-start",
      "START",
      [
        { type: "HIGHLIGHT", targets: ["container"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["a", "b", "c"], emphasis: "visited" },
      ],
      "Set contém A, B, C.",
      "Set contém A, B, C.",
      "Set contém A, B, C.",
      metrics(0, 0, "O(1)", "Estado inicial do conjunto."),
    ),
    step(
      "set-check",
      "CHECK",
      [
        { type: "HIGHLIGHT", targets: ["container", "a", "b", "c"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["incoming"], emphasis: "active" },
      ],
      "B chega para ser inserido.",
      "B chega para ser inserido.",
      "B chega para ser inserido.",
      metrics(1, 1, "O(1)", "Nova chave chega para inserção."),
    ),
    step(
      "set-match",
      "MATCH",
      [
        { type: "HIGHLIGHT", targets: ["incoming"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["b"], emphasis: "warning" },
        { type: "COMPARE", targets: ["incoming", "b"] },
      ],
      "B já existe no set.",
      "B já existe no set.",
      "B já existe no set.",
      metrics(2, 2, "O(1)", "Verificação de existência é O(1)."),
    ),
    step(
      "set-reject",
      "REJECT",
      [
        { type: "INSERT", target: "reject" },
        { type: "HIGHLIGHT", targets: ["incoming", "b"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["reject"], emphasis: "active" },
      ],
      "Inserção de B é rejeitada.",
      "Inserção de B é rejeitada.",
      "Inserção de B é rejeitada.",
      metrics(2, 2, "O(1)", "Rejeição de duplicata é O(1)."),
    ),
    step(
      "set-done",
      "DONE",
      [
        { type: "HIGHLIGHT", targets: ["incoming"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["reject"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["a", "b", "c"], emphasis: "visited" },
      ],
      "Set permanece com A, B, C.",
      "Set permanece com A, B, C.",
      "Set permanece com A, B, C.",
      metrics(2, 2, "O(1)", "Conjunto inalterado após rejeição."),
    ),
  ],
};

export const indexedLessons: LessonDefinition[] = [
  {
    id: "hash",
    title: "Tabela hash: colisão com encadeamento",
    shortTitle: "Tabela hash",
    module: "data-structure",
    icon: "#",
    difficulty: "foundation",
    prerequisites: ["array"],
    comparisonId: "list-hash",
    objectives: [
      "Compreender função hash e mapeamento para bucket",
      "Identificar colisão entre chaves distintas",
      "Explicar encadeamento como solução de colisão",
    ],
    description: "Uma função transforma a chave em índice de bucket.",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "Dicionários, mapas e caches usam tabelas hash para localizar valores por chave. A forma de resolver colisões varia por implementação.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Armazenar e localizar valores por chave em tempo quase constante.",
      model: "Aplicar função hash à chave, resolver colisões por encadeamento.",
      cost: "Inserção e busca são O(1) médio, O(n) pior caso.",
      whenToUse: "Quando busca por chave precisa ser rápida e a ordem não importa.",
      alternative: "Array ordenado com busca binária gasta O(log n) e preserva ordem.",
    },
    challenge: {
      question: "Como preservar Leo e Ana no mesmo bucket?",
      hint: "Observe a colisão entre as duas chaves.",
      choices: [
        { id: "chain", label: "Encadear as chaves", correct: true },
        { id: "overwrite", label: "Sobrescrever Leo", correct: false },
        { id: "discard", label: "Descartar Ana", correct: false },
      ],
      success: "Isso: o encadeamento permite múltiplas chaves no mesmo bucket.",
    },
    limitation: {
      title: "E se fosse uma lista?",
      goodLabel: "Tabela hash",
      goodValue: "busca O(1) médio",
      goodWidth: 26,
      badLabel: "Lista",
      badValue: "busca O(n)",
      badWidth: 74,
      text: "Hash sacrifica ordem por velocidade; lista preserva ordem com busca linear.",
    },
    trace: hashTrace,
  },
  {
    id: "set",
    title: "Set: rejeição de duplicatas",
    shortTitle: "Set",
    module: "data-structure",
    icon: "{}",
    difficulty: "foundation",
    prerequisites: ["hash"],
    objectives: [
      "Entender rejeição de duplicatas em conjunto",
      "Comparar eficiência de set vs lista",
      "Relacionar set à implementação com tabela hash",
    ],
    description: "Coleção que mantém apenas valores únicos.",
    example: {
      kind: "possible-modeling",
      label: "Modelagem possível",
      note: "Uma coleção de IDs únicos representa bem pessoas já contabilizadas. O produto real pode persistir esses IDs em bancos e estruturas distribuídas.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Garantir que cada elemento apareça apenas uma vez.",
      model: "Usar uma tabela hash que ignora inserções de chaves já existentes.",
      cost: "Inserção e busca são O(1) médio.",
      whenToUse: "Quando duplicatas são proibidas e a ordem não importa.",
      alternative: "Lista com verificação prévia custa O(n) por inserção.",
    },
    challenge: {
      question: "O que acontece quando B já existe?",
      hint: "Observe a rejeição do valor repetido.",
      choices: [
        { id: "ignored", label: "A inserção é ignorada", correct: true },
        { id: "duplicated", label: "B é duplicado", correct: false },
        { id: "cleared", label: "Todo o set é limpo", correct: false },
      ],
      success: "Exato: sets ignoram inserções de valores já presentes.",
    },
    limitation: {
      title: "E se fosse uma lista?",
      goodLabel: "Set",
      goodValue: "rejeição O(1)",
      goodWidth: 28,
      badLabel: "Lista",
      badValue: "verificação O(n)",
      badWidth: 72,
      text: "Set impede duplicatas eficientemente; lista exige busca linear antes de cada inserção.",
    },
    trace: setTrace,
  },
];
