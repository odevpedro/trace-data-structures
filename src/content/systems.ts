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

const btreeTrace: TraceDefinition = {
  id: "btree-split",
  scene: {
    nodes: [
      node("root", "block", 180, 44, 120, 48, {
        abstract: "[30]",
        practical: "índice raiz [30]",
        memory: "página raiz · [30]",
      }),
      node("left", "block", 50, 170, 140, 48, {
        abstract: "[10|20|25]",
        practical: "página [10|20|25]",
        memory: "página esquerda · [10|20|25]",
      }),
      node("right", "block", 290, 170, 140, 48, {
        abstract: "[30|40|50]",
        practical: "página [30|40|50]",
        memory: "página direita · [30|40|50]",
      }),
      node("newleaf", "block", 50, 280, 140, 48, {
        abstract: "[25|27]",
        practical: "nova página [25|27]",
        memory: "página nova · [25|27]",
      }, { visible: false }),
      node("token", "block", 290, 280, 108, 42, {
        abstract: "27",
        practical: "transação 27",
        memory: "chave · 27",
      }),
      node("page", "tag", 180, 120, 130, 28, {
        abstract: "página cheia",
        practical: "bloco cheio",
        memory: "overflow",
      }, { visible: false }),
    ],
    edges: [
      { id: "rl", from: "root", to: "left", directed: true },
      { id: "rr", from: "root", to: "right", directed: true },
      { id: "rn", from: "root", to: "newleaf", directed: true, visible: false },
    ],
  },
  code: [
    "if (page.isFull()) {",
    "  mid = page.split();",
    "  parent.insert(mid);",
    "}",
  ],
  steps: [
    step(
      "btree-start",
      "START",
      [{ type: "HIGHLIGHT", targets: ["root"], emphasis: "active" }],
      "B+ Tree: root [30] aponta para duas páginas.",
      "Árvore com índice raiz [30] e duas folhas.",
      "Cada página agrupa chaves para reduzir profundidade.",
      metrics(0, 0, "O(1)", "Estado inicial da árvore."),
    ),
    step(
      "btree-descend",
      "DESCEND",
      [
        { type: "HIGHLIGHT", targets: ["root"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["left"], emphasis: "active" },
      ],
      "27 < 30. Desce para página esquerda [10|20|25].",
      "A chave 27 segue para a página esquerda.",
      "Comparação guia a descida até a folha apropriada.",
      metrics(1, 1, "O(log_B n)", "Comparação com chave do índice."),
    ),
    step(
      "btree-overflow",
      "OVERFLOW",
      [
        { type: "HIGHLIGHT", targets: ["left"], emphasis: "visited" },
        { type: "INSERT", target: "page" },
      ],
      "Página esquerda cheia. Precisa dividir.",
      "A página não tem espaço para 27.",
      "Página com capacidade fixa; ao transbordar, precisa dividir.",
      metrics(2, 2, "O(1)", "Overflow detectado."),
    ),
    step(
      "btree-split",
      "SPLIT",
      [
        { type: "HIGHLIGHT", targets: ["page"], emphasis: "idle" },
        { type: "INSERT", target: "newleaf" },
        { type: "LINK", from: "root", to: "newleaf", edgeId: "rn" },
        { type: "HIGHLIGHT", targets: ["newleaf"], emphasis: "active" },
      ],
      "25 sobe para o root. Nova página [27].",
      "Metade das chaves vai para nova página.",
      "Split promove chave mediana e redistribui as demais.",
      metrics(3, 3, "O(log_B n)", "Split promove chave mediana."),
    ),
    step(
      "btree-done",
      "DONE",
      [
        { type: "HIGHLIGHT", targets: ["root"], emphasis: "success" },
        { type: "HIGHLIGHT", targets: ["newleaf"], emphasis: "visited" },
      ],
      "Root agora [25|30]. Árvore balanceada por página.",
      "Índice atualizado com duas chaves; folha inserida.",
      "Páginas mantêm profundidade logarítmica.",
      metrics(3, 3, "O(log_B n)", "Split concluído; árvore balanceada."),
    ),
  ],
};

const lruTrace: TraceDefinition = {
  id: "lru-cache",
  scene: {
    nodes: [
      node("a", "linked", 52, 130, 80, 52, {
        abstract: "A",
        practical: "Home",
        memory: "nó · A",
      }),
      node("b", "linked", 170, 130, 80, 52, {
        abstract: "B",
        practical: "Busca",
        memory: "nó · B",
      }),
      node("c", "linked", 288, 130, 80, 52, {
        abstract: "C",
        practical: "Perfil",
        memory: "nó · C",
      }),
      node("d", "linked", 170, 290, 80, 52, {
        abstract: "D",
        practical: "Story",
        memory: "nó · D",
      }, { visible: false }),
      node("mru", "tag", 288, 74, 80, 25, {
        abstract: "MRU",
        practical: "mais recente",
        memory: "cabeça",
      }),
      node("lru", "tag", 52, 74, 80, 25, {
        abstract: "LRU",
        practical: "menos recente",
        memory: "cauda",
      }),
      node("map", "tag", 170, 40, 150, 28, {
        abstract: "mapa: A,B,C",
        practical: "mapa: Home,Busca,Perfil",
        memory: "hash · {A,B,C}",
      }),
    ],
    edges: [
      { id: "ab", from: "a", to: "b", directed: true },
      { id: "bc", from: "b", to: "c", directed: true },
      { id: "ca", from: "c", to: "a", directed: true, visible: false },
      { id: "cb", from: "c", to: "b", directed: true, visible: false },
      { id: "bd", from: "b", to: "d", directed: true, visible: false },
    ],
  },
  code: [
    "cache.get('C'); // move C to MRU",
    "cache.put('D', story); // evict LRU (A)",
  ],
  steps: [
    step(
      "lru-start",
      "START",
      [{ type: "HIGHLIGHT", targets: ["map"], emphasis: "active" }],
      "Cache: A (LRU) → B → C (MRU).",
      "A (menos recente) → B → C (mais recente).",
      "Mapa {A,B,C} com lista duplamente encadeada.",
      metrics(0, 0, "O(1)", "Estado inicial do cache."),
    ),
    step(
      "lru-hit",
      "HIT",
      [
        { type: "HIGHLIGHT", targets: ["map"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["c"], emphasis: "active" },
      ],
      "C é acessado. Vira MRU.",
      "Perfil é visitado. Vira mais recente.",
      "Cache hit: nó C promovido a MRU.",
      metrics(1, 1, "O(1)", "Hit no cache; acesso O(1) médio."),
    ),
    step(
      "lru-move-front",
      "MOVE_FRONT",
      [
        { type: "UNLINK", from: "b", to: "c", edgeId: "bc" },
        { type: "LINK", from: "c", to: "a", edgeId: "ca" },
        { type: "MOVE", target: "c", to: { x: 52, y: 130 } },
        { type: "MOVE", target: "a", to: { x: 170, y: 130 } },
        { type: "MOVE", target: "b", to: { x: 288, y: 130 } },
      ],
      "C vai para o início (MRU).",
      "Perfil move para o topo da lista.",
      "Nó C reconectado à cabeça; ordem agora C → A → B.",
      metrics(2, 2, "O(1)", "Reordenação: remoção e reinserção na cabeça."),
    ),
    step(
      "lru-insert",
      "INSERT",
      [
        { type: "INSERT", target: "d" },
        { type: "HIGHLIGHT", targets: ["d"], emphasis: "active" },
      ],
      "D adicionado. Cache cheio.",
      "Story adicionado. Cache na capacidade máxima.",
      "Cache cheio: próximo passo precisa remover LRU.",
      metrics(3, 3, "O(1)", "Inserção sem evicção ainda."),
    ),
    step(
      "lru-evict",
      "EVICT",
      [
        { type: "REMOVE", target: "a" },
        { type: "UNLINK", from: "a", to: "b", edgeId: "ab" },
        { type: "UNLINK", from: "c", to: "a", edgeId: "ca" },
        { type: "LINK", from: "c", to: "b", edgeId: "cb" },
        { type: "LINK", from: "b", to: "d", edgeId: "bd" },
        { type: "MOVE", target: "b", to: { x: 170, y: 130 } },
        { type: "MOVE", target: "d", to: { x: 288, y: 130 } },
      ],
      "A (LRU) removido. Cache: C→B→D.",
      "Home removido. Cache: Perfil→Busca→Story.",
      "LRU evict: nó A removido; lista reconectada.",
      metrics(4, 3, "O(1)", "Evicção: O(1) com remoção da cauda."),
    ),
  ],
};

const circularTrace: TraceDefinition = {
  id: "circular-buffer",
  scene: {
    nodes: [
      node("ring", "container", 36, 90, 560, 130, {
        abstract: "buffer",
        practical: "buffer circular",
        memory: "buffer[6]",
      }),
      node("s0", "slot", 52, 110, 66, 48, {
        abstract: "0",
        practical: "idx 0",
        memory: "&buffer[0]",
      }),
      node("s1", "slot", 126, 110, 66, 48, {
        abstract: "1",
        practical: "idx 1",
        memory: "&buffer[1]",
      }),
      node("s2", "slot", 200, 110, 66, 48, {
        abstract: "2",
        practical: "idx 2",
        memory: "&buffer[2]",
      }),
      node("s3", "slot", 274, 110, 66, 48, {
        abstract: "3",
        practical: "idx 3",
        memory: "&buffer[3]",
      }),
      node("s4", "slot", 348, 110, 66, 48, {
        abstract: "4",
        practical: "idx 4",
        memory: "&buffer[4]",
      }),
      node("s5", "slot", 422, 110, 66, 48, {
        abstract: "5",
        practical: "idx 5",
        memory: "&buffer[5]",
      }),
      node("a", "block", 52, 110, 66, 48, {
        abstract: "A",
        practical: "trecho 1",
        memory: "0x100 · A",
      }),
      node("b", "block", 126, 110, 66, 48, {
        abstract: "B",
        practical: "trecho 2",
        memory: "0x104 · B",
      }),
      node("c", "block", 200, 110, 66, 48, {
        abstract: "C",
        practical: "trecho 3",
        memory: "0x108 · C",
      }),
      node("d", "block", 274, 110, 66, 48, {
        abstract: "D",
        practical: "trecho 4",
        memory: "0x10C · D",
      }),
      node("e", "block", 348, 110, 66, 48, {
        abstract: "E",
        practical: "trecho 5",
        memory: "0x110 · E",
      }),
      node("f", "block", 422, 110, 66, 48, {
        abstract: "F",
        practical: "trecho 6",
        memory: "0x114 · F",
      }, { visible: false }),
      node("write", "tag", 422, 60, 96, 25, {
        abstract: "write=5",
        practical: "gravar=5",
        memory: "ptr · 5",
      }),
    ],
    edges: [],
  },
  code: [
    "buffer[write % capacity] = value;",
    "write++;",
  ],
  steps: [
    step(
      "circular-start",
      "OBSERVE",
      [{ type: "HIGHLIGHT", targets: ["write"], emphasis: "active" }],
      "Buffer: A,B,C,D,E. write=5.",
      "A,B,C,D,E ocupam posições 0 a 4. write aponta para 5.",
      "Ponteiro de escrita indica a próxima posição livre.",
      metrics(0, 0, "O(1)", "Estado inicial do buffer."),
    ),
    step(
      "circular-write",
      "WRITE",
      [
        { type: "INSERT", target: "f" },
        { type: "HIGHLIGHT", targets: ["f"], emphasis: "success" },
      ],
      "F escrito na posição 5.",
      "trecho 6 ocupa a última posição.",
      "Valor escrito sem deslocar elementos existentes.",
      metrics(1, 1, "O(1)", "Escrita direta no índice."),
    ),
    step(
      "circular-wrap",
      "WRAP",
      [
        { type: "HIGHLIGHT", targets: ["write"], emphasis: "active" },
        { type: "MOVE", target: "write", to: { x: 52, y: 60 } },
        { type: "HIGHLIGHT", targets: ["f"], emphasis: "visited" },
      ],
      "write volta a 0. Buffer cheio.",
      "Ponteiro de gravação retorna ao início.",
      "Wrap-around: write = (5 + 1) % 6 = 0.",
      metrics(1, 1, "O(1)", "Wrap-around: incremento com módulo."),
    ),
    step(
      "circular-overwrite",
      "OVERWRITE",
      [
        { type: "HIGHLIGHT", targets: ["a"], emphasis: "warning" },
      ],
      "Próximo dado substitui A.",
      "Novo trecho sobrescreve a posição mais antiga.",
      "Buffer cheio: novos dados sobrescrevem os mais antigos.",
      metrics(2, 2, "O(1)", "Sobrescrita sem deslocamento."),
    ),
    step(
      "circular-done",
      "DONE",
      [
        { type: "HIGHLIGHT", targets: ["a"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["write"], emphasis: "idle" },
      ],
      "Buffer circular: posições reutilizadas.",
      "Posições são reutilizadas em ciclo.",
      "Memória fixa reutilizada; nenhuma alocação adicional.",
      metrics(2, 2, "O(1)", "Operações O(1) invariantes."),
    ),
  ],
};

const bloomTrace: TraceDefinition = {
  id: "bloom-filter",
  scene: {
    nodes: [
      node("b0", "slot", 48, 130, 52, 48, {
        abstract: "0",
        practical: "bit 0",
        memory: "b[0]=0",
      }),
      node("b1", "slot", 108, 130, 52, 48, {
        abstract: "1",
        practical: "bit 1",
        memory: "b[1]=0",
      }),
      node("b2", "slot", 168, 130, 52, 48, {
        abstract: "2",
        practical: "bit 2",
        memory: "b[2]=0",
      }),
      node("b3", "slot", 228, 130, 52, 48, {
        abstract: "3",
        practical: "bit 3",
        memory: "b[3]=0",
      }),
      node("b4", "slot", 288, 130, 52, 48, {
        abstract: "4",
        practical: "bit 4",
        memory: "b[4]=0",
      }),
      node("b5", "slot", 348, 130, 52, 48, {
        abstract: "5",
        practical: "bit 5",
        memory: "b[5]=0",
      }),
      node("b6", "slot", 408, 130, 52, 48, {
        abstract: "6",
        practical: "bit 6",
        memory: "b[6]=0",
      }),
      node("b7", "slot", 468, 130, 52, 48, {
        abstract: "7",
        practical: "bit 7",
        memory: "b[7]=0",
      }),
      node("bit2", "tag", 168, 130, 52, 48, {
        abstract: "1",
        practical: "1",
        memory: "setado",
      }, { visible: false }),
      node("bit6", "tag", 408, 130, 52, 48, {
        abstract: "1",
        practical: "1",
        memory: "setado",
      }, { visible: false }),
      node("key", "block", 52, 48, 96, 48, {
        abstract: "K",
        practical: "Artigo novo",
        memory: "chave · K",
      }),
      node("h1", "tag", 168, 48, 96, 28, {
        abstract: "h1(K)=2",
        practical: "h1=2",
        memory: "hash 1 → 2",
      }),
      node("h2", "tag", 348, 48, 96, 28, {
        abstract: "h2(K)=6",
        practical: "h2=6",
        memory: "hash 2 → 6",
      }),
      node("answer", "tag", 228, 220, 130, 28, {
        abstract: "?",
        practical: "talvez lido",
        memory: "resultado",
      }, { visible: false }),
    ],
    edges: [],
  },
  code: [
    "if (bits[h1(key)] && bits[h2(key)])",
    '  return "maybe";',
    'else',
    '  return "definitely not";',
  ],
  steps: [
    step(
      "bloom-start",
      "OBSERVE",
      [
        { type: "INSERT", target: "bit2" },
        { type: "INSERT", target: "bit6" },
        { type: "HIGHLIGHT", targets: ["bit2"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["bit6"], emphasis: "active" },
      ],
      "Bloom filter: bits 2 e 6 marcados.",
      "Bits 2 e 6 estão setados por inserções anteriores.",
      "Vetor de 8 bits com duas posições em 1.",
      metrics(0, 0, "O(1)", "Estado inicial do filtro."),
    ),
    step(
      "bloom-hash",
      "HASH",
      [
        { type: "HIGHLIGHT", targets: ["bit2"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["bit6"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["h1"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["h2"], emphasis: "active" },
      ],
      "h1(K)=2, h2(K)=6.",
      "Duas funções hash apontam para bits 2 e 6.",
      "K processado por k=2 funções hash independentes.",
      metrics(2, 2, "O(k)", "Duas funções hash computadas."),
    ),
    step(
      "bloom-check",
      "CHECK",
      [
        { type: "HIGHLIGHT", targets: ["h1"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["h2"], emphasis: "idle" },
        { type: "HIGHLIGHT", targets: ["bit2"], emphasis: "success" },
        { type: "HIGHLIGHT", targets: ["bit6"], emphasis: "success" },
      ],
      "Bit 2 = 1. Bit 6 = 1.",
      "Ambos os bits alvo estão setados.",
      "Nenhum bit zero encontrado; condição de pertença válida.",
      metrics(4, 4, "O(k)", "Duas leituras de bit."),
    ),
    step(
      "bloom-maybe",
      "MAYBE",
      [
        { type: "INSERT", target: "answer" },
        { type: "HIGHLIGHT", targets: ["answer"], emphasis: "active" },
      ],
      "Todos os bits 1. 'Talvez presente'.",
      "Resultado: pode estar no conjunto.",
      "Filtro responde 'talvez' — todos os bits hash estão em 1.",
      metrics(4, 4, "O(k)", "Resposta positiva do filtro."),
    ),
    step(
      "bloom-false-positive",
      "FALSE_POSITIVE",
      [
        { type: "HIGHLIGHT", targets: ["answer"], emphasis: "warning" },
        { type: "HIGHLIGHT", targets: ["key"], emphasis: "idle" },
      ],
      "Falso positivo: K não existe de fato.",
      "Artigo novo não foi realmente inserido.",
      "Falso positivo: probabilidade controlada pelo tamanho do vetor e k.",
      metrics(4, 4, "O(k)", "Falso positivo: custo da consulta permanece O(k)."),
    ),
  ],
};

export const systemsLessons: LessonDefinition[] = [
  {
    id: "btree",
    title: "B+ Tree: split de página de índice",
    shortTitle: "B+ Tree",
    module: "data-structure",
    icon: "B+",
    difficulty: "advanced",
    prerequisites: ["bst", "balanced"],
    objectives: [
      "Entender páginas de índice com capacidade fixa",
      "Explicar split de página em overflow",
      "Contextualizar O(log_B n) em disco",
    ],
    description: "Organiza muitas chaves por página para reduzir leituras de disco.",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "B-trees e variantes são a base de índices em bancos relacionais. A animação é conceitual e simplifica detalhes específicos de cada engine.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Índices de banco de dados precisam de pouco acesso a disco.",
      model: "Agrupar chaves em páginas; dividir quando uma página transborda.",
      cost: "Inserção e busca são O(log_B n), onde B é a ordem da árvore.",
      whenToUse: "Índices em banco de dados, sistemas de arquivos.",
      alternative: "BST/AVL funcionam em memória, mas não otimizam acesso a disco.",
    },
    challenge: {
      question: "Por que a página é dividida?",
      hint: "O que acontece quando não cabe mais?",
      choices: [
        { id: "capacity", label: "Para manter páginas com capacidade limitada", correct: true },
        { id: "hash", label: "Para transformar tudo em hash", correct: false },
        { id: "remove", label: "Para remover a chave 27", correct: false },
      ],
      success: "Exato: páginas têm capacidade fixa; ao transbordar, metade das chaves vai para uma nova página.",
    },
    trace: btreeTrace,
  },
  {
    id: "lru",
    title: "LRU Cache: hash table + lista duplamente encadeada",
    shortTitle: "LRU Cache",
    module: "data-structure",
    icon: "LRU",
    difficulty: "advanced",
    prerequisites: ["hash", "doubly-linked-list"],
    objectives: [
      "Combinar hash table com lista encadeada",
      "Ordenar itens por uso recente",
      "Descartar o item menos recente em capacidade cheia",
    ],
    description: "Combina busca rápida por chave com uma ordem de uso recente.",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "Caches LRU são frequentemente construídos com um mapa e uma lista duplamente encadeada. LinkedHashMap oferece uma base direta para isso em Java.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Manter um cache de tamanho fixo que descarta o item menos usado.",
      model: "Hash table para busca O(1); lista dupla para ordenar por uso recente.",
      cost: "Get e put são O(1) médio.",
      whenToUse: "Cache com tamanho fixo onde itens recentes são mais relevantes.",
      alternative: "LFU descarta o menos frequente; FIFO descarta o mais antigo.",
    },
    challenge: {
      question: "Qual elemento é removido quando D entra?",
      hint: "O cache tem capacidade 3.",
      choices: [
        { id: "lru-item", label: "O menos recentemente usado", correct: true },
        { id: "mru-item", label: "O mais recentemente usado", correct: false },
        { id: "new-item", label: "O novo elemento", correct: false },
      ],
      success: "Correto: LRU remove o elemento no final da lista (menos recente).",
    },
    trace: lruTrace,
  },
  {
    id: "circular",
    title: "Buffer circular: wrap-around sem deslocamento",
    shortTitle: "Buffer circular",
    module: "data-structure",
    icon: "◯",
    difficulty: "intermediate",
    prerequisites: ["array"],
    objectives: [
      "Reutilizar posições fixas em ciclo",
      "Entender wrap-around do ponteiro de escrita",
      "Comparar inserção O(1) com array O(n)",
    ],
    description: "Reutiliza um conjunto fixo de posições e volta ao início quando chega ao fim.",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "Buffers circulares aparecem em áudio, vídeo, telemetria, drivers e logs de tamanho limitado.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Armazenar um fluxo contínuo de dados em espaço fixo sem deslocar.",
      model: "Manter um ponteiro de escrita que volta ao início após o último índice.",
      cost: "Inserção é O(1); leitura é O(1).",
      whenToUse: "Streaming, logs circulares, buffers de áudio/vídeo.",
      alternative: "Array com deslocamento tem inserção O(n); lista ligada tem overhead de nó.",
    },
    challenge: {
      question: "O que acontece quando write ultrapassa o último índice?",
      hint: "Observe o comportamento no fim do buffer.",
      choices: [
        { id: "wrap", label: "Volta ao índice 0", correct: true },
        { id: "expand", label: "Expande infinitamente", correct: false },
        { id: "shift", label: "Desloca todos os itens", correct: false },
      ],
      success: "Correto: buffer circular volta ao início (wrap-around).",
    },
    trace: circularTrace,
  },
  {
    id: "bloom",
    title: "Bloom Filter: probabilisticamente presente",
    shortTitle: "Bloom Filter",
    module: "data-structure",
    icon: "≈",
    difficulty: "advanced",
    prerequisites: ["hash"],
    objectives: [
      "Compreender estrutura probabilística",
      "Relacionar múltiplos hashes a bits",
      "Distinguir falso positivo e falso negativo",
    ],
    description: "Estrutura probabilística compacta que pode produzir falsos positivos, mas nunca falsos negativos.",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "Bloom filters aparecem em bancos, caches e sistemas distribuídos. Podem produzir falsos positivos, mas não falsos negativos na forma tradicional.",
    },
    representations: allRepresentations,
    explanation: {
      problem: "Testar pertença de forma eficiente em memória, aceitando falsos positivos.",
      model: "Múltiplas funções hash marcam bits em um vetor. Todos os bits marcados = talvez presente; qualquer bit zero = certeza de ausência.",
      cost: "Inserção e consulta são O(k), onde k é o número de funções hash.",
      whenToUse: "Evitar consultas caras quando o item certamente não existe.",
      alternative: "Hash table consome mais memória mas não tem falsos positivos.",
    },
    challenge: {
      question: "O que significa todos os bits estarem marcados?",
      hint: "É uma resposta probabilística.",
      choices: [
        { id: "maybe", label: "O item pode estar presente", correct: true },
        { id: "certainly", label: "O item certamente está presente", correct: false },
        { id: "absent", label: "O item certamente não existe", correct: false },
      ],
      success: "Isso: todos os bits 1 significa 'talvez presente' (pode ser falso positivo).",
    },
    trace: bloomTrace,
  },
];
