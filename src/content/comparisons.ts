import type {
  ComparisonDefinition,
  Representation,
  SceneNodeDefinition,
  TraceDefinition,
  TraceEvent,
  TraceMetrics,
  TraceStep,
} from "../core/trace-engine/types";

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
  };
}

const compareRepresentation: Representation = "abstract";

const insertMiddleArrayTrace: TraceDefinition = {
  id: "compare-insert-middle-array",
  scene: {
    nodes: [
      ...[0, 1, 2, 3, 4].map((index) =>
        node(`slot-${index}`, "slot", 40 + index * 106, 178, 92, 58, {
          abstract: `[${index}]`,
          practical: `posição ${index + 1}`,
          memory: `slot ${index}`,
        }),
      ),
      node("a", "block", 40, 178, 92, 56, { abstract: "4", practical: "A", memory: "4" }),
      node("b", "block", 146, 178, 92, 56, { abstract: "8", practical: "B", memory: "8" }),
      node("c", "block", 252, 178, 92, 56, { abstract: "12", practical: "C", memory: "12" }),
      node("d", "block", 358, 178, 92, 56, { abstract: "16", practical: "D", memory: "16" }),
      node("x", "block", 146, 54, 92, 56, { abstract: "6", practical: "X", memory: "6" }),
    ],
    edges: [],
  },
  steps: [
    step(
      "observe",
      "OBSERVE",
      [{ type: "HIGHLIGHT", targets: ["x"], emphasis: "active" }],
      "Array precisa abrir espaço no índice 1.",
      "O item X ainda não cabe na sequência.",
      "Inserção no meio exige preservar a continuidade dos índices.",
      metrics(0, 0, "O(1)", "Leitura do índice alvo."),
    ),
    step(
      "shift-tail",
      "SHIFT",
      [
        { type: "HIGHLIGHT", targets: ["x"], emphasis: "idle" },
        { type: "MOVE", target: "d", to: { x: 464, y: 178 } },
        { type: "MOVE", target: "c", to: { x: 358, y: 178 } },
      ],
      "Array desloca os itens da direita para a esquerda lógica do algoritmo.",
      "Os últimos itens saem primeiro para não serem sobrescritos.",
      "O custo cresce com o número de elementos posteriores.",
      metrics(2, 2, "O(n)", "Deslocamento do final da faixa."),
    ),
    step(
      "shift-middle",
      "SHIFT",
      [{ type: "MOVE", target: "b", to: { x: 252, y: 178 } }],
      "O espaço no índice 1 finalmente aparece.",
      "O item B deixa a posição onde X vai entrar.",
      "Mesmo uma única inserção exige mexer em vários elementos contíguos.",
      metrics(3, 3, "O(n)", "Mais um deslocamento para abrir a lacuna."),
    ),
    step(
      "insert",
      "INSERT",
      [
        { type: "MOVE", target: "x", to: { x: 146, y: 178 } },
        { type: "HIGHLIGHT", targets: ["x"], emphasis: "success" },
      ],
      "X entra no índice 1 depois dos deslocamentos.",
      "Array termina como 4, 6, 8, 12, 16.",
      "A inserção só acontece depois que a memória contígua foi reorganizada.",
      metrics(4, 4, "O(n)", "Inserção concluída após deslocamentos."),
    ),
  ],
};

const insertMiddleListTrace: TraceDefinition = {
  id: "compare-insert-middle-list",
  scene: {
    nodes: [
      node("a", "linked", 52, 178, 96, 56, { abstract: "4", practical: "A", memory: "4" }),
      node("c", "linked", 288, 178, 104, 56, { abstract: "12", practical: "C", memory: "12" }),
      node("d", "linked", 470, 178, 104, 56, { abstract: "18", practical: "D", memory: "18" }),
      node("x", "linked", 170, 54, 96, 56, { abstract: "6", practical: "X", memory: "6" }, { visible: false }),
      node("saved", "tag", 222, 272, 126, 28, { abstract: "next=12", practical: "próximo salvo", memory: "next" }, { visible: false }),
    ],
    edges: [
      { id: "ac", from: "a", to: "c", directed: true },
      { id: "cd", from: "c", to: "d", directed: true },
      { id: "ax", from: "a", to: "x", directed: true, visible: false },
      { id: "xc", from: "x", to: "c", directed: true, visible: false },
    ],
  },
  steps: [
    step(
      "observe",
      "OBSERVE",
      [{ type: "HIGHLIGHT", targets: ["ac"], emphasis: "active" }],
      "Lista ligada localiza o ponto entre 4 e 12.",
      "O nó novo ainda está fora da corrente.",
      "A operação depende de ponteiros, não de deslocamento em massa.",
      metrics(0, 0, "O(1)", "Referência para o ponto de inserção já conhecida."),
    ),
    step(
      "allocate",
      "ALLOCATE",
      [
        { type: "INSERT", target: "x" },
        { type: "INSERT", target: "saved" },
        { type: "HIGHLIGHT", targets: ["x", "saved"], emphasis: "active" },
      ],
      "O novo nó nasce fora da cadeia e guarda o próximo.",
      "A referência para 12 é preservada antes do relink.",
      "O trabalho aqui é preservar e reusar referências locais.",
      metrics(2, 2, "O(1)", "Alocação e guarda do próximo nó."),
    ),
    step(
      "relink",
      "RELINK",
      [
        { type: "UNLINK", from: "a", to: "c", edgeId: "ac" },
        { type: "LINK", from: "a", to: "x", edgeId: "ax" },
        { type: "LINK", from: "x", to: "c", edgeId: "xc" },
        { type: "HIGHLIGHT", targets: ["x"], emphasis: "active" },
      ],
      "A lista troca 1 ligação por 2 referências locais.",
      "A passa a apontar para X, e X aponta para C.",
      "A cadeia fica íntegra sem mover os nós antigos.",
      metrics(4, 3, "O(1)", "Relink local de ponteiros."),
    ),
    step(
      "done",
      "DONE",
      [
        { type: "MOVE", target: "x", to: { x: 170, y: 178 } },
        { type: "HIGHLIGHT", targets: ["x"], emphasis: "success" },
      ],
      "Lista termina 4 → 6 → 12 → 18.",
      "O novo nó assenta no lugar sem deslocar os demais.",
      "A vantagem é localidade da mutação; o preço é perder acesso direto por índice.",
      metrics(4, 3, "O(1)", "Inserção concluída sem deslocamento."),
    ),
  ],
};

const arrayQueueArrayTrace: TraceDefinition = {
  id: "compare-array-remove-front",
  scene: {
    nodes: [
      ...[0, 1, 2, 3].map((index) =>
        node(`slot-${index}`, "slot", 74 + index * 112, 178, 96, 58, {
          abstract: `[${index}]`,
          practical: `posição ${index + 1}`,
          memory: `slot ${index}`,
        }),
      ),
      node("a", "block", 74, 178, 96, 56, { abstract: "2", practical: "41", memory: "2" }),
      node("b", "block", 186, 178, 96, 56, { abstract: "5", practical: "42", memory: "5" }),
      node("c", "block", 298, 178, 96, 56, { abstract: "9", practical: "43", memory: "9" }),
      node("d", "block", 410, 178, 96, 56, { abstract: "12", practical: "44", memory: "12" }),
    ],
    edges: [],
  },
  steps: [
    step(
      "observe",
      "OBSERVE",
      [{ type: "HIGHLIGHT", targets: ["a"], emphasis: "active" }],
      "Array vai remover o primeiro elemento.",
      "A remoção é na posição 0.",
      "Remover do início quebra a continuidade se ninguém ocupar a lacuna.",
      metrics(0, 1, "O(1)", "Identificar o front lógico."),
    ),
    step(
      "remove-front",
      "REMOVE",
      [{ type: "REMOVE", target: "a" }],
      "O primeiro elemento sai, mas abre um buraco na frente.",
      "Pedido 41 foi removido.",
      "Ainda falta restaurar os índices contíguos.",
      metrics(1, 1, "O(n)", "Remoção física exige reorganização posterior."),
    ),
    step(
      "shift-left",
      "SHIFT",
      [
        { type: "MOVE", target: "b", to: { x: 74, y: 178 } },
        { type: "MOVE", target: "c", to: { x: 186, y: 178 } },
        { type: "MOVE", target: "d", to: { x: 298, y: 178 } },
      ],
      "Array desloca tudo para a esquerda.",
      "Pedidos 42, 43 e 44 ocupam o espaço livre.",
      "Esse custo cresce com o tamanho da fila mantida em memória contígua.",
      metrics(4, 4, "O(n)", "Três deslocamentos para preservar ordem."),
    ),
    step(
      "done",
      "DONE",
      [{ type: "HIGHLIGHT", targets: ["b", "c", "d"], emphasis: "success" }],
      "Array termina com 5, 9, 12 nas primeiras posições.",
      "A ordem FIFO foi preservada, mas com cópia de elementos.",
      "A semântica de fila foi simulada em uma estrutura menos adequada para remoção na frente.",
      metrics(4, 4, "O(n)", "Remoção concluída após deslocamentos."),
    ),
  ],
};

const arrayQueueQueueTrace: TraceDefinition = {
  id: "compare-queue-remove-front",
  scene: {
    nodes: [
      node("rail", "rail", 56, 178, 520, 58, { abstract: "", practical: "", memory: "" }),
      node("a", "block", 96, 178, 96, 56, { abstract: "2", practical: "41", memory: "2" }),
      node("b", "block", 208, 178, 96, 56, { abstract: "5", practical: "42", memory: "5" }),
      node("c", "block", 320, 178, 96, 56, { abstract: "9", practical: "43", memory: "9" }),
      node("d", "block", 432, 178, 96, 56, { abstract: "12", practical: "44", memory: "12" }),
      node("front", "tag", 96, 132, 70, 26, { abstract: "front", practical: "front", memory: "front" }),
      node("rear", "tag", 432, 132, 70, 26, { abstract: "rear", practical: "rear", memory: "rear" }),
    ],
    edges: [],
  },
  steps: [
    step(
      "observe",
      "OBSERVE",
      [{ type: "HIGHLIGHT", targets: ["front"], emphasis: "active" }],
      "Fila já modela a remoção pela frente.",
      "Front aponta para o pedido 41.",
      "A estrutura sabe quem sai sem precisar compactar tudo.",
      metrics(0, 1, "O(1)", "Leitura do ponteiro front."),
    ),
    step(
      "mark-front",
      "DEQUEUE",
      [
        { type: "HIGHLIGHT", targets: ["a", "front"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["rear"], emphasis: "visited" },
      ],
      "Fila remove exatamente o elemento apontado por front.",
      "O worker consome o primeiro pedido.",
      "A ordem FIFO depende do ponteiro, não de realinhar memória contígua.",
      metrics(1, 2, "O(1)", "Identificação e remoção do primeiro item."),
    ),
    step(
      "advance-front",
      "ADVANCE",
      [
        { type: "REMOVE", target: "a" },
        { type: "MOVE", target: "front", to: { x: 208, y: 132 } },
        { type: "HIGHLIGHT", targets: ["b"], emphasis: "active" },
      ],
      "Front avança para o próximo elemento.",
      "Pedido 42 passa a ser o primeiro da fila.",
      "Nenhum elemento existente precisou ser copiado para a esquerda.",
      metrics(2, 2, "O(1)", "Avanço do ponteiro front."),
    ),
    step(
      "done",
      "DONE",
      [{ type: "HIGHLIGHT", targets: ["b", "c", "d"], emphasis: "success" }],
      "Fila mantém 5, 9, 12 sem deslocamento.",
      "FIFO foi preservado com custo constante.",
      "É por isso que fila é a modelagem natural para remoção frequente na frente.",
      metrics(2, 2, "O(1)", "Deque concluído sem cópia em massa."),
    ),
  ],
};

const listHashListTrace: TraceDefinition = {
  id: "compare-list-lookup",
  scene: {
    nodes: [
      node("a", "linked", 54, 178, 98, 56, { abstract: "K10", practical: "sku-10", memory: "10" }),
      node("b", "linked", 194, 178, 98, 56, { abstract: "K27", practical: "sku-27", memory: "27" }),
      node("c", "linked", 334, 178, 98, 56, { abstract: "K42", practical: "sku-42", memory: "42" }),
      node("d", "linked", 474, 178, 98, 56, { abstract: "K55", practical: "sku-55", memory: "55" }),
      node("target", "tag", 242, 68, 140, 28, { abstract: "buscar K42", practical: "buscar sku-42", memory: "K42" }),
    ],
    edges: [
      { id: "ab", from: "a", to: "b", directed: true },
      { id: "bc", from: "b", to: "c", directed: true },
      { id: "cd", from: "c", to: "d", directed: true },
    ],
  },
  steps: [
    step(
      "observe",
      "OBSERVE",
      [{ type: "HIGHLIGHT", targets: ["target", "a"], emphasis: "active" }],
      "Lista só conhece a chave alvo e o primeiro nó.",
      "A busca por K42 começa do início.",
      "Sem índice auxiliar, a lista percorre um nó por vez.",
      metrics(0, 1, "O(n)", "Ponto de partida fixo na cabeça."),
    ),
    step(
      "check-a",
      "CHECK",
      [{ type: "HIGHLIGHT", targets: ["a"], emphasis: "visited" }, { type: "HIGHLIGHT", targets: ["b"], emphasis: "active" }],
      "K10 não é o alvo; avança para o próximo nó.",
      "sku-10 falha; a busca continua.",
      "Cada comparação descartada custa um passo a mais.",
      metrics(1, 2, "O(n)", "Primeira comparação sequencial."),
    ),
    step(
      "check-b",
      "CHECK",
      [{ type: "HIGHLIGHT", targets: ["b"], emphasis: "visited" }, { type: "HIGHLIGHT", targets: ["c"], emphasis: "active" }],
      "K27 também falha; a busca segue adiante.",
      "sku-27 também não corresponde.",
      "A lista mantém ordem simples, mas não salta diretamente para a chave.",
      metrics(2, 3, "O(n)", "Segunda comparação sequencial."),
    ),
    step(
      "found",
      "FOUND",
      [{ type: "HIGHLIGHT", targets: ["c"], emphasis: "success" }],
      "K42 é encontrado no terceiro nó tocado.",
      "A chave aparece depois de duas comparações negativas.",
      "O custo depende da posição do item ou da ausência dele na lista.",
      metrics(3, 3, "O(n)", "Item encontrado após varredura parcial."),
    ),
  ],
};

const listHashHashTrace: TraceDefinition = {
  id: "compare-hash-lookup",
  scene: {
    nodes: [
      node("bucket0", "bucket", 44, 74, 148, 52, { abstract: "bucket", practical: "bucket", memory: "0" }, { value: "0" }),
      node("bucket1", "bucket", 44, 148, 148, 52, { abstract: "bucket", practical: "bucket", memory: "1" }, { value: "1" }),
      node("bucket2", "bucket", 44, 222, 148, 52, { abstract: "bucket", practical: "bucket", memory: "2" }, { value: "2" }),
      node("a", "linked", 252, 148, 102, 56, { abstract: "K27", practical: "sku-27", memory: "27" }),
      node("b", "linked", 408, 148, 102, 56, { abstract: "K42", practical: "sku-42", memory: "42" }),
      node("hash", "tag", 248, 58, 170, 28, { abstract: "hash(K42)=1", practical: "rota para bucket 1", memory: "h(K42)=1" }),
    ],
    edges: [
      { id: "bucket-chain", from: "bucket1", to: "a", directed: true },
      { id: "ab", from: "a", to: "b", directed: true },
    ],
  },
  steps: [
    step(
      "observe",
      "OBSERVE",
      [{ type: "HIGHLIGHT", targets: ["hash"], emphasis: "active" }],
      "Hash transforma a chave em um bucket provável.",
      "K42 é roteado para o bucket 1.",
      "A estrutura troca busca linear global por acesso direto a uma região menor.",
      metrics(1, 1, "O(1) médio", "Cálculo de hash."),
    ),
    step(
      "jump",
      "JUMP",
      [{ type: "HIGHLIGHT", targets: ["bucket1", "a"], emphasis: "active" }],
      "A busca salta direto para o bucket certo.",
      "O lookup ignora buckets irrelevantes.",
      "Mesmo com colisão, o espaço de busca já caiu bastante.",
      metrics(2, 2, "O(1) médio", "Salto direto para o bucket."),
    ),
    step(
      "chain",
      "CHECK",
      [{ type: "HIGHLIGHT", targets: ["a"], emphasis: "visited" }, { type: "HIGHLIGHT", targets: ["b"], emphasis: "active" }],
      "A colisão exige olhar o próximo nó da cadeia local.",
      "sku-27 colidiu, então a busca segue no mesmo bucket.",
      "O pior caso continua existindo, mas a cadeia costuma ser curta quando a tabela está saudável.",
      metrics(3, 3, "O(1) médio", "Comparação dentro da cadeia local."),
    ),
    step(
      "found",
      "FOUND",
      [{ type: "HIGHLIGHT", targets: ["b"], emphasis: "success" }],
      "K42 é encontrado sem percorrer a coleção inteira.",
      "A busca chega ao alvo depois do salto + uma colisão local.",
      "Essa é a vantagem principal do hash lookup frente à lista encadeada.",
      metrics(3, 3, "O(1) médio", "Lookup encerrado no bucket correto."),
    ),
  ],
};

const bfsDfsBfsTrace: TraceDefinition = {
  id: "compare-bfs",
  scene: {
    nodes: [
      node("a", "circle", 42, 146, 72, 72, { abstract: "A", practical: "início", memory: "A" }),
      node("b", "circle", 178, 54, 72, 72, { abstract: "B", practical: "B", memory: "B" }),
      node("c", "circle", 178, 238, 72, 72, { abstract: "C", practical: "C", memory: "C" }),
      node("d", "circle", 330, 54, 72, 72, { abstract: "D", practical: "D", memory: "D" }),
      node("e", "circle", 330, 238, 72, 72, { abstract: "E", practical: "E", memory: "E" }),
      node("g", "circle", 482, 146, 72, 72, { abstract: "G", practical: "alvo", memory: "G" }),
      node("queue", "tag", 180, 330, 170, 28, { abstract: "fila", practical: "fila", memory: "fila" }, { valueLabels: { abstract: "fila: ", practical: "fila: ", memory: "fila: " }, value: "[A]" }),
    ],
    edges: [
      { id: "ab", from: "a", to: "b", directed: true },
      { id: "ac", from: "a", to: "c", directed: true },
      { id: "bd", from: "b", to: "d", directed: true },
      { id: "ce", from: "c", to: "e", directed: true },
      { id: "dg", from: "d", to: "g", directed: true },
      { id: "eg", from: "e", to: "g", directed: true },
    ],
  },
  steps: [
    step("start", "START", [{ type: "HIGHLIGHT", targets: ["a", "queue"], emphasis: "active" }], "BFS começa em A e usa fila.", "BFS expande por camadas.", "A fila governa a ordem de visita.", metrics(0, 1, "O(V+E)", "Estado inicial.")),
    step("layer-1", "LAYER", [{ type: "HIGHLIGHT", targets: ["a"], emphasis: "visited" }, { type: "HIGHLIGHT", targets: ["b", "c"], emphasis: "active" }, { type: "WRITE_MEMORY", address: "queue", target: "queue", value: "[B,C]" }], "BFS descobre B e C na mesma camada.", "Os dois vizinhos entram juntos na fila.", "Camadas têm prioridade sobre profundidade.", metrics(2, 3, "O(V+E)", "Primeira fronteira.")),
    step("layer-2", "LAYER", [{ type: "HIGHLIGHT", targets: ["b", "c"], emphasis: "visited" }, { type: "HIGHLIGHT", targets: ["d", "e"], emphasis: "active" }, { type: "WRITE_MEMORY", address: "queue", target: "queue", value: "[D,E]" }], "A camada seguinte descobre D e E.", "BFS segue nivelado antes de tocar o alvo.", "Cada camada representa um número fixo de arestas desde a origem.", metrics(4, 5, "O(V+E)", "Segunda fronteira.")),
    step("find", "FIND", [{ type: "HIGHLIGHT", targets: ["g", "dg"], emphasis: "success" }], "G aparece assim que a camada 3 é alcançada.", "BFS encontra o alvo no menor número de saltos.", "O primeiro encontro já garante caminho mínimo em arestas.", metrics(5, 6, "O(V+E)", "Alvo descoberto por camadas.")),
    step("done", "DONE", [{ type: "HIGHLIGHT", targets: ["a", "b", "d", "g"], emphasis: "success" }], "Caminho mínimo em paradas: A → B → D → G.", "BFS prioriza largura e reduz saltos.", "Essa estratégia é ótima quando todas as arestas têm o mesmo peso.", metrics(5, 6, "O(V+E)", "Busca concluída.")),
  ],
};

const bfsDfsDfsTrace: TraceDefinition = {
  id: "compare-dfs",
  scene: {
    nodes: [
      node("a", "circle", 42, 146, 72, 72, { abstract: "A", practical: "início", memory: "A" }),
      node("b", "circle", 178, 54, 72, 72, { abstract: "B", practical: "B", memory: "B" }),
      node("c", "circle", 178, 238, 72, 72, { abstract: "C", practical: "C", memory: "C" }),
      node("d", "circle", 330, 54, 72, 72, { abstract: "D", practical: "D", memory: "D" }),
      node("e", "circle", 330, 238, 72, 72, { abstract: "E", practical: "E", memory: "E" }),
      node("g", "circle", 482, 146, 72, 72, { abstract: "G", practical: "alvo", memory: "G" }),
      node("stack", "tag", 180, 330, 170, 28, { abstract: "pilha", practical: "pilha", memory: "pilha" }, { valueLabels: { abstract: "pilha: ", practical: "pilha: ", memory: "pilha: " }, value: "[A]" }),
    ],
    edges: [
      { id: "ab", from: "a", to: "b", directed: true },
      { id: "ac", from: "a", to: "c", directed: true },
      { id: "bd", from: "b", to: "d", directed: true },
      { id: "ce", from: "c", to: "e", directed: true },
      { id: "dg", from: "d", to: "g", directed: true },
      { id: "eg", from: "e", to: "g", directed: true },
    ],
  },
  steps: [
    step("start", "START", [{ type: "HIGHLIGHT", targets: ["a", "stack"], emphasis: "active" }], "DFS começa em A e usa pilha.", "DFS escolhe um ramo e aprofunda.", "A estrutura prioriza profundidade antes de largura.", metrics(0, 1, "O(V+E)", "Estado inicial.")),
    step("descend-b", "DESCEND", [{ type: "HIGHLIGHT", targets: ["a"], emphasis: "visited" }, { type: "HIGHLIGHT", targets: ["b"], emphasis: "active" }, { type: "WRITE_MEMORY", address: "stack", target: "stack", value: "[A,B]" }], "DFS entra em B antes de visitar C.", "O ramo de B recebe prioridade imediata.", "A ordem depende da exploração do ramo atual.", metrics(1, 2, "O(V+E)", "Primeira descida.")),
    step("descend-d", "DESCEND", [{ type: "HIGHLIGHT", targets: ["b"], emphasis: "visited" }, { type: "HIGHLIGHT", targets: ["d"], emphasis: "active" }, { type: "WRITE_MEMORY", address: "stack", target: "stack", value: "[A,B,D]" }], "DFS aprofunda mais um nível até D.", "Ainda não há visita a C ou E.", "A pilha cresce em profundidade.", metrics(2, 3, "O(V+E)", "Segunda descida.")),
    step("find", "FIND", [{ type: "HIGHLIGHT", targets: ["g", "dg"], emphasis: "success" }], "O alvo surge ao final do ramo atual.", "DFS encontra G sem visitar a camada toda.", "O encontro pode ser rápido, mas não prova menor número de arestas.", metrics(3, 4, "O(V+E)", "Alvo encontrado no ramo corrente.")),
    step("done", "DONE", [{ type: "HIGHLIGHT", targets: ["a", "b", "d", "g"], emphasis: "success" }], "DFS achou A → B → D → G por aprofundamento.", "A estratégia é explorar um caminho até o fim antes de voltar.", "Isso favorece exploração profunda, não caminho mínimo por saltos.", metrics(3, 4, "O(V+E)", "Busca concluída.")),
  ],
};

const bfsDijkstraBfsTrace: TraceDefinition = {
  id: "compare-bfs-weighted",
  scene: {
    nodes: [
      node("a", "circle", 40, 146, 72, 72, { abstract: "A", practical: "A", memory: "A" }),
      node("b", "circle", 172, 54, 72, 72, { abstract: "B", practical: "B", memory: "B" }),
      node("c", "circle", 172, 238, 72, 72, { abstract: "C", practical: "C", memory: "C" }),
      node("e", "circle", 324, 238, 72, 72, { abstract: "E", practical: "E", memory: "E" }),
      node("d", "circle", 486, 146, 72, 72, { abstract: "D", practical: "D", memory: "D" }),
      node("cost", "tag", 210, 330, 180, 28, { abstract: "paradas", practical: "saltos", memory: "saltos" }, { valueLabels: { abstract: "paradas: ", practical: "saltos: ", memory: "saltos: " }, value: 0 }),
    ],
    edges: [
      { id: "ab", from: "a", to: "b", directed: true },
      { id: "ac", from: "a", to: "c", directed: true },
      { id: "bd", from: "b", to: "d", directed: true },
      { id: "ce", from: "c", to: "e", directed: true },
      { id: "ed", from: "e", to: "d", directed: true },
    ],
  },
  steps: [
    step("start", "START", [{ type: "HIGHLIGHT", targets: ["a", "cost"], emphasis: "active" }], "BFS quer minimizar paradas, não peso.", "Cada aresta vale só um salto para o algoritmo.", "Com pesos ignorados, o objetivo é chegar em D usando menos arestas.", metrics(0, 1, "O(V+E)", "Estado inicial.")),
    step("neighbors", "LAYER", [{ type: "HIGHLIGHT", targets: ["b", "c"], emphasis: "active" }, { type: "WRITE_MEMORY", address: "hops", target: "cost", value: 1 }], "B e C estão na mesma camada.", "BFS vê dois caminhos com um salto.", "Peso diferente não muda a ordem da camada.", metrics(2, 3, "O(V+E)", "Primeira fronteira.")),
    step("reach-d", "REACH", [{ type: "HIGHLIGHT", targets: ["d", "bd"], emphasis: "success" }, { type: "WRITE_MEMORY", address: "hops", target: "cost", value: 2 }], "Via B, D aparece em 2 arestas.", "BFS encerra assim que alcança D em duas paradas.", "O algoritmo não pergunta se esse caminho é barato; só se é curto em saltos.", metrics(3, 4, "O(V+E)", "Alvo alcançado na segunda camada.")),
    step("done", "DONE", [{ type: "HIGHLIGHT", targets: ["a", "b", "d"], emphasis: "success" }], "BFS escolhe A → B → D.", "Menos paradas, mas não necessariamente menor custo total.", "É a resposta certa apenas quando todas as arestas valem a mesma coisa.", metrics(3, 4, "O(V+E)", "Busca concluída por número de arestas.")),
  ],
};

const bfsDijkstraDijkstraTrace: TraceDefinition = {
  id: "compare-dijkstra-weighted",
  scene: {
    nodes: [
      node("a", "circle", 40, 146, 72, 72, { abstract: "A", practical: "A", memory: "A" }),
      node("b", "circle", 172, 54, 72, 72, { abstract: "B", practical: "B", memory: "B" }),
      node("c", "circle", 172, 238, 72, 72, { abstract: "C", practical: "C", memory: "C" }),
      node("e", "circle", 324, 238, 72, 72, { abstract: "E", practical: "E", memory: "E" }),
      node("d", "circle", 486, 146, 72, 72, { abstract: "D", practical: "D", memory: "D" }),
      node("dist", "tag", 186, 330, 220, 28, { abstract: "dist", practical: "custos", memory: "dist" }, { valueLabels: { abstract: "dist: ", practical: "custos: ", memory: "dist: " }, value: "A=0" }),
      node("wAB", "tag", 104, 82, 44, 24, { abstract: "6", practical: "6", memory: "6" }),
      node("wAC", "tag", 104, 270, 44, 24, { abstract: "1", practical: "1", memory: "1" }),
      node("wBD", "tag", 330, 76, 44, 24, { abstract: "1", practical: "1", memory: "1" }),
      node("wCE", "tag", 248, 270, 44, 24, { abstract: "1", practical: "1", memory: "1" }),
      node("wED", "tag", 402, 236, 44, 24, { abstract: "1", practical: "1", memory: "1" }),
    ],
    edges: [
      { id: "ab", from: "a", to: "b", directed: true },
      { id: "ac", from: "a", to: "c", directed: true },
      { id: "bd", from: "b", to: "d", directed: true },
      { id: "ce", from: "c", to: "e", directed: true },
      { id: "ed", from: "e", to: "d", directed: true },
    ],
  },
  steps: [
    step("start", "START", [{ type: "HIGHLIGHT", targets: ["a", "dist"], emphasis: "active" }], "Dijkstra quer minimizar custo acumulado.", "O algoritmo parte de A=0.", "Agora o peso das arestas muda a ordem das decisões.", metrics(0, 1, "O((V+E)log V)", "Estado inicial.")),
    step("relax-1", "RELAX", [{ type: "HIGHLIGHT", targets: ["b", "c", "wAB", "wAC"], emphasis: "active" }, { type: "WRITE_MEMORY", address: "dist", target: "dist", value: "B=6, C=1" }], "A primeira rodada mostra C=1 e B=6.", "Mesmo com a mesma profundidade, C é muito mais barato.", "O custo acumulado vira critério antes de o alvo aparecer.", metrics(2, 3, "O((V+E)log V)", "Primeiro relaxamento.")),
    step("relax-2", "RELAX", [{ type: "HIGHLIGHT", targets: ["c", "e", "wCE"], emphasis: "active" }, { type: "WRITE_MEMORY", address: "dist", target: "dist", value: "C=1, E=2, B=6" }], "Dijkstra segue por C porque ele é o menor custo aberto.", "A rota barata passa por um caminho com mais paradas.", "O algoritmo aceita mais arestas se o custo total continuar menor.", metrics(4, 4, "O((V+E)log V)", "Escolha do menor custo aberto.")),
    step("reach-d", "REACH", [{ type: "HIGHLIGHT", targets: ["d", "ed", "e"], emphasis: "success" }, { type: "WRITE_MEMORY", address: "dist", target: "dist", value: "D=3 via C→E" }], "D chega por A → C → E → D com custo 3.", "Mais paradas, menor custo total.", "É por isso que Dijkstra supera BFS quando o peso importa.", metrics(5, 5, "O((V+E)log V)", "Relaxamento final até D.")),
    step("done", "DONE", [{ type: "HIGHLIGHT", targets: ["a", "c", "e", "d"], emphasis: "success" }], "Dijkstra escolhe A → C → E → D.", "Caminho mais barato vence, mesmo com mais arestas.", "A noção de 'melhor' depende da métrica que o algoritmo otimiza.", metrics(5, 5, "O((V+E)log V)", "Busca concluída por custo total.")),
  ],
};

const dijkstraBellmanDijkstraTrace: TraceDefinition = {
  id: "compare-dijkstra-negative-edge",
  scene: {
    nodes: [
      node("a", "block", 40, 146, 88, 52, { abstract: "A", practical: "A", memory: "A" }, { valueLabels: { abstract: "A = ", practical: "A = ", memory: "A = " }, value: 0 }),
      node("b", "block", 190, 54, 88, 52, { abstract: "B", practical: "B", memory: "B" }, { valueLabels: { abstract: "B = ", practical: "B = ", memory: "B = " }, value: "∞" }),
      node("c", "block", 190, 238, 88, 52, { abstract: "C", practical: "C", memory: "C" }, { valueLabels: { abstract: "C = ", practical: "C = ", memory: "C = " }, value: "∞" }),
      node("d", "block", 458, 146, 88, 52, { abstract: "D", practical: "D", memory: "D" }, { valueLabels: { abstract: "D = ", practical: "D = ", memory: "D = " }, value: "∞" }),
      node("warn", "tag", 288, 330, 220, 28, { abstract: "premissa: pesos não negativos", practical: "requer pesos ≥ 0", memory: "warn" }),
      node("wAB", "tag", 112, 84, 44, 24, { abstract: "1", practical: "1", memory: "1" }),
      node("wAC", "tag", 112, 270, 44, 24, { abstract: "4", practical: "4", memory: "4" }),
      node("wCB", "tag", 236, 146, 44, 24, { abstract: "-5", practical: "-5", memory: "-5" }),
      node("wBD", "tag", 332, 84, 44, 24, { abstract: "2", practical: "2", memory: "2" }),
    ],
    edges: [
      { id: "ab", from: "a", to: "b", directed: true },
      { id: "ac", from: "a", to: "c", directed: true },
      { id: "cb", from: "c", to: "b", directed: true },
      { id: "bd", from: "b", to: "d", directed: true },
    ],
  },
  steps: [
    step("start", "START", [{ type: "HIGHLIGHT", targets: ["a", "warn"], emphasis: "active" }], "Dijkstra pressupõe pesos não negativos.", "Esse grafo viola a premissa com C → B = -5.", "A estrutura do algoritmo fica perigosa quando uma melhoria pode chegar atrasada por aresta negativa.", metrics(0, 1, "O((V+E)log V)", "Estado inicial.")),
    step("relax-a", "RELAX", [{ type: "WRITE_MEMORY", address: "B", target: "b", value: 1 }, { type: "WRITE_MEMORY", address: "C", target: "c", value: 4 }, { type: "HIGHLIGHT", targets: ["b", "c", "wAB", "wAC"], emphasis: "active" }], "Primeiro relaxamento: B=1, C=4.", "B parece melhor que C no começo.", "Até aqui nada parece errado.", metrics(2, 3, "O((V+E)log V)", "Primeiras distâncias provisórias.")),
    step("finalize-b", "FINALIZE", [{ type: "WRITE_MEMORY", address: "D", target: "d", value: 3 }, { type: "HIGHLIGHT", targets: ["b", "d", "bd"], emphasis: "active" }], "Dijkstra finaliza B cedo e deriva D=3.", "O algoritmo trata B como distância estável.", "Esse é o momento que a premissa de pesos não negativos importa.", metrics(4, 4, "O((V+E)log V)", "Extração prematura do mínimo.")),
    step("late-negative", "WARNING", [{ type: "HIGHLIGHT", targets: ["c", "cb", "warn"], emphasis: "warning" }], "Depois, C revelaria B=-1 por causa da aresta negativa.", "A melhoria chega tarde demais para um Dijkstra clássico.", "O algoritmo não é seguro aqui: a premissa foi quebrada.", metrics(5, 5, "inválido", "Aresta negativa invalida a garantia do algoritmo.")),
    step("done", "DONE", [{ type: "HIGHLIGHT", targets: ["warn"], emphasis: "warning" }], "Dijkstra não deve ser escolhido para esse grafo.", "A resposta pode parecer plausível e ainda assim ser incorreta.", "Quando há peso negativo, a comparação correta é com Bellman-Ford.", metrics(5, 5, "inválido", "Escolha de algoritmo incorreta.")),
  ],
};

const dijkstraBellmanBellmanTrace: TraceDefinition = {
  id: "compare-bellman-negative-edge",
  scene: {
    nodes: [
      node("a", "block", 40, 146, 88, 52, { abstract: "A", practical: "A", memory: "A" }, { valueLabels: { abstract: "A = ", practical: "A = ", memory: "A = " }, value: 0 }),
      node("b", "block", 190, 54, 88, 52, { abstract: "B", practical: "B", memory: "B" }, { valueLabels: { abstract: "B = ", practical: "B = ", memory: "B = " }, value: "∞" }),
      node("c", "block", 190, 238, 88, 52, { abstract: "C", practical: "C", memory: "C" }, { valueLabels: { abstract: "C = ", practical: "C = ", memory: "C = " }, value: "∞" }),
      node("d", "block", 458, 146, 88, 52, { abstract: "D", practical: "D", memory: "D" }, { valueLabels: { abstract: "D = ", practical: "D = ", memory: "D = " }, value: "∞" }),
      node("pass", "tag", 262, 330, 190, 28, { abstract: "passada extra", practical: "V-1 relaxações", memory: "pass" }),
      node("wAB", "tag", 112, 84, 44, 24, { abstract: "1", practical: "1", memory: "1" }),
      node("wAC", "tag", 112, 270, 44, 24, { abstract: "4", practical: "4", memory: "4" }),
      node("wCB", "tag", 236, 146, 44, 24, { abstract: "-5", practical: "-5", memory: "-5" }),
      node("wBD", "tag", 332, 84, 44, 24, { abstract: "2", practical: "2", memory: "2" }),
    ],
    edges: [
      { id: "ab", from: "a", to: "b", directed: true },
      { id: "ac", from: "a", to: "c", directed: true },
      { id: "cb", from: "c", to: "b", directed: true },
      { id: "bd", from: "b", to: "d", directed: true },
    ],
  },
  steps: [
    step("start", "START", [{ type: "HIGHLIGHT", targets: ["a", "pass"], emphasis: "active" }], "Bellman-Ford aceita arestas negativas.", "O algoritmo ainda começa com A=0.", "A grande troca é custo maior em favor de correção nesse tipo de grafo.", metrics(0, 1, "O(V·E)", "Estado inicial.")),
    step("relax-a", "RELAX", [{ type: "WRITE_MEMORY", address: "B", target: "b", value: 1 }, { type: "WRITE_MEMORY", address: "C", target: "c", value: 4 }, { type: "HIGHLIGHT", targets: ["b", "c", "wAB", "wAC"], emphasis: "active" }], "Primeira passada: B=1, C=4.", "Os mesmos valores provisórios aparecem no começo.", "Bellman-Ford ainda não conclui nada cedo demais.", metrics(2, 3, "O(V·E)", "Primeira passada de relaxamento.")),
    step("negative-improves", "RELAX", [{ type: "WRITE_MEMORY", address: "B", target: "b", value: -1 }, { type: "HIGHLIGHT", targets: ["c", "cb", "b"], emphasis: "active" }], "A aresta negativa melhora B de 1 para -1.", "C consegue reabrir o custo de B sem violar o algoritmo.", "Essa é exatamente a melhoria tardia que Dijkstra não consegue tratar com segurança.", metrics(3, 4, "O(V·E)", "Relaxamento com peso negativo.")),
    step("propagate", "RELAX", [{ type: "WRITE_MEMORY", address: "D", target: "d", value: 1 }, { type: "HIGHLIGHT", targets: ["b", "d", "bd"], emphasis: "active" }], "A melhora de B propaga e D passa a valer 1.", "O melhor caminho agora é A → C → B → D.", "Relaxamentos sucessivos permitem corrigir custos que chegaram tarde.", metrics(4, 5, "O(V·E)", "Propagação do novo menor custo.")),
    step("done", "DONE", [{ type: "HIGHLIGHT", targets: ["a", "c", "b", "d"], emphasis: "success" }], "Bellman-Ford termina correto mesmo com peso negativo.", "O custo final para D é 1.", "É mais lento, mas é o algoritmo certo para esse cenário.", metrics(4, 5, "O(V·E)", "Busca concluída corretamente.")),
  ],
};

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
    traceA: insertMiddleArrayTrace,
    traceB: insertMiddleListTrace,
    representation: compareRepresentation,
    description: "Mesma inserção, duas semânticas: deslocar valores ou religar nós.",
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
    traceA: arrayQueueArrayTrace,
    traceB: arrayQueueQueueTrace,
    representation: compareRepresentation,
    description: "As duas soluções preservam ordem, mas só a fila modela a remoção frontal sem cópia em massa.",
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
    traceA: listHashListTrace,
    traceB: listHashHashTrace,
    representation: compareRepresentation,
    description: "Uma estrutura varre a sequência inteira; a outra usa hash para reduzir o espaço de busca.",
  },
  {
    id: "bfs-dfs",
    title: "BFS × DFS: camadas versus profundidade",
    lessonIdA: "graph",
    lessonIdB: "dfs",
    labelA: "BFS",
    labelB: "DFS",
    summaryA: "BFS visita por camadas e garante menos arestas.",
    summaryB: "DFS aprofunda um ramo e pode encontrar cedo sem garantir caminho mínimo.",
    summaryResult: "neutral",
    traceA: bfsDfsBfsTrace,
    traceB: bfsDfsDfsTrace,
    representation: compareRepresentation,
    description: "Os dois percorrem o mesmo grafo, mas a estratégia de expansão muda a noção de 'melhor caminho'.",
  },
  {
    id: "bfs-dijkstra",
    title: "Menos paradas × menor custo",
    lessonIdA: "graph",
    lessonIdB: "dijkstra",
    labelA: "BFS",
    labelB: "Dijkstra",
    summaryA: "BFS minimiza o número de arestas.",
    summaryB: "Dijkstra aceita mais arestas quando o custo total cai.",
    summaryResult: "neutral",
    traceA: bfsDijkstraBfsTrace,
    traceB: bfsDijkstraDijkstraTrace,
    representation: compareRepresentation,
    description: "Quando os pesos importam, 'mais curto' pode significar menos custo e não menos saltos.",
  },
  {
    id: "dijkstra-bellman",
    title: "Dijkstra × Bellman-Ford: custo versus pesos negativos",
    lessonIdA: "dijkstra",
    lessonIdB: "bellman-ford",
    labelA: "Dijkstra",
    labelB: "Bellman-Ford",
    summaryA: "Dijkstra é eficiente, mas depende de pesos não negativos.",
    summaryB: "Bellman-Ford é mais lento, porém continua correto com peso negativo.",
    summaryResult: "good-right",
    traceA: dijkstraBellmanDijkstraTrace,
    traceB: dijkstraBellmanBellmanTrace,
    representation: compareRepresentation,
    description: "A comparação aqui não é velocidade pura; é escolher o algoritmo cuja premissa combina com o grafo.",
  },
];

export const comparisonById = Object.fromEntries(
  comparisons.map((c) => [c.id, c]),
) as Record<string, ComparisonDefinition>;
