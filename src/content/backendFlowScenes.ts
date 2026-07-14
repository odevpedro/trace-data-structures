import type { FlowSceneDefinition, FlowSceneStep } from "../core/flow-scene/types";

function step(definition: FlowSceneStep): FlowSceneStep {
  return definition;
}

export const clientServerFlowScene: FlowSceneDefinition = {
  id: "client-server-flow",
  title: "Como funciona o fluxo cliente-servidor",
  description: "Cliente, servidor e banco trocam request, consulta e response em uma ordem causal.",
  layouts: {
    desktop: { columns: 3, rows: 1 },
    mobile: { columns: 1, rows: 3 },
  },
  nodes: [
    {
      id: "client",
      role: "browser",
      label: "Cliente",
      shortLabel: "Cliente",
      description: "navegador ou app",
      metadata: ["interface", "ação do usuário"],
      accessibilityLabel: "Cliente, onde o usuário inicia a ação",
      placement: {
        desktop: { column: 1, row: 1 },
        mobile: { column: 1, row: 1 },
      },
    },
    {
      id: "server",
      role: "api",
      label: "Servidor",
      shortLabel: "Servidor",
      description: "API e regra de negócio",
      metadata: ["router", "controller", "service"],
      accessibilityLabel: "Servidor, onde a requisição é recebida e processada",
      placement: {
        desktop: { column: 2, row: 1 },
        mobile: { column: 1, row: 2 },
      },
    },
    {
      id: "database",
      role: "database",
      label: "Banco de dados",
      shortLabel: "Banco",
      description: "persistência da aplicação",
      metadata: ["consulta", "resultado"],
      accessibilityLabel: "Banco de dados, onde o servidor consulta ou grava informações",
      placement: {
        desktop: { column: 3, row: 1 },
        mobile: { column: 1, row: 3 },
      },
    },
  ],
  connections: [
    {
      id: "client-server",
      from: "client",
      to: "server",
      label: "HTTP",
      kind: "http",
    },
    {
      id: "server-database",
      from: "server",
      to: "database",
      label: "consulta",
      kind: "database",
    },
  ],
  steps: [
    step({
      id: "client-action",
      title: "O cliente inicia uma ação",
      caption: "Tudo começa no cliente: alguém abre uma página, clica em um botão ou envia um formulário.",
      focusNodeId: "client",
      concept: {
        title: "A ação nasce no cliente",
        bubble: "Antes de existir request, existe uma intenção do usuário na interface.",
        summary: "A interface é a origem do fluxo. O backend ainda não recebeu nada; o cliente apenas detectou uma ação que exige dados ou uma operação.",
        details: [
          "O usuário pode clicar em um botão, abrir uma tela ou enviar um formulário.",
          "Essa ação ainda não é HTTP por si só; ela só dispara a necessidade de criar uma requisição.",
          "Separar intenção do envio evita tratar request como algo mágico que surge do nada.",
        ],
        glossary: [
          { term: "Cliente", definition: "A parte da aplicação que roda no navegador ou no app do usuário." },
          { term: "Ação", definition: "O evento que dispara a necessidade de buscar ou enviar dados." },
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "client", state: "active" },
      ],
    }),
    step({
      id: "client-request",
      title: "O cliente cria uma requisição",
      caption: "O cliente prepara um request HTTP com método, rota e payload compatíveis com a operação.",
      focusNodeId: "client",
      concept: {
        title: "Requisição HTTP",
        bubble: "Agora a intenção vira um pacote organizado com método, rota e metadados.",
        summary: "O cliente empacota a ação em uma requisição HTTP legível pelo servidor. É aqui que aparecem método, rota, headers e, se necessário, body.",
        longform: [
          "Essa é a primeira fronteira técnica do fluxo. A ação do usuário deixa de ser apenas um evento de interface e passa a ser uma mensagem de rede com um formato que o backend consegue interpretar.",
          "Nem toda requisição tem body. Em geral, leituras simples usam método e rota como núcleo do pedido, enquanto criações e atualizações costumam carregar dados adicionais.",
        ],
        details: [
          "Método descreve a intenção geral, como GET para ler ou POST para criar.",
          "A rota indica qual recurso ou operação o cliente quer atingir.",
          "Headers levam contexto como autenticação e formato dos dados.",
        ],
        glossary: [
          { term: "HTTP", definition: "Protocolo de aplicação usado para requests e responses entre cliente e servidor." },
          { term: "Body", definition: "Parte opcional da requisição que carrega dados como JSON ou formulário." },
        ],
        pitfalls: [
          "Confundir ação do usuário com requisição pronta. Primeiro existe a intenção; depois o cliente monta a mensagem.",
          "Assumir que toda requisição tem body. Muitas leituras úteis não carregam corpo nenhum.",
        ],
        payloadTitle: "Exemplo de request",
        payloadLines: [
          "GET /users",
          "Authorization: Bearer …",
          "Accept: application/json",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "set-node-state", nodeId: "client", state: "sending" },
      ],
    }),
    step({
      id: "request-travels",
      title: "A requisição trafega até o servidor",
      caption: "O request sai do cliente e percorre o caminho até o servidor.",
      focusNodeId: "server",
      concept: {
        title: "Origem, direção e destino",
        bubble: "O request sai do cliente, ativa o caminho HTTP e aponta claramente para o servidor.",
        summary: "O movimento tem função didática: mostrar quem enviou, qual caminho está ativo e para onde o dado está indo.",
        details: [
          "A conexão HTTP fica em destaque enquanto o pacote está em trânsito.",
          "Os outros componentes perdem ênfase para reduzir ruído visual.",
          "Distinguir a direção do pacote evita confundir request com response.",
        ],
        payloadTitle: "Pacote em trânsito",
        payloadLines: [
          "request",
          "GET /users",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "client", state: "sending" },
        { type: "set-node-state", nodeId: "server", state: "receiving" },
        { type: "set-connection-state", connectionId: "client-server", state: "transmitting" },
        {
          type: "send-packet",
          packet: {
            id: "request-users",
            from: "client",
            to: "server",
            semantic: "request",
            label: "HTTP request",
            payloadLabel: "GET /users",
          },
        },
      ],
    }),
    step({
      id: "server-process",
      title: "O servidor recebe e processa",
      caption: "O servidor recebe o request, interpreta rota, valida entrada e escolhe a regra de negócio.",
      focusNodeId: "server",
      concept: {
        title: "Receber, validar e transformar",
        bubble: "Ao chegar, o servidor ainda precisa validar a entrada e transformá-la antes de executar a regra.",
        summary: "O servidor sai do estado de receiving para processing. Aqui entram router, controller e também a criação de um DTO para proteger a regra de negócio da entrada crua.",
        longform: [
          "Esse é o ponto em que muita gente mistura responsabilidades. O request já chegou, mas a aplicação ainda não deveria executar regra de negócio diretamente sobre dados crus vindos da rede.",
          "A validação reduz estados inválidos cedo. O DTO nasce como uma forma estável e previsível de entregar dados coerentes para a camada de service.",
        ],
        details: [
          "Router decide qual entrada da aplicação deve tratar o request.",
          "Controller valida e normaliza a entrada antes da regra de negócio.",
          "O DTO nasce depois da validação para carregar um contrato consistente até o service.",
          "Service concentra a lógica do caso de uso em vez de espalhá-la pela borda HTTP.",
        ],
        glossary: [
          { term: "Router", definition: "Camada que casa método e caminho com o handler correto." },
          { term: "DTO", definition: "Objeto de transferência já validado, usado entre camadas do backend." },
          { term: "Service", definition: "Camada onde a regra de negócio do caso de uso costuma ficar." },
        ],
        pitfalls: [
          "Achar que DTO é sinônimo de tabela do banco ou de entidade de domínio.",
          "Jogar regra pesada no controller só porque ele foi a primeira camada a receber o request.",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "server", state: "processing" },
        { type: "set-node-state", nodeId: "client", state: "waiting" },
        { type: "set-connection-state", connectionId: "client-server", state: "active" },
      ],
    }),
    step({
      id: "server-query",
      title: "O servidor consulta o banco",
      caption: "Depois de decidir o caso de uso, o servidor faz uma consulta ao banco de dados.",
      focusNodeId: "server",
      concept: {
        title: "Consulta ao banco",
        bubble: "O servidor não inventa dados: ele precisa consultar a camada de persistência.",
        summary: "Quando a resposta depende de dados persistidos, o servidor faz uma consulta. O banco não conhece HTTP; ele só recebe uma instrução de acesso a dados.",
        longform: [
          "O banco entra no fluxo como fonte de dados, não como participante da conversa HTTP. Do ponto de vista dele, o que chega é uma operação de leitura ou escrita, não um GET ou POST.",
        ],
        details: [
          "A consulta é uma preocupação de dados, não de interface.",
          "O servidor continua responsável por orquestrar o fluxo inteiro.",
          "A query aqui é ilustrativa e representa uma busca na persistência.",
        ],
        pitfalls: [
          "Imaginar que o banco responde diretamente ao cliente.",
          "Tratar query como detalhe irrelevante, quando ela determina custo e dependência da etapa seguinte.",
        ],
        payloadTitle: "Exemplo de query",
        payloadLines: [
          "SELECT id, name",
          "FROM users",
          "LIMIT 20",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "server", state: "sending" },
        { type: "set-node-state", nodeId: "database", state: "receiving" },
        { type: "set-connection-state", connectionId: "server-database", state: "transmitting" },
        {
          type: "send-packet",
          packet: {
            id: "query-users",
            from: "server",
            to: "database",
            semantic: "query",
            label: "SQL query",
            payloadLabel: "SELECT * FROM users",
          },
        },
      ],
    }),
    step({
      id: "database-process",
      title: "O banco processa a consulta",
      caption: "O banco recebe a query, localiza os dados relevantes e prepara o resultado.",
      focusNodeId: "database",
      concept: {
        title: "O banco trabalha nos dados",
        bubble: "Aqui a responsabilidade muda: o banco não monta response HTTP, ele processa dados.",
        summary: "O banco foca em localizar, ler e montar o resultado pedido pelo servidor. Essa etapa depende diretamente da consulta anterior.",
        details: [
          "A etapa só existe porque o servidor enviou uma consulta antes.",
          "O banco prepara um conjunto de linhas ou registros como resposta.",
          "Mesmo simplificado, o fluxo mostra a dependência causal entre consulta e resultado.",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "database", state: "processing" },
        { type: "set-node-state", nodeId: "server", state: "waiting" },
        { type: "set-connection-state", connectionId: "server-database", state: "active" },
      ],
    }),
    step({
      id: "database-result",
      title: "O banco retorna os dados",
      caption: "O banco envia o resultado de volta ao servidor para que a resposta final seja montada.",
      focusNodeId: "server",
      concept: {
        title: "Resultado não é resposta final",
        bubble: "O banco devolve dados; quem monta a resposta HTTP continua sendo o servidor.",
        summary: "O retorno do banco volta para o servidor em um fluxo separado do request original. Isso ajuda a entender que a resposta ao cliente ainda está sendo construída.",
        details: [
          "O resultado pode conter várias linhas, não só um valor simples.",
          "O servidor ainda pode aplicar filtros, regras ou transformação antes de responder.",
          "Dado retornado do banco não deveria vazar cru automaticamente para o cliente.",
        ],
        payloadTitle: "Resultado ilustrativo",
        payloadLines: [
          "[",
          '  { "id": 1, "name": "Ana" }',
          "  …",
          "]",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "database", state: "sending" },
        { type: "set-node-state", nodeId: "server", state: "receiving" },
        { type: "set-connection-state", connectionId: "server-database", state: "success" },
        {
          type: "send-packet",
          packet: {
            id: "users-result",
            from: "database",
            to: "server",
            semantic: "result",
            label: "resultado",
            payloadLabel: "20 registros",
          },
        },
      ],
    }),
    step({
      id: "server-response-build",
      title: "O servidor monta a resposta",
      caption: "Com os dados em mãos, o servidor transforma o resultado em uma resposta HTTP coerente com a API.",
      focusNodeId: "server",
      concept: {
        title: "Montando a response",
        bubble: "O servidor volta a processar, agora para transformar dados em response HTTP.",
        summary: "O servidor aplica formato, regra de negócio e status HTTP antes de devolver algo ao cliente. Esta etapa existe depois do banco, não antes.",
        longform: [
          "O dado que veio do banco ainda não é automaticamente a resposta da API. A camada de aplicação pode filtrar campos, combinar fontes, aplicar regras e escolher o contrato final exposto ao cliente.",
          "Essa separação ajuda a evitar vazamento de detalhes internos da persistência para a interface.",
        ],
        details: [
          "Nem todo dado do banco precisa ir para a interface.",
          "O servidor pode filtrar campos, paginar ou aplicar regras extras.",
          "É aqui que surgem status code, headers e corpo final da resposta.",
        ],
        glossary: [
          { term: "Response HTTP", definition: "Mensagem enviada pelo servidor de volta ao cliente com status, headers e body." },
        ],
        pitfalls: [
          "Assumir que response é igual ao resultado cru do banco.",
          "Confundir persistir um dado com já saber qual payload faz sentido para a interface.",
        ],
        payloadTitle: "Response preparada",
        payloadLines: [
          "200 OK",
          "Content-Type: application/json",
          '{ "items": [...] }',
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "server", state: "processing" },
        { type: "set-node-state", nodeId: "database", state: "success" },
      ],
    }),
    step({
      id: "response-travels",
      title: "A resposta retorna ao cliente",
      caption: "Depois de montada, a response percorre o caminho inverso até o cliente.",
      focusNodeId: "client",
      concept: {
        title: "Request e response são fluxos diferentes",
        bubble: "Agora o pacote muda de direção e de significado: sai do servidor e volta ao cliente.",
        summary: "A resposta usa o mesmo caminho geral, mas com outra direção e semântica. Distinguir request de response é central para o entendimento do modelo cliente-servidor.",
        details: [
          "O servidor é a origem do pacote nesta etapa.",
          "O cliente volta ao estado de receiving porque agora é ele quem recebe dados.",
          "A conexão continua a mesma, mas o fluxo e o significado mudaram.",
        ],
        payloadTitle: "Response em trânsito",
        payloadLines: [
          "200 OK",
          "{ items: [...] }",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "server", state: "sending" },
        { type: "set-node-state", nodeId: "client", state: "receiving" },
        { type: "set-connection-state", connectionId: "client-server", state: "success" },
        {
          type: "send-packet",
          packet: {
            id: "response-users",
            from: "server",
            to: "client",
            semantic: "response",
            label: "HTTP response",
            payloadLabel: "200 OK",
          },
        },
      ],
    }),
    step({
      id: "client-success",
      title: "O cliente apresenta o resultado",
      caption: "O cliente recebe a response, atualiza a interface e conclui o fluxo com sucesso.",
      focusNodeId: "client",
      concept: {
        title: "A interface finalmente muda",
        bubble: "O fluxo só faz sentido quando o cliente consegue usar o resultado recebido.",
        summary: "A etapa final mostra o efeito visível para o usuário: a interface agora tem dados para renderizar e pode encerrar o fluxo com sucesso.",
        details: [
          "O cliente interpreta a response e atualiza a tela.",
          "O estado final de sucesso depende de todas as etapas anteriores.",
          "Sem a resposta, não haveria dados para apresentar ao usuário.",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "client", state: "success" },
        { type: "set-node-state", nodeId: "server", state: "success" },
        { type: "set-node-state", nodeId: "database", state: "success" },
      ],
    }),
  ],
};

function cacheHitSteps(): FlowSceneStep[] {
  return [
    step({
      id: "cache-start",
      title: "Cliente pede dados",
      caption: "O cliente inicia o fluxo que pode terminar no cache ou seguir até o banco.",
      focusNodeId: "client",
      concept: {
        title: "Cache entra entre servidor e banco",
        bubble: "O cache existe para evitar consultas desnecessárias ao banco quando o dado já está pronto.",
        summary: "No fluxo com cache, o servidor tenta responder rápido consultando primeiro uma camada de acesso veloz antes de falar com o banco.",
        details: [
          "Cache guarda resultados recentes ou muito pedidos.",
          "Ele não substitui o banco; ele reduz leituras repetidas.",
          "O cliente continua enxergando o mesmo endpoint HTTP.",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "client", state: "active" },
      ],
    }),
    step({
      id: "cache-request",
      title: "Request chega ao servidor",
      caption: "O request trafega normalmente até o servidor antes de qualquer decisão de cache.",
      focusNodeId: "server",
      concept: {
        title: "O servidor decide a estratégia",
        bubble: "Quem decide consultar o cache ou o banco é o servidor.",
        summary: "A presença do cache é uma decisão da arquitetura do backend. O cliente não escolhe explicitamente se haverá hit ou miss.",
        details: [
          "A rota continua a mesma do ponto de vista do cliente.",
          "A otimização acontece internamente no backend.",
        ],
        payloadTitle: "Request",
        payloadLines: ["GET /users/42"],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "client", state: "sending" },
        { type: "set-node-state", nodeId: "server", state: "receiving" },
        { type: "set-connection-state", connectionId: "client-server", state: "transmitting" },
        {
          type: "send-packet",
          packet: {
            id: "cache-request-packet",
            from: "client",
            to: "server",
            semantic: "request",
            label: "request",
            payloadLabel: "GET /users/42",
          },
        },
      ],
    }),
    step({
      id: "cache-lookup",
      title: "Servidor consulta o cache",
      caption: "Antes de tocar o banco, o servidor pergunta ao cache se o dado já está disponível.",
      focusNodeId: "cache",
      concept: {
        title: "Lookup no cache",
        bubble: "O cache é a primeira tentativa de resposta rápida.",
        summary: "O backend consulta o cache porque essa leitura costuma ser mais barata que consultar o banco de dados novamente.",
        details: [
          "Cache hit significa dado encontrado.",
          "Cache miss significa ausência do dado ou expiração do valor salvo.",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "server", state: "sending" },
        { type: "set-node-state", nodeId: "cache", state: "receiving" },
        { type: "set-connection-state", connectionId: "server-cache", state: "transmitting" },
        {
          type: "send-packet",
          packet: {
            id: "cache-lookup-packet",
            from: "server",
            to: "cache",
            semantic: "query",
            label: "lookup",
            payloadLabel: "users:42",
          },
        },
      ],
    }),
    step({
      id: "cache-hit",
      title: "Cache encontra o dado",
      caption: "Como houve cache hit, o dado volta do cache para o servidor sem tocar o banco.",
      focusNodeId: "cache",
      concept: {
        title: "Cache hit",
        bubble: "O dado já estava pronto no cache, então o banco nem participa deste caminho.",
        summary: "Cache hit encurta o fluxo. O servidor recebe o valor diretamente do cache e pode responder sem abrir nova consulta no banco.",
        details: [
          "Menos latência para o cliente.",
          "Menos carga no banco.",
          "A resposta final ainda é montada pelo servidor.",
        ],
        payloadTitle: "Valor em cache",
        payloadLines: ['{ "id": 42, "name": "Ana" }'],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "cache", state: "success" },
        { type: "set-node-state", nodeId: "server", state: "receiving" },
        { type: "set-connection-state", connectionId: "server-cache", state: "success" },
        {
          type: "send-packet",
          packet: {
            id: "cache-hit-packet",
            from: "cache",
            to: "server",
            semantic: "cache-hit",
            label: "cache hit",
            payloadLabel: "user:42",
          },
        },
      ],
    }),
    step({
      id: "cache-hit-response",
      title: "Servidor responde ao cliente",
      caption: "Com o dado em mãos, o servidor monta a response e devolve ao cliente.",
      focusNodeId: "client",
      concept: {
        title: "Resposta com cache hit",
        bubble: "O fluxo termina cedo porque o banco foi poupado.",
        summary: "O cache hit prova a extensibilidade da cena: os nós e conexões são os mesmos, mas a sequência muda e o banco fica fora do caminho feliz.",
        details: [
          "O servidor ainda continua dono da response HTTP.",
          "O cliente não precisa saber que a origem foi cache e não banco.",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "server", state: "sending" },
        { type: "set-node-state", nodeId: "client", state: "receiving" },
        { type: "set-connection-state", connectionId: "client-server", state: "success" },
        {
          type: "send-packet",
          packet: {
            id: "cache-response-packet",
            from: "server",
            to: "client",
            semantic: "response",
            label: "response",
            payloadLabel: "200 OK",
          },
        },
      ],
    }),
    step({
      id: "cache-hit-done",
      title: "Cliente recebe o resultado",
      caption: "O cliente atualiza a interface e o fluxo termina sem consultar o banco.",
      focusNodeId: "client",
      concept: {
        title: "Fim do fluxo com hit",
        bubble: "Hit significa responder cedo, não mudar a API.",
        summary: "A experiência do cliente é a mesma, mas o caminho interno foi mais curto e mais barato para a arquitetura.",
        details: [
          "A resposta continua tecnicamente correta.",
          "O ganho aconteceu no caminho interno entre servidor, cache e banco.",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "client", state: "success" },
        { type: "set-node-state", nodeId: "server", state: "success" },
        { type: "set-node-state", nodeId: "cache", state: "success" },
      ],
    }),
  ];
}

function cacheMissSteps(): FlowSceneStep[] {
  return [
    ...cacheHitSteps().slice(0, 3),
    step({
      id: "cache-miss",
      title: "Cache não encontra o dado",
      caption: "Como houve cache miss, o servidor precisa seguir para o banco.",
      focusNodeId: "cache",
      concept: {
        title: "Cache miss",
        bubble: "O cache não tinha o valor pedido, então o fluxo continua até o banco.",
        summary: "Cache miss não é erro. Ele só indica que o atalho não estava disponível e que o sistema precisa recorrer à fonte principal.",
        details: [
          "O servidor não consegue responder ainda.",
          "O banco volta a ser necessário neste caminho.",
          "Miss pode ocorrer por expiração, ausência ou chave nunca populada.",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "cache", state: "waiting" },
        { type: "set-node-state", nodeId: "server", state: "processing" },
        { type: "set-connection-state", connectionId: "server-cache", state: "retry" },
      ],
    }),
    step({
      id: "miss-to-db",
      title: "Servidor consulta o banco",
      caption: "Depois do miss, o servidor segue para o banco de dados.",
      focusNodeId: "database",
      concept: {
        title: "Fallback para o banco",
        bubble: "Quando o cache falha em responder, o banco continua sendo a fonte de verdade.",
        summary: "O banco entra no fluxo só porque o cache não tinha o dado. Essa dependência causal é o ponto pedagógico principal do miss.",
        details: [
          "O cache não elimina o banco.",
          "Ele só evita consultas quando o dado já está disponível.",
        ],
        payloadTitle: "Query",
        payloadLines: ["SELECT * FROM users WHERE id = 42"],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "server", state: "sending" },
        { type: "set-node-state", nodeId: "database", state: "receiving" },
        { type: "set-connection-state", connectionId: "server-database", state: "transmitting" },
        {
          type: "send-packet",
          packet: {
            id: "miss-db-query",
            from: "server",
            to: "database",
            semantic: "query",
            label: "query",
            payloadLabel: "users:42",
          },
        },
      ],
    }),
    step({
      id: "db-result",
      title: "Banco devolve o resultado",
      caption: "O banco encontra o dado e o devolve ao servidor.",
      focusNodeId: "server",
      concept: {
        title: "Voltando da fonte de verdade",
        bubble: "Agora o servidor finalmente recebeu o dado que o cache não tinha.",
        summary: "O servidor recebe o resultado do banco e passa a ter material para responder e também para popular o cache.",
        details: [
          "O valor que veio do banco pode ser salvo no cache para requests futuros.",
          "Essa etapa prepara duas saídas: atualização do cache e response ao cliente.",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "database", state: "sending" },
        { type: "set-node-state", nodeId: "server", state: "receiving" },
        { type: "set-connection-state", connectionId: "server-database", state: "success" },
        {
          type: "send-packet",
          packet: {
            id: "miss-db-result",
            from: "database",
            to: "server",
            semantic: "result",
            label: "resultado",
            payloadLabel: "user:42",
          },
        },
      ],
    }),
    step({
      id: "cache-update",
      title: "Servidor atualiza o cache",
      caption: "Antes de responder, o servidor repopula o cache para acelerar o próximo acesso.",
      focusNodeId: "cache",
      concept: {
        title: "Populando o cache",
        bubble: "Miss não termina no banco; o servidor aproveita para salvar o resultado no cache.",
        summary: "Atualizar o cache depois do banco é o que permite que um request futuro siga o caminho curto do hit.",
        details: [
          "O cache passa a guardar um valor recém-confirmado pela fonte principal.",
          "Esse passo prova a reutilização da mesma infraestrutura para outro tipo de fluxo.",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "server", state: "sending" },
        { type: "set-node-state", nodeId: "cache", state: "receiving" },
        { type: "set-connection-state", connectionId: "server-cache", state: "success" },
        {
          type: "send-packet",
          packet: {
            id: "cache-update-packet",
            from: "server",
            to: "cache",
            semantic: "cache-update",
            label: "cache set",
            payloadLabel: "users:42",
          },
        },
      ],
    }),
    step({
      id: "miss-response",
      title: "Servidor responde ao cliente",
      caption: "Com banco e cache já alinhados, o servidor devolve a response ao cliente.",
      focusNodeId: "client",
      concept: {
        title: "Resposta depois do miss",
        bubble: "O caminho foi mais longo, mas a API devolvida ao cliente continua a mesma.",
        summary: "Cache miss não muda o contrato HTTP; ele só muda o caminho interno que o backend percorreu para conseguir responder.",
        details: [
          "O cliente continua recebendo uma response normal.",
          "A diferença pedagógica está na dependência extra do banco e na atualização do cache.",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "server", state: "sending" },
        { type: "set-node-state", nodeId: "client", state: "receiving" },
        { type: "set-connection-state", connectionId: "client-server", state: "success" },
        {
          type: "send-packet",
          packet: {
            id: "miss-response-packet",
            from: "server",
            to: "client",
            semantic: "response",
            label: "response",
            payloadLabel: "200 OK",
          },
        },
      ],
    }),
    step({
      id: "miss-done",
      title: "Fluxo concluído",
      caption: "O cliente recebe o dado, o cache foi populado e o próximo request tem chance de virar hit.",
      focusNodeId: "client",
      concept: {
        title: "O miss prepara o próximo hit",
        bubble: "Depois do miss, a arquitetura fica pronta para responder mais rápido na próxima vez.",
        summary: "Essa conclusão prova a extensibilidade da camada: mudando a sequência declarativa, o mesmo motor explica outro comportamento de backend.",
        details: [
          "Cliente, servidor, cache e banco foram reutilizados.",
          "Conexões e pacote trafegando também foram reaproveitados.",
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "client", state: "success" },
        { type: "set-node-state", nodeId: "server", state: "success" },
        { type: "set-node-state", nodeId: "cache", state: "success" },
        { type: "set-node-state", nodeId: "database", state: "success" },
      ],
    }),
  ];
}

export function createCacheFlowScene(mode: number): FlowSceneDefinition {
  return {
    id: mode === 1 ? "cache-hit-flow" : "cache-miss-flow",
    title: "Cache hit e cache miss",
    description: "A mesma infraestrutura visual explica quando o cache resolve cedo e quando o banco entra em cena.",
    layouts: {
      desktop: { columns: 4, rows: 1 },
      mobile: { columns: 1, rows: 4 },
    },
    nodes: [
      {
        id: "client",
        role: "browser",
        label: "Cliente",
        description: "navegador ou app",
        placement: {
          desktop: { column: 1, row: 1 },
          mobile: { column: 1, row: 1 },
        },
      },
      {
        id: "server",
        role: "api",
        label: "Servidor",
        description: "API e regra",
        placement: {
          desktop: { column: 2, row: 1 },
          mobile: { column: 1, row: 2 },
        },
      },
      {
        id: "cache",
        role: "cache",
        label: "Cache",
        description: "atalho de leitura",
        placement: {
          desktop: { column: 3, row: 1 },
          mobile: { column: 1, row: 3 },
        },
      },
      {
        id: "database",
        role: "database",
        label: "Banco",
        description: "fonte de verdade",
        placement: {
          desktop: { column: 4, row: 1 },
          mobile: { column: 1, row: 4 },
        },
      },
    ],
    connections: [
      { id: "client-server", from: "client", to: "server", label: "HTTP", kind: "http" },
      { id: "server-cache", from: "server", to: "cache", label: "cache", kind: "cache" },
      { id: "server-database", from: "server", to: "database", label: "db", kind: "database" },
    ],
    steps: mode === 1 ? cacheHitSteps() : cacheMissSteps(),
  };
}
