import type { FlowSceneDefinition, FlowSceneStep } from "../core/flow-scene/types";

function step(definition: FlowSceneStep): FlowSceneStep {
  return definition;
}

export const btreeFlowScene: FlowSceneDefinition = {
  id: "btree-page-split",
  sceneKind: "tree",
  title: "B+ Tree: split de página",
  description: "A cena mostra a chave 27 descendo, causando overflow, dividindo a folha e promovendo uma chave separadora.",
  legend: [
    { semantic: "request", label: "Chave em movimento" },
    { semantic: "condition", label: "Comparação" },
    { semantic: "processing", label: "Split e promoção" },
    { semantic: "success", label: "Árvore reorganizada" },
  ],
  tree: {
    anchors: [
      {
        id: "incoming",
        label: "entrada",
        position: {
          desktop: { x: 0.16, y: 0.16 },
          mobile: { x: 0.5, y: 0.12 },
        },
      },
    ],
    token: {
      id: "insert-27",
      key: 27,
      locationId: "incoming",
      visible: true,
    },
    pages: [
      {
        id: "root",
        kind: "root",
        label: "raiz",
        keys: [30],
        capacity: 3,
        description: "Página raiz que decide para qual folha a chave deve descer.",
        position: {
          desktop: { x: 0.52, y: 0.23 },
          mobile: { x: 0.5, y: 0.28 },
        },
      },
      {
        id: "left",
        kind: "leaf",
        label: "folha",
        keys: [10, 20],
        capacity: 2,
        description: "Folha da esquerda, destino de 27 porque 27 < 30.",
        position: {
          desktop: { x: 0.3, y: 0.58 },
          mobile: { x: 0.22, y: 0.68 },
        },
      },
      {
        id: "middle",
        kind: "leaf",
        label: "folha nova",
        keys: [27],
        capacity: 2,
        description: "Nova folha criada pelo split.",
        position: {
          desktop: { x: 0.46, y: 0.58 },
          mobile: { x: 0.5, y: 0.68 },
        },
        visible: false,
      },
      {
        id: "right",
        kind: "leaf",
        label: "folha",
        keys: [30, 40],
        capacity: 2,
        description: "Folha da direita, intacta durante a inserção.",
        position: {
          desktop: { x: 0.74, y: 0.58 },
          mobile: { x: 0.78, y: 0.68 },
        },
      },
    ],
    edges: [
      { id: "root-left", from: "root", to: "left", visible: true },
      { id: "root-middle", from: "root", to: "middle", visible: false },
      { id: "root-right", from: "root", to: "right", visible: true },
    ],
  },
  steps: [
    step({
      id: "btree-key-waits",
      title: "A chave ainda está fora da árvore",
      caption: "A inserção começa com uma chave solta. Nada foi reconfigurado ainda.",
      focusNodeId: "root",
      concept: {
        title: "Antes da inserção, existe uma estrutura estável",
        bubble: "O primeiro objeto importante não é a etapa; é a própria chave 27 esperando para entrar.",
        summary: "Uma B+ Tree guarda muitas chaves por página. Antes de qualquer split, a árvore já tem uma raiz e folhas organizadas por intervalos.",
        longform: [
          "Esse tipo de estrutura tenta reduzir profundidade porque ler páginas em disco custa caro. Por isso ela não trabalha com um nó por valor como uma BST didática costuma fazer.",
          "Aqui a raiz [30] separa dois intervalos. Tudo menor que 30 desce para a folha da esquerda; tudo maior ou igual continua para a direita.",
        ],
        details: [
          "A chave 27 aparece como um objeto independente, fora da árvore.",
          "As folhas já agrupam chaves em blocos, não em cards isolados.",
          "A representação visual correta precisa mostrar páginas e arestas reais.",
        ],
        glossary: [
          { term: "Página", definition: "Bloco que agrupa várias chaves e costuma corresponder a leitura/escrita em disco." },
          { term: "Folha", definition: "Página terminal onde a chave efetivamente é inserida." },
        ],
        payloadTitle: "Estado inicial",
        payloadLines: [
          "raiz = [30]",
          "folha esquerda = [10, 20]",
          "folha direita = [30, 40]",
        ],
      },
      actions: [
        { type: "reset-tree-state" },
        { type: "clear-tree-comparison" },
        { type: "move-tree-token", locationId: "incoming", state: "waiting" },
        { type: "set-tree-page-state", pageId: "root", state: "active" },
      ],
    }),
    step({
      id: "btree-descend-left",
      title: "A raiz compara e escolhe a aresta esquerda",
      caption: "A comparação 27 < 30 fica visível e a chave desce pela aresta correta.",
      focusNodeId: "left",
      concept: {
        title: "Comparação visível, não implícita",
        bubble: "O usuário precisa enxergar a decisão 27 < 30 antes de ver o movimento para a folha.",
        summary: "A raiz não executa o split; ela apenas decide o caminho. Em uma árvore de verdade, essa decisão aparece como comparação e descida por aresta.",
        details: [
          "27 é comparado com 30 na raiz.",
          "A decisão ativa a aresta para a esquerda.",
          "A chave continua sendo o mesmo objeto visual ao longo da descida.",
        ],
        glossary: [
          { term: "Separador", definition: "Chave usada por páginas internas para decidir para onde descer." },
        ],
        payloadTitle: "Comparação",
        payloadLines: [
          "27 < 30",
          "destino = folha esquerda",
        ],
      },
      actions: [
        { type: "reset-tree-state" },
        { type: "move-tree-token", locationId: "left", state: "moving" },
        { type: "set-tree-page-state", pageId: "root", state: "active" },
        { type: "set-tree-page-state", pageId: "left", state: "receiving" },
        { type: "set-tree-edge-state", edgeId: "root-left", state: "active" },
        { type: "compare-keys", pageId: "root", key: 27, against: 30, outcome: "lt" },
      ],
    }),
    step({
      id: "btree-overflow",
      title: "A folha recebe 27 e entra em overflow",
      caption: "A chave entra na página folha e o excesso de capacidade fica explícito.",
      focusNodeId: "left",
      concept: {
        title: "Overflow acontece na página, não no texto",
        bubble: "O bloco da folha cresce para mostrar a nova chave e deixa claro por que o split será necessário.",
        summary: "Em vez de ler a palavra overflow em um card, a pessoa vê a chave 27 entrando na folha e tornando visível o excesso.",
        details: [
          "A ordem interna da página passa a ser [10, 20, 27].",
          "A capacidade dessa folha é 2, então 3 chaves já caracterizam overflow.",
          "A falha aqui não é lógica; é estrutural: não cabe mais nessa página.",
        ],
        pitfalls: [
          "Split não é um capricho do algoritmo. Ele é a resposta à capacidade fixa da página.",
        ],
        payloadTitle: "Página antes do split",
        payloadLines: [
          "[10, 20, 27]",
          "capacidade = 2",
          "estado = overflow",
        ],
      },
      actions: [
        { type: "reset-tree-state" },
        { type: "clear-tree-comparison" },
        { type: "move-tree-token", locationId: "left", state: "inserting" },
        { type: "insert-key", pageId: "left", key: 27, state: "overflow" },
        { type: "set-tree-page-state", pageId: "left", state: "overflow" },
        { type: "set-tree-edge-state", edgeId: "root-left", state: "active" },
      ],
    }),
    step({
      id: "btree-split-page",
      title: "A folha se divide em duas páginas",
      caption: "Parte das chaves continua na página antiga e uma nova página surge ao lado.",
      focusNodeId: "middle",
      concept: {
        title: "Split é redistribuição física",
        bubble: "As chaves deixam de caber num único bloco e passam a ocupar duas páginas vizinhas.",
        summary: "O split não é apenas uma mudança de legenda. A estrutura interna da árvore muda: uma nova folha aparece e as chaves são redistribuídas.",
        longform: [
          "Na animação, esse é o momento mais importante para o modelo mental. A página antiga deixa de carregar três chaves e o novo bloco nasce como continuação física da estrutura.",
          "Como estamos explicando uma B+ Tree, a chave promovida funciona como separador para navegação, enquanto os dados continuam nas folhas.",
        ],
        details: [
          "A folha antiga volta para [10, 20].",
          "A nova folha nasce contendo [27].",
          "Uma nova aresta pai-filho precisa aparecer para acomodar essa página.",
        ],
        payloadTitle: "Depois do split local",
        payloadLines: [
          "esquerda = [10, 20]",
          "nova folha = [27]",
        ],
      },
      actions: [
        { type: "reset-tree-state" },
        { type: "split-page", pageId: "left", leftKeys: [10, 20], rightPageId: "middle", rightPageKeys: [27], state: "splitting" },
        { type: "set-tree-page-state", pageId: "left", state: "splitting" },
        { type: "set-tree-page-state", pageId: "middle", state: "active" },
        { type: "set-tree-edge-visibility", edgeId: "root-middle", visible: true },
        { type: "set-tree-edge-state", edgeId: "root-middle", state: "active" },
        { type: "move-tree-token", locationId: "middle", state: "placed" },
      ],
    }),
    step({
      id: "btree-promote",
      title: "A chave separadora sobe para a raiz",
      caption: "A mesma chave agora é promovida e passa a orientar novas buscas.",
      focusNodeId: "root",
      concept: {
        title: "Promoção muda a navegação da árvore",
        bubble: "A chave 27 sai do papel de entrada pendente e vira separador da raiz.",
        summary: "Depois do split, a árvore precisa informar ao nível superior que agora existe um novo intervalo. Isso acontece promovendo uma chave separadora para o pai.",
        details: [
          "A raiz deixa de ser [30] e passa a ser [27, 30].",
          "Essa promoção não apaga a folha nova; ela só cria um novo ponto de decisão no topo.",
          "A estrutura continua balanceada porque todas as folhas permanecem no mesmo nível.",
        ],
        payloadTitle: "Raiz após promoção",
        payloadLines: [
          "raiz = [27, 30]",
          "27 separa esquerda e folha nova",
        ],
      },
      actions: [
        { type: "reset-tree-state" },
        { type: "promote-key", key: 27, parentPageId: "root" },
        { type: "set-tree-page-state", pageId: "root", state: "active" },
        { type: "set-tree-page-state", pageId: "middle", state: "active" },
        { type: "set-tree-edge-state", edgeId: "root-left", state: "active" },
        { type: "set-tree-edge-state", edgeId: "root-middle", state: "active" },
        { type: "set-tree-edge-state", edgeId: "root-right", state: "muted" },
      ],
    }),
    step({
      id: "btree-relayout",
      title: "A árvore se reorganiza e assenta no novo layout",
      caption: "A inserção termina com a árvore recalculada, agora com três filhos visíveis.",
      focusNodeId: "root",
      concept: {
        title: "Relayout também é parte do conceito",
        bubble: "Depois do split e da promoção, a árvore precisa assentar numa geometria nova e compreensível.",
        summary: "O estado final precisa parecer uma árvore real: raiz no topo, filhos alinhados por baixo e separação espacial coerente entre subárvores.",
        details: [
          "A raiz mantém o papel de índice principal.",
          "As folhas ficam distribuídas em três ramos distintos.",
          "Mesmo pausada, a cena continua legível porque as páginas já assentaram nas posições finais.",
        ],
        payloadTitle: "Estado final",
        payloadLines: [
          "raiz = [27, 30]",
          "filhos = [10, 20] | [27] | [30, 40]",
          "altura = preservada",
        ],
      },
      actions: [
        { type: "reset-tree-state" },
        { type: "relayout-tree", positions: {
          root: {
            desktop: { x: 0.52, y: 0.23 },
            mobile: { x: 0.5, y: 0.24 },
          },
          left: {
            desktop: { x: 0.22, y: 0.6 },
            mobile: { x: 0.18, y: 0.68 },
          },
          middle: {
            desktop: { x: 0.5, y: 0.6 },
            mobile: { x: 0.5, y: 0.68 },
          },
          right: {
            desktop: { x: 0.78, y: 0.6 },
            mobile: { x: 0.82, y: 0.68 },
          },
        } },
        { type: "set-tree-page-state", pageId: "root", state: "success" },
        { type: "set-tree-page-state", pageId: "left", state: "success" },
        { type: "set-tree-page-state", pageId: "middle", state: "success" },
        { type: "set-tree-page-state", pageId: "right", state: "success" },
        { type: "set-tree-edge-state", edgeId: "root-left", state: "success" },
        { type: "set-tree-edge-state", edgeId: "root-middle", state: "success" },
        { type: "set-tree-edge-state", edgeId: "root-right", state: "success" },
        { type: "set-tree-token-state", state: "hidden" },
      ],
    }),
  ],
};

export const dlqFlowScene: FlowSceneDefinition = {
  id: "backend-dlq-flow",
  sceneKind: "queue",
  title: "DLQ: falha, retry e desvio",
  description: "Uma mesma mensagem atravessa fila, worker, retry e dead-letter queue até estacionar para inspeção.",
  legend: [
    { semantic: "request", label: "Mensagem ativa" },
    { semantic: "processing", label: "Processamento" },
    { semantic: "error", label: "Falha e retry" },
    { semantic: "result", label: "DLQ" },
  ],
  queue: {
    nodes: [
      {
        id: "main-queue",
        kind: "queue",
        label: "Fila principal",
        description: "ordem de chegada",
        position: {
          desktop: { x: 0.16, y: 0.34 },
          mobile: { x: 0.5, y: 0.16 },
        },
      },
      {
        id: "worker",
        kind: "worker",
        label: "Worker",
        description: "consome jobs",
        position: {
          desktop: { x: 0.43, y: 0.34 },
          mobile: { x: 0.5, y: 0.36 },
        },
      },
      {
        id: "processor",
        kind: "processor",
        label: "Processamento",
        description: "tenta executar o job",
        position: {
          desktop: { x: 0.74, y: 0.34 },
          mobile: { x: 0.5, y: 0.56 },
        },
      },
      {
        id: "retry-lane",
        kind: "retry",
        label: "Retry loop",
        description: "aguarda nova tentativa",
        position: {
          desktop: { x: 0.42, y: 0.73 },
          mobile: { x: 0.22, y: 0.8 },
        },
      },
      {
        id: "dlq",
        kind: "dlq",
        label: "DLQ",
        description: "parada para inspeção",
        position: {
          desktop: { x: 0.76, y: 0.73 },
          mobile: { x: 0.78, y: 0.8 },
        },
      },
    ],
    paths: [
      { id: "queue-worker", from: "main-queue", to: "worker", label: "consume", visible: false },
      { id: "worker-processor", from: "worker", to: "processor", label: "process", visible: false },
      { id: "processor-retry", from: "processor", to: "retry-lane", label: "failed", visible: false },
      { id: "retry-worker", from: "retry-lane", to: "worker", label: "retry", visible: false },
      { id: "processor-dlq", from: "processor", to: "dlq", label: "dead-letter", visible: false },
    ],
  },
  steps: [
    step({
      id: "dlq-enqueue",
      title: "A mensagem entra na fila principal",
      caption: "O fluxo começa com um job persistente aguardando consumo.",
      focusNodeId: "main-queue",
      concept: {
        title: "A mensagem é o objeto principal da cena",
        bubble: "Aqui não faz sentido um pulse genérico. O conceito é a própria mensagem, com identidade e estado.",
        summary: "Uma DLQ só faz sentido quando acompanhamos a mesma mensagem ao longo das tentativas. Por isso ela nasce com rótulo, contador e status.",
        details: [
          "A fila principal preserva ordem de chegada.",
          "A mensagem já aparece identificável: Pedido #482.",
          "O contador começa em 1/3 porque a primeira tentativa ainda será executada.",
        ],
        payloadTitle: "Mensagem",
        payloadLines: [
          "Pedido #482",
          "attempt: 1/3",
          "status: queued",
        ],
      },
      actions: [
        { type: "reset-queue-state" },
        {
          type: "spawn-message",
          message: {
            id: "order-482",
            label: "Pedido #482",
            attempt: 1,
            maxAttempts: 3,
            locationId: "main-queue",
            status: "queued",
            payloadLines: ["orderId=482"],
          },
        },
        { type: "set-queue-node-state", nodeId: "main-queue", state: "active" },
      ],
    }),
    step({
      id: "dlq-consume",
      title: "O worker consome a mensagem",
      caption: "A mensagem sai da fila principal e entra no worker.",
      focusNodeId: "worker",
      concept: {
        title: "Consumo não é conclusão",
        bubble: "Tirar a mensagem da fila só significa assumir responsabilidade por ela.",
        summary: "Quando o worker consome a mensagem, o item sai da espera e passa a estar em trânsito para processamento. Ainda não existe sucesso nenhum.",
        details: [
          "A fila principal deixa de ser o ponto ativo.",
          "O worker vira o agente responsável pela tentativa atual.",
          "O mesmo token continua sendo usado; só muda o destino e o estado.",
        ],
        payloadTitle: "Status atual",
        payloadLines: [
          "location = worker",
          "status = consuming",
        ],
      },
      actions: [
        { type: "reset-queue-state" },
        { type: "set-queue-node-state", nodeId: "worker", state: "active" },
        { type: "set-queue-node-state", nodeId: "main-queue", state: "waiting" },
        { type: "set-queue-path-state", pathId: "queue-worker", state: "transmitting" },
        { type: "move-message", messageId: "order-482", locationId: "worker", status: "consuming" },
      ],
    }),
    step({
      id: "dlq-process",
      title: "O worker entrega a mensagem para processamento",
      caption: "A tentativa ativa acontece na área de processamento.",
      focusNodeId: "processor",
      concept: {
        title: "Processar é a parte que pode falhar",
        bubble: "A fila e o worker organizam o trabalho; a falha normalmente aparece quando a execução real começa.",
        summary: "Neste ponto a mensagem já não está parada nem aguardando. Ela entrou na etapa que conversa com dependências externas, valida payloads ou executa regras que podem quebrar.",
        details: [
          "O caminho worker → processamento fica explícito.",
          "A mensagem muda para status processing.",
          "A etapa seguinte pode retornar sucesso ou falha; aqui seguimos o ramo de erro.",
        ],
        payloadTitle: "Tentativa ativa",
        payloadLines: [
          "attempt: 1/3",
          "status: processing",
        ],
      },
      actions: [
        { type: "reset-queue-state" },
        { type: "set-queue-node-state", nodeId: "worker", state: "processing" },
        { type: "set-queue-node-state", nodeId: "processor", state: "active" },
        { type: "set-queue-path-state", pathId: "worker-processor", state: "transmitting" },
        { type: "move-message", messageId: "order-482", locationId: "processor", status: "processing" },
      ],
    }),
    step({
      id: "dlq-first-failure",
      title: "A tentativa falha e entra no retry loop",
      caption: "A mensagem não some; ela muda de estado e é desviada para retry.",
      focusNodeId: "retry-lane",
      concept: {
        title: "Falha precisa ser visível e rastreável",
        bubble: "O erro não apaga a mensagem. Ele troca o status e envia o mesmo token para o loop de retry.",
        summary: "Retry útil não recria um job do zero nem esconde a falha. Ele preserva identidade, registra o insucesso e prepara uma nova tentativa controlada.",
        details: [
          "O processamento entra em estado de erro.",
          "A mensagem segue para a área de retry.",
          "Ela continua sendo Pedido #482, agora com status failed.",
        ],
        payloadTitle: "Falha transitória",
        payloadLines: [
          "attempt: 1/3",
          "status: failed",
          "next = retry",
        ],
      },
      actions: [
        { type: "reset-queue-state" },
        { type: "set-queue-node-state", nodeId: "processor", state: "error" },
        { type: "set-queue-node-state", nodeId: "retry-lane", state: "active" },
        { type: "set-queue-path-state", pathId: "processor-retry", state: "error" },
        { type: "move-message", messageId: "order-482", locationId: "retry-lane", status: "failed" },
      ],
    }),
    step({
      id: "dlq-second-attempt",
      title: "O retry incrementa a tentativa e devolve ao worker",
      caption: "O loop fica explícito: mesma mensagem, contador maior, novo ciclo.",
      focusNodeId: "worker",
      concept: {
        title: "Retry altera estado, não identidade",
        bubble: "O token volta ao worker com attempt 2/3. A cena mostra claramente que é o mesmo job tentando de novo.",
        summary: "Esse loop é a parte estrutural que uma fileira de cards não consegue explicar bem. A mensagem sai, falha, retorna e reentra no fluxo principal com um contador atualizado.",
        details: [
          "O contador avança de 1/3 para 2/3.",
          "A mensagem volta pelo caminho de retry.",
          "O worker reassume o mesmo job para uma nova execução.",
        ],
        payloadTitle: "Novo ciclo",
        payloadLines: [
          "attempt: 2/3",
          "status: retrying",
        ],
      },
      actions: [
        { type: "reset-queue-state" },
        { type: "increment-attempt", messageId: "order-482" },
        { type: "set-queue-node-state", nodeId: "retry-lane", state: "processing" },
        { type: "set-queue-node-state", nodeId: "worker", state: "active" },
        { type: "set-queue-path-state", pathId: "retry-worker", state: "transmitting" },
        { type: "move-message", messageId: "order-482", locationId: "worker", status: "retrying" },
      ],
    }),
    step({
      id: "dlq-limit-reached",
      title: "A nova falha consome a última tentativa útil",
      caption: "O sistema reconhece que continuar repetindo não resolve mais.",
      focusNodeId: "processor",
      concept: {
        title: "Existe um limite deliberado para retry",
        bubble: "Retry cego pode envenenar a fila. Por isso a aplicação precisa saber quando parar.",
        summary: "Depois de nova tentativa malsucedida, o sistema atinge o teto configurado. O próximo destino já não é o loop de retry, e sim uma rota lateral de falha final.",
        details: [
          "A mensagem volta ao processamento para a nova tentativa.",
          "O contador avança para 3/3.",
          "A partir daqui, insistir mais só repetiria o mesmo erro.",
        ],
        payloadTitle: "Limite atingido",
        payloadLines: [
          "attempt: 3/3",
          "status: failed",
          "next = DLQ",
        ],
      },
      actions: [
        { type: "reset-queue-state" },
        { type: "increment-attempt", messageId: "order-482" },
        { type: "set-queue-node-state", nodeId: "processor", state: "error" },
        { type: "set-queue-path-state", pathId: "worker-processor", state: "transmitting" },
        { type: "move-message", messageId: "order-482", locationId: "processor", status: "failed" },
      ],
    }),
    step({
      id: "dlq-route",
      title: "A mensagem desvia para a DLQ",
      caption: "O job abandona o fluxo principal e passa a aguardar inspeção.",
      focusNodeId: "dlq",
      concept: {
        title: "DLQ é estacionamento explícito para falha final",
        bubble: "A mensagem sai do caminho feliz e entra numa fila lateral para análise humana ou reprocessamento controlado.",
        summary: "A DLQ não representa sucesso nem desaparecimento. Ela é uma trilha de observabilidade e contenção para mensagens que já não deveriam continuar na fila principal.",
        longform: [
          "Esse desvio lateral é a parte central do conceito. Sem ele, a mensagem ficaria girando para sempre no retry ou sumiria silenciosamente.",
          "Ao estacionar em DLQ, o sistema preserva o contexto do erro e permite triagem posterior sem contaminar o fluxo saudável.",
        ],
        details: [
          "O caminho para DLQ surge como uma ramificação própria.",
          "A mensagem muda para status dead-lettered.",
          "Ela continua presente no canvas porque agora aguarda inspeção ou reprocessamento.",
        ],
        payloadTitle: "Estado final da mensagem",
        payloadLines: [
          "Pedido #482",
          "attempt: 3/3",
          "status: dead-lettered",
        ],
      },
      actions: [
        { type: "reset-queue-state" },
        { type: "set-queue-node-state", nodeId: "dlq", state: "active" },
        { type: "set-queue-path-state", pathId: "processor-dlq", state: "error" },
        { type: "route-to-dlq", messageId: "order-482", dlqId: "dlq" },
      ],
    }),
  ],
};
