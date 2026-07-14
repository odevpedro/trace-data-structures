import type {
  LessonDefinition,
  Representation,
  SceneNodeDefinition,
  TraceDefinition,
  TraceEvent,
  TraceMetrics,
  TraceStep,
} from "../core/trace-engine/types";
import type { FlowSceneDefinition } from "../core/flow-scene/types";
import { clientServerFlowScene, createCacheFlowScene } from "./backendFlowScenes";
import { dlqFlowScene } from "./specializedFlowScenes";

const backendRepresentations: Representation[] = ["abstract", "practical", "code"];

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
  concept?: TraceStep["concept"],
): TraceStep {
  return {
    id,
    eventLabel,
    events,
    captions: {
      abstract,
      practical,
      code: abstract,
    },
    description,
    metrics: stepMetrics,
    codeLine,
    concept,
  };
}

const backendRequestTrace: TraceDefinition = {
  id: "backend-request-lifecycle",
  scene: {
    nodes: [
      node("browser", "service", 24, 132, 116, 82, {
        abstract: "Cliente",
        practical: "Navegador",
        code: "client",
      }),
      node("router", "service", 170, 48, 110, 82, {
        abstract: "Router",
        practical: "GET /users",
        code: "router",
      }),
      node("controller", "service", 170, 220, 116, 82, {
        abstract: "Controller",
        practical: "UsersController",
        code: "controller",
      }),
      node("service", "service", 326, 132, 116, 82, {
        abstract: "Service",
        practical: "UsersService",
        code: "service",
      }),
      node("database", "service", 482, 132, 122, 82, {
        abstract: "Database",
        practical: "users",
        code: "database",
      }),
      node("request", "message", 34, 256, 108, 30, {
        abstract: "GET /users",
        practical: "request",
        code: "req",
      }, { visible: false }),
      node("response", "message", 478, 56, 122, 30, {
        abstract: "200 OK",
        practical: "response",
        code: "res",
      }, { visible: false }),
      node("payload", "tag", 316, 54, 134, 28, {
        abstract: "DTO / filtros",
        practical: "payload validado",
        code: "dto",
      }, { visible: false }),
    ],
    edges: [
      { id: "browser-router", from: "browser", to: "router", directed: true },
      { id: "router-controller", from: "router", to: "controller", directed: true },
      { id: "controller-service", from: "controller", to: "service", directed: true },
      { id: "service-database", from: "service", to: "database", directed: true },
    ],
  },
  code: [
    "app.get('/users', auth, async (req, res) => {",
    "  const dto = parseUsersQuery(req.query);",
    "  const users = await usersService.list(dto);",
    "  return res.status(200).json({ items: users });",
    "});",
  ],
  steps: [
    step(
      "backend-request-0",
      "CLIENT_ACTION",
      [{ type: "HIGHLIGHT", targets: ["browser"], emphasis: "active" }],
      "O fluxo começa quando o cliente decide buscar dados.",
      "A pessoa abre a tela de usuários.",
      "Ainda não existe tráfego; existe apenas a intenção de buscar dados.",
      metrics(0, 1, "latência: 0 ms", "Ação ainda local ao cliente."),
      0,
    ),
    step(
      "backend-request-1",
      "BUILD_REQUEST",
      [
        { type: "HIGHLIGHT", targets: ["browser"], emphasis: "active" },
        { type: "INSERT", target: "request", position: { x: 42, y: 256 } },
      ],
      "O cliente transforma a intenção em um request HTTP.",
      "O navegador prepara GET /users com headers.",
      "Agora a ação virou uma mensagem entendível pelo servidor: método, rota e contexto.",
      metrics(1, 1, "latência: 4 ms", "Montagem local do request."),
      0,
    ),
    step(
      "backend-request-2",
      "SEND_REQUEST",
      [{ type: "SEND_REQUEST", from: "browser", to: "router", target: "request" }],
      "O request percorre o caminho até o backend.",
      "GET /users trafega do cliente para a API.",
      "O pacote sai do cliente e aponta claramente para o servidor.",
      metrics(2, 2, "latência: 18 ms", "Rede entre cliente e servidor."),
      0,
    ),
    step(
      "backend-request-3",
      "SERVER_RECEIVE",
      [
        { type: "HIGHLIGHT", targets: ["router"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["controller"], emphasis: "active" },
      ],
      "O backend recebe a rota e entra em processamento.",
      "Router e controller reconhecem a entrada.",
      "Receber não basta; o servidor ainda precisa validar e decidir qual caso de uso executar.",
      metrics(3, 3, "latência: 29 ms", "Match de rota e entrada no controller."),
      1,
    ),
    step(
      "backend-request-4",
      "VALIDATE_DTO",
      [
        { type: "INSERT", target: "payload" },
        { type: "HIGHLIGHT", targets: ["controller", "payload"], emphasis: "active" },
      ],
      "O controller valida e normaliza a entrada.",
      "O backend monta um DTO com filtros coerentes.",
      "O DTO protege o service da entrada crua que veio pela borda HTTP.",
      metrics(4, 3, "latência: 36 ms", "Validação e normalização."),
      1,
      {
        title: "DTO validado",
        bubble: "O balão resume; o painel aprofunda o conceito.",
        body: "DTO é um contrato de transferência já validado.",
        details: [
          "Ele não é o body cru.",
          "Ele não é necessariamente a entidade do banco.",
          "Ele reduz acoplamento entre borda HTTP e regra de negócio.",
        ],
        payloadTitle: "DTO ilustrativo",
        payloadLines: [
          '{ "page": 1, "limit": 20 }',
        ],
        target: "payload",
        placement: "top",
      },
    ),
    step(
      "backend-request-5",
      "DB_QUERY",
      [
        { type: "HIGHLIGHT", targets: ["controller"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["service"], emphasis: "active" },
        { type: "SEND_REQUEST", from: "service", to: "database", target: "request" },
      ],
      "O service pede dados à persistência.",
      "UsersService consulta o banco.",
      "A regra de negócio continua no servidor, mas precisa buscar dados na persistência.",
      metrics(5, 4, "latência: 52 ms", "Service orquestra leitura no banco."),
      2,
    ),
    step(
      "backend-request-6",
      "DB_PROCESS",
      [
        { type: "HIGHLIGHT", targets: ["service"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["database"], emphasis: "active" },
      ],
      "O banco processa a consulta.",
      "A camada de dados localiza os usuários pedidos.",
      "Neste momento o banco trabalha sobre dados, não sobre HTTP.",
      metrics(6, 4, "latência: 72 ms", "Leitura na persistência."),
      2,
    ),
    step(
      "backend-request-7",
      "DB_RESULT",
      [
        { type: "WRITE_MEMORY", address: "users", target: "database", value: "20 itens" },
        { type: "RECEIVE_RESPONSE", from: "database", to: "service", target: "response" },
      ],
      "O banco devolve os dados ao backend.",
      "A aplicação recebe um conjunto de usuários.",
      "Resultado de banco ainda não é response final; ele volta primeiro ao servidor.",
      metrics(7, 5, "latência: 86 ms", "Resultado volta para a camada de serviço."),
      2,
    ),
    step(
      "backend-request-8",
      "BUILD_RESPONSE",
      [
        { type: "HIGHLIGHT", targets: ["service"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["database"], emphasis: "success" },
      ],
      "O servidor monta a response HTTP.",
      "UsersService e controller formatam 200 OK.",
      "O backend transforma dados internos em uma resposta que a interface consegue consumir.",
      metrics(8, 5, "latência: 94 ms", "Transformação do resultado em response HTTP."),
      3,
    ),
    step(
      "backend-request-9",
      "SEND_RESPONSE",
      [
        { type: "RECEIVE_RESPONSE", from: "service", to: "browser", target: "response" },
        { type: "HIGHLIGHT", targets: ["browser"], emphasis: "success" },
      ],
      "A response volta ao cliente e a interface é atualizada.",
      "O navegador recebe 200 OK e renderiza a lista.",
      "O fluxo se fecha com sucesso: cliente, servidor e banco participaram em ordem causal.",
      metrics(9, 5, "latência: 108 ms", "Cliente recebe e apresenta o resultado."),
      3,
    ),
  ],
};

const backendAuthTrace: TraceDefinition = {
  id: "backend-auth-authorization",
  scene: {
    nodes: [
      node("client", "service", 28, 132, 118, 82, {
        abstract: "Cliente",
        practical: "Painel admin",
        code: "client",
      }),
      node("middleware", "service", 178, 132, 122, 82, {
        abstract: "Auth middleware",
        practical: "verificar token",
        code: "auth",
      }),
      node("session", "service", 336, 46, 118, 82, {
        abstract: "Identity",
        practical: "JWT / sessão",
        code: "identity",
      }),
      node("policy", "service", 336, 220, 118, 82, {
        abstract: "Policy",
        practical: "role: admin",
        code: "policy",
      }),
      node("handler", "service", 486, 132, 120, 82, {
        abstract: "Protected handler",
        practical: "DELETE /users/7",
        code: "handler",
      }),
      node("token", "message", 42, 258, 88, 30, {
        abstract: "Bearer ...",
        practical: "token",
        code: "jwt",
      }, { visible: false }),
      node("denied", "message", 492, 58, 92, 30, {
        abstract: "403",
        practical: "negado",
        code: "403",
      }, { visible: false }),
      node("allowed", "message", 492, 258, 92, 30, {
        abstract: "200",
        practical: "permitido",
        code: "200",
      }, { visible: false }),
    ],
    edges: [
      { id: "client-middleware", from: "client", to: "middleware", directed: true },
      { id: "middleware-session", from: "middleware", to: "session", directed: true },
      { id: "middleware-policy", from: "middleware", to: "policy", directed: true },
      { id: "policy-handler", from: "policy", to: "handler", directed: true },
    ],
  },
  code: [
    "app.delete('/users/:id', auth, authorize('admin'), async (req, res) => {",
    "  await usersService.remove(req.params.id);",
    "  return res.sendStatus(200);",
    "});",
  ],
  steps: [
    step(
      "auth-start",
      "START",
      [{ type: "HIGHLIGHT", targets: ["client"], emphasis: "active" }],
      "Autenticação e autorização ficam entre o cliente e o handler.",
      "O painel admin tenta apagar um usuário.",
      "Backend não executa ação sensível só porque a rota existe; primeiro ele identifica e autoriza.",
      metrics(0, 1, "latência: 0 ms", "Requisição ainda não autenticada."),
      0,
    ),
    step(
      "auth-token",
      "SEND_REQUEST",
      [{ type: "SEND_REQUEST", from: "client", to: "middleware", target: "token" }],
      "Middleware recebe o token e extrai a identidade.",
      "O token Bearer chega ao auth middleware.",
      "Autenticação responde quem é a pessoa; ainda falta responder o que ela pode fazer.",
      metrics(1, 2, "latência: 16 ms", "Leitura de header e parsing do token."),
      0,
    ),
    step(
      "auth-identity",
      "AUTHN",
      [
        { type: "HIGHLIGHT", targets: ["middleware"], emphasis: "visited" },
        { type: "HIGHLIGHT", targets: ["session"], emphasis: "active" },
        { type: "HIGHLIGHT", targets: ["policy"], emphasis: "active" },
      ],
      "AuthN identifica o usuário; AuthZ consulta a policy.",
      "Middleware lê o token e checa a role admin.",
      "Autenticação e autorização são etapas diferentes e complementares no backend.",
      metrics(3, 3, "latência: 27 ms", "Validação da identidade e da permissão."),
      0,
    ),
    step(
      "auth-decision",
      "BRANCH",
      [
        { type: "BRANCH", condition: "role === 'admin'", result: true, target: "policy", trueTarget: "handler", falseTarget: "denied" },
        { type: "INSERT", target: "allowed" },
        { type: "HIGHLIGHT", targets: ["handler"], emphasis: "success" },
      ],
      "A policy autoriza a rota protegida.",
      "Como a role é admin, o handler pode executar.",
      "Se a policy falhasse, o backend devolveria 401/403 sem tocar no handler.",
      metrics(4, 4, "latência: 33 ms", "Branch de autorização antes da ação protegida."),
      1,
    ),
    step(
      "auth-done",
      "DONE",
      [
        { type: "HIGHLIGHT", targets: ["handler"], emphasis: "visited" },
        { type: "RECEIVE_RESPONSE", from: "handler", to: "client", target: "allowed" },
      ],
      "A ação protegida conclui e responde 200.",
      "O cliente recebe sucesso depois da autorização.",
      "Esse trace cobre um bloco central do roadmap backend: auth, middleware e handler protegido.",
      metrics(5, 5, "latência: 45 ms", "Execução autorizada da operação."),
      2,
    ),
  ],
};

const backendAsyncScene = {
  nodes: [
    node("client", "service", 24, 132, 116, 82, {
      abstract: "Cliente",
      practical: "Checkout",
      code: "client",
    }),
    node("api", "service", 160, 132, 116, 82, {
      abstract: "API",
      practical: "POST /orders",
      code: "api",
    }),
    node("queue", "service", 298, 36, 124, 82, {
      abstract: "Queue",
      practical: "orders.created",
      code: "queue",
    }),
    node("worker", "service", 298, 228, 124, 82, {
      abstract: "Worker",
      practical: "process-order",
      code: "worker",
    }),
    node("database", "service", 458, 36, 126, 82, {
      abstract: "Database",
      practical: "orders",
      code: "db",
    }),
    node("email", "service", 458, 228, 126, 82, {
      abstract: "Email API",
      practical: "send receipt",
      code: "email",
    }),
    node("dlq", "service", 458, 132, 126, 82, {
      abstract: "DLQ",
      practical: "falhas finais",
      code: "dlq",
    }),
    node("request", "message", 36, 256, 92, 30, {
      abstract: "POST",
      practical: "pedido #84",
      code: "req",
    }, { visible: false }),
    node("accepted", "message", 162, 54, 92, 30, {
      abstract: "202 Accepted",
      practical: "recebido",
      code: "202",
    }, { visible: false }),
    node("job", "message", 310, 144, 90, 30, {
      abstract: "job",
      practical: "order#84",
      code: "job",
    }, { visible: false }),
    node("key", "tag", 150, 36, 120, 28, {
      abstract: "idempotency key",
      practical: "checkout-84",
      code: "key",
    }, { visible: false }),
  ],
  edges: [
    { id: "client-api", from: "client", to: "api", directed: true },
    { id: "api-queue", from: "api", to: "queue", directed: true },
    { id: "queue-worker", from: "queue", to: "worker", directed: true },
    { id: "worker-db", from: "worker", to: "database", directed: true },
    { id: "worker-email", from: "worker", to: "email", directed: true },
    { id: "worker-dlq", from: "worker", to: "dlq", directed: true, visible: false },
  ],
} satisfies TraceDefinition["scene"];

const backendAsyncCode = [
  "POST /orders -> validate + enqueue",
  "return 202 Accepted",
  "worker.consume(orderCreated)",
  "if (alreadyProcessed(key)) skip duplicate",
  "retry(sendReceipt)",
  "if (maxRetries) moveToDlq(job)",
];

function createBackendAsyncTrace(scenario: number): TraceDefinition {
  const normalizedScenario = scenario === 2 || scenario === 3 ? scenario : 1;

  if (normalizedScenario === 2) {
    return {
      id: "backend-async-duplicate-request",
      scene: backendAsyncScene,
      code: backendAsyncCode,
      steps: [
        step(
          "async-duplicate-start",
          "START",
          [{ type: "HIGHLIGHT", targets: ["client", "api"], emphasis: "active" }],
          "Mesmo em fluxo assíncrono, o cliente pode reenviar o mesmo pedido.",
          "O checkout dispara um pedido que pode ser repetido por refresh ou retry do cliente.",
          "O backend precisa aceitar rápido sem correr o risco de criar dois trabalhos equivalentes.",
          metrics(0, 2, "latência: 0 ms", "Nenhum trabalho foi enfileirado ainda."),
          0,
        ),
        step(
          "async-duplicate-accept",
          "ENQUEUE",
          [
            { type: "INSERT", target: "key" },
            { type: "SEND_REQUEST", from: "client", to: "api", target: "request" },
            { type: "PUBLISH_EVENT", channel: "orders.created", target: "queue" },
            { type: "INSERT", target: "job" },
            { type: "RECEIVE_RESPONSE", from: "api", to: "client", target: "accepted" },
          ],
          "A primeira requisição registra a key e publica um único job.",
          "A API aceita o pedido original e responde 202.",
          "A idempotency key é gravada antes de publicar o trabalho.",
          metrics(3, 4, "latência: 22 ms", "Validação, deduplicação e enqueue."),
          1,
        ),
        step(
          "async-duplicate-repeat",
          "DUPLICATE_REQUEST",
          [
            { type: "SEND_REQUEST", from: "client", to: "api", target: "request" },
            { type: "HIGHLIGHT", targets: ["key", "api"], emphasis: "active" },
          ],
          "O mesmo pedido chega de novo com a mesma key.",
          "Um refresh ou reenvio repete o POST do checkout.",
          "Sem idempotência, esse segundo request poderia criar outro job e outro pedido.",
          metrics(4, 4, "latência: 31 ms", "Segunda chegada com a mesma identidade lógica."),
          3,
        ),
        step(
          "async-duplicate-block",
          "SKIP_DUPLICATE",
          [
            { type: "HIGHLIGHT", targets: ["key"], emphasis: "success" },
            { type: "HIGHLIGHT", targets: ["queue", "job"], emphasis: "muted" },
          ],
          "A API reconhece a key e não publica um segundo job.",
          "O backend devolve o mesmo aceite sem duplicar processamento.",
          "Idempotência protege o sistema exatamente onde a duplicação aconteceria: antes do enqueue.",
          metrics(4, 5, "dedupe", "Nenhum segundo job foi criado."),
          3,
        ),
        step(
          "async-duplicate-consume",
          "CONSUME",
          [
            { type: "CONSUME_EVENT", channel: "orders.created", target: "worker" },
            { type: "HIGHLIGHT", targets: ["job", "worker"], emphasis: "active" },
            { type: "WRITE_MEMORY", address: "orders", target: "database", value: "#84" },
          ],
          "Só o job original é consumido e persistido.",
          "process-order grava #84 uma única vez.",
          "A fila continua com um único trabalho porque a deduplicação aconteceu antes.",
          metrics(6, 4, "throughput: assíncrono", "Um job consumido, nenhuma duplicação."),
          2,
        ),
        step(
          "async-duplicate-done",
          "DONE",
          [
            { type: "RECOVER_NODE", target: "email" },
            { type: "HIGHLIGHT", targets: ["database", "email", "key"], emphasis: "success" },
          ],
          "O fluxo termina com um pedido e um recibo, não com dois.",
          "A mesma key garante que refresh do cliente não duplica trabalho nem cobrança.",
          "Esse é o valor central da idempotência em backends assíncronos: repetir request sem repetir efeito.",
          metrics(7, 5, "idempotência", "Processamento único apesar do request duplicado."),
          4,
        ),
      ],
    };
  }

  if (normalizedScenario === 3) {
    return {
      id: "backend-async-dlq-terminal",
      scene: backendAsyncScene,
      code: backendAsyncCode,
      steps: [
        step(
          "async-dlq-start",
          "START",
          [{ type: "HIGHLIGHT", targets: ["client", "api"], emphasis: "active" }],
          "Fluxo assíncrono ainda precisa de rota explícita para falha permanente.",
          "Checkout envia o pedido sem esperar toda a integração externa.",
          "Quando o trabalho não conclui após retries, o backend não pode simplesmente perder o job.",
          metrics(0, 2, "latência: 0 ms", "Nenhum trabalho foi enfileirado ainda."),
          0,
        ),
        step(
          "async-dlq-accept",
          "ENQUEUE",
          [
            { type: "INSERT", target: "key" },
            { type: "SEND_REQUEST", from: "client", to: "api", target: "request" },
            { type: "PUBLISH_EVENT", channel: "orders.created", target: "queue" },
            { type: "INSERT", target: "job" },
            { type: "RECEIVE_RESPONSE", from: "api", to: "client", target: "accepted" },
          ],
          "API aceita rápido, salva a key e enfileira o trabalho.",
          "O cliente recebe 202 antes do recibo existir.",
          "A confirmação imediata continua desacoplada do processamento mais demorado.",
          metrics(3, 4, "latência: 22 ms", "Validação, deduplicação e enqueue."),
          1,
        ),
        step(
          "async-dlq-consume",
          "CONSUME",
          [
            { type: "CONSUME_EVENT", channel: "orders.created", target: "worker" },
            { type: "HIGHLIGHT", targets: ["job", "worker"], emphasis: "active" },
            { type: "WRITE_MEMORY", address: "orders", target: "database", value: "#84" },
          ],
          "Worker consome o job e persiste o pedido.",
          "A compra fica salva mesmo que a integração externa falhe depois.",
          "Persistir o núcleo do trabalho antes do efeito colateral externo reduz perda de dados.",
          metrics(5, 4, "throughput: assíncrono", "Consumo em background do job."),
          2,
        ),
        step(
          "async-dlq-retry",
          "RETRY",
          [
            { type: "FAIL_NODE", target: "email" },
            { type: "RETRY", target: "worker" },
            { type: "HIGHLIGHT", targets: ["email"], emphasis: "warning" },
          ],
          "O recibo falha e o worker tenta de novo.",
          "A Email API continua indisponível após a primeira tentativa.",
          "Retry protege contra falhas transitórias, mas não resolve falhas permanentes.",
          metrics(6, 5, "retry #1", "Primeira falha do serviço externo."),
          4,
        ),
        step(
          "async-dlq-park",
          "MOVE_TO_DLQ",
          [
            { type: "LINK", from: "worker", to: "dlq", edgeId: "worker-dlq" },
            { type: "FAIL_NODE", target: "email" },
            { type: "HIGHLIGHT", targets: ["dlq"], emphasis: "warning" },
          ],
          "Os retries se esgotam e o job vai para a DLQ.",
          "A aplicação estaciona a falha em uma fila separada para inspeção.",
          "DLQ existe para tornar a falha visível, auditável e reprocessável depois.",
          metrics(7, 6, "falha permanente", "Job removido do fluxo principal e estacionado."),
          5,
        ),
        step(
          "async-dlq-done",
          "DONE_WITH_DLQ",
          [
            { type: "HIGHLIGHT", targets: ["database"], emphasis: "success" },
            { type: "HIGHLIGHT", targets: ["dlq", "email"], emphasis: "warning" },
            { type: "HIGHLIGHT", targets: ["worker"], emphasis: "visited" },
          ],
          "O pedido foi salvo, mas o job de notificação terminou na DLQ.",
          "Esse fluxo termina com consistência parcial: compra persistida, recibo pendente.",
          "System design assíncrono precisa deixar claro o que concluiu, o que falhou e onde retomar.",
          metrics(7, 6, "DLQ", "Pedido salvo; falha externa aguardando tratamento."),
          5,
        ),
      ],
    };
  }

  return {
    id: "backend-async-orders",
    scene: backendAsyncScene,
    code: backendAsyncCode,
    steps: [
      step(
        "async-start",
        "START",
        [{ type: "HIGHLIGHT", targets: ["client", "api"], emphasis: "active" }],
        "Fluxo assíncrono separa aceitação da conclusão do trabalho.",
        "Checkout envia o pedido sem esperar o processamento inteiro.",
        "Aqui o backend prioriza throughput e resiliência, não resposta final imediata.",
        metrics(0, 2, "latência: 0 ms", "Nenhum trabalho foi enfileirado ainda."),
        0,
      ),
      step(
        "async-accept",
        "ENQUEUE",
        [
          { type: "INSERT", target: "key" },
          { type: "SEND_REQUEST", from: "client", to: "api", target: "request" },
          { type: "PUBLISH_EVENT", channel: "orders.created", target: "queue" },
          { type: "INSERT", target: "job" },
          { type: "RECEIVE_RESPONSE", from: "api", to: "client", target: "accepted" },
        ],
        "API valida, registra a idempotency key e enfileira o job.",
        "O cliente recebe 202 Accepted assim que o trabalho é aceito.",
        "Idempotência impede pedido duplicado; a fila desacopla a resposta do processamento pesado.",
        metrics(3, 4, "latência: 22 ms", "Validação, deduplicação e enqueue."),
        1,
      ),
      step(
        "async-consume",
        "CONSUME",
        [
          { type: "CONSUME_EVENT", channel: "orders.created", target: "worker" },
          { type: "HIGHLIGHT", targets: ["job", "worker"], emphasis: "active" },
          { type: "WRITE_MEMORY", address: "orders", target: "database", value: "#84" },
        ],
        "Worker consome o evento e persiste o pedido.",
        "process-order grava #84 sem bloquear o cliente.",
        "A aplicação já respondeu 202, mas o trabalho real continua no worker.",
        metrics(5, 4, "throughput: assíncrono", "Consumo em background do job."),
        2,
      ),
      step(
        "async-retry",
        "RETRY",
        [
          { type: "FAIL_NODE", target: "email" },
          { type: "RETRY", target: "worker" },
          { type: "HIGHLIGHT", targets: ["email"], emphasis: "warning" },
        ],
        "O envio do recibo falha; o worker agenda retry.",
        "Email API falha na primeira tentativa.",
        "Retry é do worker, não do cliente. O pedido continua persistido e seguro.",
        metrics(6, 5, "retry #1", "Falha transitória no serviço externo."),
        4,
      ),
      step(
        "async-dlq",
        "DLQ_READY",
        [
          { type: "LINK", from: "worker", to: "dlq", edgeId: "worker-dlq" },
          { type: "HIGHLIGHT", targets: ["worker-dlq", "dlq"], emphasis: "muted" },
        ],
        "A rota para a DLQ existe, mas ainda não foi usada.",
        "Se os retries esgotarem, o job sai do fluxo principal e vai para a DLQ.",
        "DLQ precisa ficar visível na arquitetura mesmo quando o cenário feliz termina sem usá-la.",
        metrics(6, 6, "fallback", "Rota de segurança para falha permanente."),
        5,
      ),
      step(
        "async-done",
        "DONE",
        [
          { type: "RECOVER_NODE", target: "email" },
          { type: "HIGHLIGHT", targets: ["database", "email", "worker"], emphasis: "success" },
          { type: "HIGHLIGHT", targets: ["dlq"], emphasis: "muted" },
        ],
        "Retry funciona; pedido persiste e recibo é enviado.",
        "O fluxo termina sem duplicar o pedido graças à idempotency key.",
        "A DLQ continua como rota de fallback, mas não foi necessária neste cenário.",
        metrics(7, 5, "retry + idempotência", "Processamento assíncrono concluído."),
        5,
      ),
    ],
  };
}

const backendAsyncTrace = createBackendAsyncTrace(1);

function createBackendCacheTrace(mode: number): TraceDefinition {
  if (mode === 1) {
    return {
      id: "backend-cache-hit",
      scene: backendRequestTrace.scene,
      code: [
        "const cached = await cache.get('users:42');",
        "if (cached) return res.status(200).json(cached);",
        "const user = await usersRepository.findById(42);",
        "await cache.set('users:42', user);",
        "return res.status(200).json(user);",
      ],
      steps: [
        step("cache-hit-0", "START", [{ type: "HIGHLIGHT", targets: ["browser"], emphasis: "active" }], "Cliente pede um usuário.", "A tela solicita o perfil.", "O fluxo pode terminar no cache ou seguir ao banco.", metrics(0, 1, "latência: 0 ms", "Ação inicial no cliente."), 0),
        step("cache-hit-1", "REQUEST", [{ type: "SEND_REQUEST", from: "browser", to: "router", target: "request" }], "O request chega ao servidor.", "GET /users/42 entra na API.", "O servidor agora decide sua estratégia de leitura.", metrics(1, 2, "latência: 16 ms", "Request HTTP padrão."), 0),
        step("cache-hit-2", "CACHE_LOOKUP", [{ type: "HIGHLIGHT", targets: ["service"], emphasis: "active" }], "O servidor consulta o cache.", "A aplicação procura users:42.", "Cache é um atalho antes do banco.", metrics(2, 3, "latência: 24 ms", "Lookup rápido em cache."), 0),
        step("cache-hit-3", "CACHE_HIT", [{ type: "HIGHLIGHT", targets: ["service"], emphasis: "success" }], "O cache encontra o valor.", "O backend já tem o usuário em memória rápida.", "Como houve hit, o banco não entra no caminho.", metrics(3, 3, "latência: 28 ms", "Leitura servida pelo cache."), 1),
        step("cache-hit-4", "RESPONSE", [{ type: "RECEIVE_RESPONSE", from: "service", to: "browser", target: "response" }], "O servidor responde ao cliente.", "200 OK volta sem tocar o banco.", "O contrato HTTP é o mesmo; só o caminho interno ficou menor.", metrics(4, 4, "latência: 34 ms", "Response curta por cache hit."), 1),
        step("cache-hit-5", "DONE", [{ type: "HIGHLIGHT", targets: ["browser"], emphasis: "success" }], "O cliente atualiza a interface.", "O perfil é renderizado rapidamente.", "Cache hit termina cedo e poupa a persistência.", metrics(4, 4, "latência: 34 ms", "Fim do fluxo com hit."), 1),
      ],
    };
  }

  return {
    id: "backend-cache-miss",
    scene: backendRequestTrace.scene,
    code: [
      "const cached = await cache.get('users:42');",
      "if (cached) return res.status(200).json(cached);",
      "const user = await usersRepository.findById(42);",
      "await cache.set('users:42', user);",
      "return res.status(200).json(user);",
    ],
    steps: [
      step("cache-miss-0", "START", [{ type: "HIGHLIGHT", targets: ["browser"], emphasis: "active" }], "Cliente pede um usuário.", "A tela solicita o perfil.", "O fluxo começa igual ao hit.", metrics(0, 1, "latência: 0 ms", "Ação inicial no cliente."), 0),
      step("cache-miss-1", "REQUEST", [{ type: "SEND_REQUEST", from: "browser", to: "router", target: "request" }], "O request chega ao servidor.", "GET /users/42 entra na API.", "O servidor vai tentar o cache primeiro.", metrics(1, 2, "latência: 16 ms", "Request HTTP padrão."), 0),
      step("cache-miss-2", "CACHE_LOOKUP", [{ type: "HIGHLIGHT", targets: ["service"], emphasis: "active" }], "O servidor consulta o cache.", "A aplicação procura users:42.", "O lookup existe mesmo quando o valor não está lá.", metrics(2, 3, "latência: 24 ms", "Lookup em cache."), 0),
      step("cache-miss-3", "CACHE_MISS", [{ type: "HIGHLIGHT", targets: ["service"], emphasis: "warning" }], "O cache não encontra o valor.", "A chave não estava pronta.", "Miss não é erro fatal; ele só força o backend a seguir até o banco.", metrics(3, 3, "latência: 28 ms", "Miss e decisão de fallback."), 1),
      step("cache-miss-4", "DB_QUERY", [{ type: "SEND_REQUEST", from: "service", to: "database", target: "request" }], "O servidor consulta o banco.", "A fonte de verdade entra no fluxo.", "O banco participa só porque o cache não resolveu.", metrics(4, 4, "latência: 52 ms", "Fallback para o banco."), 2),
      step("cache-miss-5", "DB_RESULT", [{ type: "RECEIVE_RESPONSE", from: "database", to: "service", target: "response" }], "O banco devolve o usuário.", "O resultado volta ao backend.", "Agora o servidor pode responder e repopular o cache.", metrics(5, 5, "latência: 78 ms", "Resultado vindo do banco."), 2),
      step("cache-miss-6", "CACHE_SET", [{ type: "HIGHLIGHT", targets: ["service"], emphasis: "active" }], "O backend atualiza o cache.", "A chave users:42 é gravada.", "Esse passo prepara a chance de hit no próximo acesso.", metrics(6, 5, "latência: 88 ms", "Atualização do cache."), 3),
      step("cache-miss-7", "RESPONSE", [{ type: "RECEIVE_RESPONSE", from: "service", to: "browser", target: "response" }], "O servidor responde ao cliente.", "200 OK volta depois do banco.", "O contrato com o cliente continua o mesmo apesar do caminho mais longo.", metrics(7, 5, "latência: 98 ms", "Response depois do miss."), 4),
      step("cache-miss-8", "DONE", [{ type: "HIGHLIGHT", targets: ["browser"], emphasis: "success" }], "A interface é atualizada.", "O usuário vê o resultado normalmente.", "O fluxo terminou mais tarde, mas deixou o cache preparado para o próximo request.", metrics(7, 5, "latência: 98 ms", "Fim do fluxo com miss."), 4),
    ],
  };
}

function createRequestFocusedLesson(config: {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  explanation: LessonDefinition["explanation"];
  challenge: LessonDefinition["challenge"];
}): LessonDefinition {
  return {
    id: config.id,
    title: config.title,
    shortTitle: config.shortTitle,
    module: "system-design",
    icon: config.icon,
    difficulty: "foundation",
    prerequisites: config.prerequisites,
    objectives: config.objectives,
    description: config.description,
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "O trace abstrai framework e linguagem, mas preserva a ordem causal típica de um backend HTTP.",
    },
    representations: backendRepresentations,
    explanation: config.explanation,
    challenge: config.challenge,
    trace: backendRequestTrace,
  };
}

function createAuthFocusedLesson(config: {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  explanation: LessonDefinition["explanation"];
  challenge: LessonDefinition["challenge"];
}): LessonDefinition {
  return {
    id: config.id,
    title: config.title,
    shortTitle: config.shortTitle,
    module: "system-design",
    icon: config.icon,
    difficulty: "foundation",
    prerequisites: config.prerequisites,
    objectives: config.objectives,
    description: config.description,
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "JWT, sessão, cookie assinado ou OAuth mudam a implementação, mas o fluxo de autenticar e autorizar permanece.",
    },
    representations: backendRepresentations,
    explanation: config.explanation,
    challenge: config.challenge,
    trace: backendAuthTrace,
  };
}

function createAsyncFocusedLesson(config: {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  difficulty?: LessonDefinition["difficulty"];
  explanation: LessonDefinition["explanation"];
  challenge: LessonDefinition["challenge"];
  scenario: number;
  flowScene?: FlowSceneDefinition;
}): LessonDefinition {
  return {
    id: config.id,
    title: config.title,
    shortTitle: config.shortTitle,
    module: "system-design",
    icon: config.icon,
    difficulty: config.difficulty ?? "intermediate",
    prerequisites: config.prerequisites,
    objectives: config.objectives,
    description: config.description,
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "Pedidos, pagamentos, e-mails e webhooks costumam usar fila, worker e reprocessamento com variações de infraestrutura.",
    },
    representations: backendRepresentations,
    explanation: config.explanation,
    challenge: config.challenge,
    trace: createBackendAsyncTrace(config.scenario),
    flowScene: config.flowScene,
  };
}

export const backendLessons: LessonDefinition[] = [
  createRequestFocusedLesson({
    id: "backend-router",
    title: "Backend: roteamento HTTP",
    shortTitle: "Backend router",
    icon: "⇢",
    description: "Entenda como método e caminho encontram o handler certo antes de qualquer regra de negócio.",
    objectives: [
      "Ler o papel do router no backend",
      "Distinguir rota de controller",
      "Entender o primeiro salto do request",
    ],
    prerequisites: ["request-flow"],
    explanation: {
      problem: "Direcionar cada request para o ponto certo do sistema sem misturar regra de negócio na borda.",
      model: "O router faz o match entre verbo + caminho e a entrada responsável pelo fluxo.",
      cost: "O custo costuma ser pequeno, mas erro aqui quebra todo o fluxo antes de chegar ao domínio.",
      whenToUse: "Qualquer API HTTP ou RPC com múltiplas entradas.",
      alternative: "Sem um roteamento claro, a aplicação tende a espalhar condicionais e acoplamento na borda.",
    },
    challenge: {
      question: "Qual componente decide que POST /orders deve cair neste fluxo?",
      hint: "É a primeira peça depois do cliente.",
      choices: [
        { id: "router", label: "Router", correct: true },
        { id: "service", label: "Service", correct: false },
        { id: "database", label: "Database", correct: false },
      ],
      success: "Correto: o router faz o match da rota antes de controller, service e banco.",
    },
  }),
  createRequestFocusedLesson({
    id: "backend-validation",
    title: "Backend: validação e DTO",
    shortTitle: "Backend validation",
    icon: "✓",
    description: "Veja o controller validar entrada e transformar payload em um formato seguro para o domínio.",
    objectives: [
      "Entender por que o backend valida a entrada",
      "Separar body bruto de DTO confiável",
      "Evitar regra pesada no controller",
    ],
    prerequisites: ["backend-router"],
    explanation: {
      problem: "Entrada externa chega crua e precisa ser normalizada antes de tocar a regra do sistema.",
      model: "Controller valida, rejeita o que está inválido e entrega um DTO consistente ao service.",
      cost: "A validação adiciona trabalho por request, mas evita estados inválidos e bugs mais caros depois.",
      whenToUse: "Toda entrada externa que cruza a fronteira do backend.",
      alternative: "Pular validação deixa o domínio assumir sujeira vinda do cliente e aumenta fragilidade.",
    },
    challenge: {
      question: "Por que o controller cria um DTO antes de chamar o service?",
      hint: "Pense em proteger a camada de domínio da entrada crua.",
      choices: [
        { id: "dto", label: "Para entregar dados validados e consistentes", correct: true },
        { id: "latency", label: "Para reduzir a latência de rede", correct: false },
        { id: "storage", label: "Para gravar direto no banco", correct: false },
      ],
      success: "Correto: o DTO encapsula a entrada validada antes da regra de negócio.",
    },
  }),
  createRequestFocusedLesson({
    id: "backend-service-layer",
    title: "Backend: service layer e regra de negócio",
    shortTitle: "Backend service",
    icon: "⚙",
    description: "Acompanhe o ponto em que o backend deixa a borda HTTP e entra na regra do domínio.",
    objectives: [
      "Separar camada de serviço da camada HTTP",
      "Entender onde a regra de negócio deve morar",
      "Ler a transição entre coordenação e domínio",
    ],
    prerequisites: ["backend-validation"],
    explanation: {
      problem: "A aplicação precisa aplicar regra real sem transformar a borda HTTP em uma função gigante.",
      model: "Service recebe um contrato limpo e concentra a lógica principal do caso de uso.",
      cost: "Mais uma camada aumenta disciplina estrutural, mas melhora clareza, teste e reuso.",
      whenToUse: "Casos de uso com regra própria e orquestração entre persistência e serviços externos.",
      alternative: "Colocar tudo no controller deixa a borda acoplada ao domínio e dificulta manutenção.",
    },
    challenge: {
      question: "Qual camada concentra a regra principal do pedido neste trace?",
      hint: "É a camada entre controller e banco.",
      choices: [
        { id: "service", label: "Service", correct: true },
        { id: "controller", label: "Controller", correct: false },
        { id: "router", label: "Router", correct: false },
      ],
      success: "Correto: a service layer é onde o caso de uso realmente acontece.",
    },
  }),
  createAuthFocusedLesson({
    id: "backend-authentication",
    title: "Backend: autenticação",
    shortTitle: "Backend authn",
    icon: "🪪",
    description: "Veja o middleware identificar quem está fazendo a requisição antes de liberar qualquer ação.",
    objectives: [
      "Diferenciar identidade de permissão",
      "Ler o papel do auth middleware",
      "Entender de onde vem a identidade do request",
    ],
    prerequisites: ["backend-service-layer"],
    explanation: {
      problem: "Antes de executar uma ação, o backend precisa saber quem está chamando.",
      model: "Middleware lê token ou sessão, extrai a identidade e anexa isso ao request.",
      cost: "Há custo pequeno por request, mas ele é obrigatório para segurança e rastreabilidade.",
      whenToUse: "Rotas privadas e qualquer operação dependente de contexto de usuário.",
      alternative: "Sem autenticação centralizada, cada handler repete parsing de token e aumenta risco.",
    },
    challenge: {
      question: "O que a autenticação responde neste fluxo?",
      hint: "Não é 'pode fazer', é outra pergunta.",
      choices: [
        { id: "who", label: "Quem está fazendo a requisição", correct: true },
        { id: "can", label: "Se pode executar a ação", correct: false },
        { id: "where", label: "Onde o dado será salvo", correct: false },
      ],
      success: "Correto: autenticação responde quem é a identidade que chegou ao backend.",
    },
  }),
  createAuthFocusedLesson({
    id: "backend-authorization",
    title: "Backend: autorização e policy",
    shortTitle: "Backend authz",
    icon: "🛡",
    description: "Depois de autenticar, veja a policy decidir se aquela identidade pode executar a ação.",
    objectives: [
      "Separar autenticação de autorização",
      "Entender role, policy e permissão",
      "Visualizar o bloqueio antes do handler",
    ],
    prerequisites: ["backend-authentication"],
    explanation: {
      problem: "Saber quem é o usuário não basta; o backend precisa decidir se ele pode agir.",
      model: "A policy usa identidade e regra de acesso para liberar ou bloquear o handler.",
      cost: "A checagem é barata perto do risco de executar uma operação sensível sem permissão.",
      whenToUse: "Rotas administrativas, recursos por ownership e qualquer ação com regra de acesso.",
      alternative: "Colar checks espalhados nos handlers multiplica divergência e vulnerabilidade.",
    },
    challenge: {
      question: "O que a policy responde que a autenticação não respondeu?",
      hint: "Pense na decisão logo antes do handler protegido.",
      choices: [
        { id: "can", label: "Se a identidade pode executar a ação", correct: true },
        { id: "who", label: "Quem é a identidade", correct: false },
        { id: "token", label: "Se o token existe", correct: false },
      ],
      success: "Correto: autorização decide se aquela identidade autenticada pode seguir.",
    },
  }),
  createAsyncFocusedLesson({
    id: "backend-queue",
    title: "Backend: fila",
    shortTitle: "Backend queue",
    icon: "≋",
    description: "Entenda por que o backend enfileira trabalho antes de processar tarefas mais lentas.",
    objectives: [
      "Ler o enqueue como desacoplamento",
      "Entender o 202 Accepted",
      "Ver a fila como fronteira entre request e background",
    ],
    prerequisites: ["backend-service-layer"],
    explanation: {
      problem: "Alguns trabalhos são lentos demais para prender o cliente no request-response.",
      model: "A API valida e publica um job; a fila separa aceitação de execução.",
      cost: "Ganha throughput, mas exige observabilidade e consistência eventual.",
      whenToUse: "Integrações lentas, processamento pesado e tarefas que podem continuar depois do request.",
      alternative: "Fluxo síncrono é mais simples, mas herda a latência do serviço mais lento.",
    },
    challenge: {
      question: "O que a fila compra para o cliente neste fluxo?",
      hint: "Compare a resposta 202 com esperar o job inteiro.",
      choices: [
        { id: "decouple", label: "Aceitar rápido e processar depois", correct: true },
        { id: "sort", label: "Ordenar jobs alfabeticamente", correct: false },
        { id: "encrypt", label: "Criptografar automaticamente o pedido", correct: false },
      ],
      success: "Correto: a fila desacopla resposta rápida do trabalho pesado em background.",
    },
    scenario: 1,
  }),
  createAsyncFocusedLesson({
    id: "backend-worker",
    title: "Backend: worker",
    shortTitle: "Backend worker",
    icon: "👷",
    description: "Veja o worker consumir o job e continuar o trabalho que já saiu do request principal.",
    objectives: [
      "Entender o papel do worker",
      "Separar API de processamento em background",
      "Ler a continuidade do fluxo após o 202",
    ],
    prerequisites: ["backend-queue"],
    explanation: {
      problem: "Depois do enqueue, alguém precisa realmente executar o trabalho publicado.",
      model: "O worker consome o evento, aplica a regra e toca persistência e integrações externas.",
      cost: "Workers trazem paralelismo e isolamento, mas aumentam complexidade operacional.",
      whenToUse: "Tarefas assíncronas, jobs paralelizáveis e processamento que precisa sair da borda HTTP.",
      alternative: "Sem worker, a própria API teria de esperar ou fazer polling improvisado.",
    },
    challenge: {
      question: "Quem continua o trabalho depois que a API já respondeu 202?",
      hint: "É o consumidor do job.",
      choices: [
        { id: "worker", label: "Worker", correct: true },
        { id: "client", label: "Cliente", correct: false },
        { id: "router", label: "Router", correct: false },
      ],
      success: "Correto: o worker é quem pega o job da fila e executa o restante.",
    },
    scenario: 1,
  }),
  createAsyncFocusedLesson({
    id: "backend-idempotency",
    title: "Backend: idempotência",
    shortTitle: "Backend idempotency",
    icon: "🔁",
    description: "Acompanhe o backend impedir que o mesmo request gere dois efeitos equivalentes.",
    objectives: [
      "Entender o papel da idempotency key",
      "Visualizar deduplicação antes do enqueue",
      "Evitar duplicidade em refresh e retries do cliente",
    ],
    prerequisites: ["backend-queue"],
    explanation: {
      problem: "Em redes reais, o mesmo request pode chegar duas vezes e não deve duplicar efeito.",
      model: "A API guarda uma chave lógica e compara novas chegadas antes de criar outro job.",
      cost: "Há custo extra de estado e verificação, mas ele evita duplicidade de pedido, cobrança ou job.",
      whenToUse: "Pedidos, pagamentos e qualquer operação não segura a reenvio.",
      alternative: "Sem idempotência, um refresh inocente pode causar efeitos duplicados difíceis de reparar.",
    },
    challenge: {
      question: "Onde a idempotência precisa agir para impedir duplicidade neste fluxo?",
      hint: "Pense no ponto em que um segundo job nasceria.",
      choices: [
        { id: "enqueue", label: "Antes do enqueue", correct: true },
        { id: "email", label: "Só no envio do e-mail", correct: false },
        { id: "client", label: "Só no frontend", correct: false },
      ],
      success: "Correto: o backend deduplica antes de publicar um segundo job.",
    },
    scenario: 2,
  }),
  createAsyncFocusedLesson({
    id: "backend-retry",
    title: "Backend: retry",
    shortTitle: "Backend retry",
    icon: "↺",
    description: "Veja o worker reagir a uma falha transitória sem pedir ao cliente para reenviar tudo.",
    objectives: [
      "Separar retry do worker de retry do cliente",
      "Entender falha transitória",
      "Ler a recuperação sem perder o pedido",
    ],
    prerequisites: ["backend-worker"],
    explanation: {
      problem: "Serviços externos falham temporariamente e o backend precisa absorver isso sem perder estado.",
      model: "O worker detecta a falha, agenda retry e tenta novamente mantendo o pedido persistido.",
      cost: "Retry melhora resiliência, mas exige limites, observabilidade e proteção contra repetição cega.",
      whenToUse: "E-mail, webhooks, pagamentos e integrações que oscilam mas normalmente se recuperam.",
      alternative: "Sem retry, qualquer falha pontual viraria erro definitivo para o negócio.",
    },
    challenge: {
      question: "Quem faz o retry neste fluxo?",
      hint: "Não é o navegador.",
      choices: [
        { id: "worker", label: "Worker", correct: true },
        { id: "client", label: "Cliente", correct: false },
        { id: "database", label: "Banco", correct: false },
      ],
      success: "Correto: o retry é responsabilidade do worker que está processando o job.",
    },
    scenario: 1,
  }),
  createAsyncFocusedLesson({
    id: "backend-dlq",
    title: "Backend: DLQ",
    shortTitle: "Backend DLQ",
    icon: "⛔",
    description: "Entenda a dead-letter queue como destino explícito para jobs que falharam de vez.",
    objectives: [
      "Entender por que falha permanente precisa de rota própria",
      "Visualizar o job saindo do fluxo principal",
      "Ler a DLQ como observabilidade, não como sucesso",
    ],
    prerequisites: ["backend-retry"],
    explanation: {
      problem: "Quando retries não resolvem, o sistema precisa parar o job sem apagá-lo.",
      model: "Após o limite de tentativas, o job vai para a DLQ para inspeção e possível reprocessamento.",
      cost: "DLQ aumenta robustez operacional, mas exige ferramentas e rotina de tratamento.",
      whenToUse: "Processamentos assíncronos com falhas externas ou dados malformados que precisam de triagem.",
      alternative: "Sem DLQ, o job some silenciosamente ou envenena a fila principal indefinidamente.",
    },
    challenge: {
      question: "O que a DLQ representa neste trace?",
      hint: "Não é um caminho feliz.",
      choices: [
        { id: "parking", label: "Estacionamento explícito para falha final", correct: true },
        { id: "cache", label: "Cache do worker", correct: false },
        { id: "duplicate", label: "Deduplicação do request", correct: false },
      ],
      success: "Correto: a DLQ é o destino explícito de jobs que falharam de forma terminal.",
    },
    scenario: 3,
    flowScene: dlqFlowScene,
  }),
  {
    id: "backend-request",
    title: "Backend: request, controller, service e banco",
    shortTitle: "Backend request",
    module: "system-design",
    icon: "⇄",
    difficulty: "foundation",
    prerequisites: ["request-flow"],
    objectives: [
      "Ler a entrada principal do backend",
      "Separar router, controller, service e banco",
      "Entender por que nem toda lógica deve morar no controller",
      "Relacionar HTTP, DTO e regra de negócio no mesmo fluxo",
    ],
    description: "Veja o caminho de uma requisição HTTP até a persistência e a resposta.",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "A estrutura router → controller → service → database é comum em backends web, embora nomes e camadas variem entre stacks.",
    },
    representations: backendRepresentations,
    explanation: {
      problem: "Transformar uma requisição externa em uma operação persistida com resposta previsível.",
      model: "Router recebe, controller valida, service aplica regra e o banco persiste.",
      cost: "A preocupação principal aqui é latência de I/O e clareza de responsabilidade.",
      whenToUse: "APIs HTTP síncronas com confirmação imediata para o cliente.",
      alternative: "Fila e worker desacoplam a resposta quando o trabalho pode continuar depois.",
    },
    challenge: {
      question: "Qual camada deveria concentrar a regra principal do domínio?",
      hint: "O controller orquestra; ele não deveria carregar toda a regra.",
      choices: [
        { id: "service", label: "Service", correct: true },
        { id: "router", label: "Router", correct: false },
        { id: "database", label: "Database", correct: false },
      ],
      success: "Correto: service concentra a regra de negócio e deixa router/controller mais finos.",
    },
    flowScene: clientServerFlowScene,
    trace: backendRequestTrace,
  },
  {
    id: "backend-cache",
    title: "Backend: cache hit e cache miss",
    shortTitle: "Backend cache",
    module: "system-design",
    icon: "◫",
    difficulty: "intermediate",
    prerequisites: ["backend-request"],
    objectives: [
      "Entender cache hit e cache miss no fluxo real",
      "Perceber quando o banco é poupado e quando ele volta a participar",
      "Ver como o cache encurta o caminho sem mudar a API",
    ],
    description: "Compare o caminho curto do cache hit com o fallback ao banco no cache miss.",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "Cache é um acelerador comum em backends web. O trace simplifica invalidação, TTL e coerência de dados para focar no fluxo.",
    },
    representations: backendRepresentations,
    explanation: {
      problem: "Reduzir leituras repetidas no banco quando o mesmo dado é pedido várias vezes.",
      model: "O servidor consulta o cache primeiro; se houver hit, responde cedo. Se houver miss, recorre ao banco e repopula o cache.",
      cost: "Cache melhora latência e carga, mas traz complexidade de invalidação, expiração e consistência.",
      whenToUse: "Leituras frequentes, dados quentes e respostas que não precisam ser recalculadas toda vez.",
      alternative: "Sem cache, o fluxo é mais simples, mas o banco absorve toda a carga de leitura.",
    },
    challenge: {
      question: "O que muda entre cache hit e cache miss?",
      hint: "Pense em qual caminho precisa ou não precisa tocar o banco.",
      choices: [
        { id: "bank", label: "No miss o servidor precisa consultar o banco", correct: true },
        { id: "route", label: "No hit a rota HTTP muda", correct: false },
        { id: "client", label: "No miss o cliente deixa de fazer request", correct: false },
      ],
      success: "Correto: no cache miss o backend segue até o banco e depois repopula o cache.",
    },
    controls: [
      {
        id: "scenario",
        label: "Cenário do cache",
        type: "select",
        defaultValue: 1,
        options: [
          { value: 1, label: "Cache hit" },
          { value: 2, label: "Cache miss" },
        ],
      },
    ],
    trace: createBackendCacheTrace(1),
    createTrace: (inputs) => createBackendCacheTrace(inputs.scenario ?? 1),
    flowScene: createCacheFlowScene(1),
    createFlowScene: (inputs) => createCacheFlowScene(inputs.scenario ?? 1),
  },
  {
    id: "backend-auth",
    title: "Backend: autenticação, autorização e middleware",
    shortTitle: "Backend auth",
    module: "system-design",
    icon: "🔐",
    difficulty: "foundation",
    prerequisites: ["backend-request"],
    objectives: [
      "Separar autenticação de autorização",
      "Visualizar middleware protegendo handlers",
      "Entender 401/403 antes de tocar o domínio",
    ],
    description: "Acompanhe token, identidade e policy antes de liberar uma ação protegida.",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "JWT, sessão, OAuth ou cookies variam conforme a stack; o trace mostra a ideia central de middleware + policy.",
    },
    representations: backendRepresentations,
    explanation: {
      problem: "Garantir que só usuários corretos executem operações sensíveis.",
      model: "Middleware autentica, policy autoriza e só então o handler protegido roda.",
      cost: "O custo é pequeno por requisição, mas central para segurança e auditoria.",
      whenToUse: "Qualquer rota que dependa de identidade, role ou permissão.",
      alternative: "Sem middleware, cada handler teria de repetir checagens, aumentando risco e acoplamento.",
    },
    challenge: {
      question: "O que a autorização responde que a autenticação não responde?",
      hint: "Autenticação diz quem é; autorização diz se pode.",
      choices: [
        { id: "can", label: "Se a pessoa pode executar a ação", correct: true },
        { id: "who", label: "Quem é a pessoa", correct: false },
        { id: "where", label: "De qual IP ela veio", correct: false },
      ],
      success: "Correto: autorização responde se a identidade autenticada pode executar aquela ação.",
    },
    trace: backendAuthTrace,
  },
  {
    id: "backend-async",
    title: "Backend assíncrono: fila, worker, retry e DLQ",
    shortTitle: "Backend async",
    module: "system-design",
    icon: "⤴",
    difficulty: "intermediate",
    prerequisites: ["backend-request"],
    objectives: [
      "Separar aceitação do processamento pesado",
      "Entender queue, worker, retry, idempotência e DLQ",
      "Ler por que o cliente recebe 202 antes do trabalho terminar",
    ],
    description: "Veja um backend aceitar rápido, processar em background e sobreviver a falhas transitórias.",
    example: {
      kind: "common-technical-use",
      label: "Uso técnico comum",
      note: "Filas, workers e retries são comuns em pedidos, pagamentos, e-mails e integrações externas. O trace simplifica infraestrutura e tempos.",
    },
    representations: backendRepresentations,
    explanation: {
      problem: "Responder rápido sem perder trabalho quando integrações externas são lentas ou instáveis.",
      model: "API valida e enfileira; worker consome, persiste, tenta de novo em falhas e usa DLQ quando necessário.",
      cost: "Você ganha throughput e resiliência, mas troca simplicidade por observabilidade, idempotência e consistência eventual.",
      whenToUse: "Processamentos demorados, integrações instáveis e tarefas que não precisam concluir no request-response.",
      alternative: "Fluxo síncrono é mais simples, mas prende latência do cliente ao serviço mais lento.",
    },
    challenge: {
      question: "Por que a idempotency key aparece antes do enqueue?",
      hint: "Pense em refresh do navegador ou reenvio do mesmo pedido.",
      choices: [
        { id: "duplicate", label: "Para impedir duplicação do mesmo trabalho", correct: true },
        { id: "faster", label: "Para acelerar o banco", correct: false },
        { id: "ordering", label: "Para ordenar a fila alfabeticamente", correct: false },
      ],
      success: "Correto: a idempotency key impede que o mesmo pedido gere dois jobs equivalentes.",
    },
    controls: [
      {
        id: "scenario",
        label: "Cenário",
        type: "select",
        defaultValue: 1,
        options: [
          { value: 1, label: "Falha transitória + retry" },
          { value: 2, label: "Request duplicado" },
          { value: 3, label: "Falha final + DLQ" },
        ],
      },
    ],
    trace: backendAsyncTrace,
    createTrace: (inputs) => createBackendAsyncTrace(inputs.scenario ?? 1),
  },
];
