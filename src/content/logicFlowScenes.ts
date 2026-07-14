import type { Representation } from "../core/trace-engine/types";
import type { FlowSceneConcept, FlowSceneDefinition, FlowSceneStep } from "../core/flow-scene/types";

function step(definition: FlowSceneStep): FlowSceneStep {
  return definition;
}

interface IfSceneCopy {
  inputLabel: string;
  inputDescription: string;
  decisionLabel: string;
  decisionDescription: string;
  allowedLabel: string;
  allowedDescription: string;
  blockedLabel: string;
  blockedDescription: string;
  resultLabel: string;
  resultDescription: string;
  legendInput: string;
  legendCondition: string;
  legendTrue: string;
  legendFalse: string;
  legendResult: string;
}

function buildIfCopy(age: number, representation: Representation): IfSceneCopy {
  if (representation === "practical") {
    return {
      inputLabel: "Pessoa tentando entrar",
      inputDescription: `${age} anos informados`,
      decisionLabel: "Regra de acesso",
      decisionDescription: "idade minima = 18",
      allowedLabel: "Acesso liberado",
      allowedDescription: "a interface permite continuar",
      blockedLabel: "Acesso bloqueado",
      blockedDescription: "a interface impede a entrada",
      resultLabel: "Tela atualizada",
      resultDescription: age >= 18 ? "mensagem: permitido" : "mensagem: bloqueado",
      legendInput: "Tentativa",
      legendCondition: "Regra",
      legendTrue: "Liberação",
      legendFalse: "Bloqueio",
      legendResult: "Feedback",
    };
  }

  if (representation === "memory") {
    return {
      inputLabel: "Valor em memória",
      inputDescription: `idade = ${age}`,
      decisionLabel: "Comparação booleana",
      decisionDescription: "idade >= 18",
      allowedLabel: "Bloco true",
      allowedDescription: 'return "permitido"',
      blockedLabel: "Bloco false",
      blockedDescription: 'return "bloqueado"',
      resultLabel: "Valor de retorno",
      resultDescription: age >= 18 ? 'retorno = "permitido"' : 'retorno = "bloqueado"',
      legendInput: "Leitura",
      legendCondition: "Comparação",
      legendTrue: "Bloco true",
      legendFalse: "Bloco false",
      legendResult: "Retorno",
    };
  }

  return {
    inputLabel: "Entrada",
    inputDescription: `idade = ${age}`,
    decisionLabel: "Condição",
    decisionDescription: "idade >= 18",
    allowedLabel: "Ramo true",
    allowedDescription: 'return "permitido"',
    blockedLabel: "Ramo false",
    blockedDescription: 'return "bloqueado"',
    resultLabel: "Resultado",
    resultDescription: `saida = "${age >= 18 ? "permitido" : "bloqueado"}"`,
    legendInput: "Entrada",
    legendCondition: "Avaliação",
    legendTrue: "Ramo true",
    legendFalse: "Ramo false",
    legendResult: "Resultado",
  };
}

function alternatePathConcept(
  age: number,
  allowed: boolean,
  copy: IfSceneCopy,
): FlowSceneConcept["alternatePath"] {
  const alternateAge = allowed ? 16 : 21;
  const alternateBoolean = !allowed;
  return {
    title: "E se o valor mudasse?",
    summary: `Se a entrada fosse ${alternateAge}, o fluxo seguiria pelo caminho ${alternateBoolean ? "true" : "false"} em vez do caminho atual.`,
    details: [
      `Caso atual: idade = ${age}, então a condição produz ${String(allowed)}.`,
      `Caso alternativo: idade = ${alternateAge}, então a condição produziria ${String(alternateBoolean)}.`,
      `Nesse cenário alternativo, o destaque iria para “${alternateBoolean ? copy.allowedLabel : copy.blockedLabel}” e não para “${allowed ? copy.allowedLabel : copy.blockedLabel}”.`,
    ],
  };
}

export function createIfFlowScene(
  age: number,
  representation: Representation = "abstract",
): FlowSceneDefinition {
  const allowed = age >= 18;
  const selectedBranchId = allowed ? "allowed" : "blocked";
  const unselectedBranchId = allowed ? "blocked" : "allowed";
  const selectedConnectionId = allowed ? "decision-allowed" : "decision-blocked";
  const selectedResultConnectionId = allowed ? "allowed-result" : "blocked-result";
  const branchSemantic = allowed ? "condition-true" : "condition-false";
  const branchLabel = allowed ? "true" : "false";
  const outcomeLabel = allowed ? "permitido" : "bloqueado";
  const copy = buildIfCopy(age, representation);

  return {
    id: `if-branch-${representation}-${age}`,
    title: "Condição if: escolha um ramo",
    description: "Uma entrada alimenta uma condição booleana, que escolhe um único ramo e produz um resultado.",
    legend: [
      { semantic: "request", label: copy.legendInput },
      { semantic: "condition", label: copy.legendCondition },
      { semantic: "success", label: copy.legendTrue },
      { semantic: "error", label: copy.legendFalse },
      { semantic: "result", label: copy.legendResult },
    ],
    layouts: {
      desktop: { columns: 4, rows: 3 },
      mobile: { columns: 1, rows: 5 },
    },
    nodes: [
      {
        id: "input",
        role: "input",
        label: copy.inputLabel,
        shortLabel: copy.inputLabel,
        description: copy.inputDescription,
        metadata: ["valor recebido", "caso atual"],
        accessibilityLabel: `Entrada da condição, idade igual a ${age}`,
        placement: {
          desktop: { column: 1, row: 2 },
          mobile: { column: 1, row: 1 },
        },
      },
      {
        id: "decision",
        role: "decision",
        label: copy.decisionLabel,
        shortLabel: copy.decisionLabel,
        description: copy.decisionDescription,
        metadata: ["comparação", "booleano"],
        accessibilityLabel: "Condição que decide entre os ramos true e false",
        placement: {
          desktop: { column: 2, row: 2 },
          mobile: { column: 1, row: 2 },
        },
      },
      {
        id: "allowed",
        role: "outcome",
        label: copy.allowedLabel,
        shortLabel: "True",
        description: copy.allowedDescription,
        metadata: ["acesso liberado"],
        accessibilityLabel: "Ramo verdadeiro, acesso permitido",
        placement: {
          desktop: { column: 3, row: 1 },
          mobile: { column: 1, row: 3 },
        },
      },
      {
        id: "blocked",
        role: "outcome",
        label: copy.blockedLabel,
        shortLabel: "False",
        description: copy.blockedDescription,
        metadata: ["acesso negado"],
        accessibilityLabel: "Ramo falso, acesso bloqueado",
        placement: {
          desktop: { column: 3, row: 3 },
          mobile: { column: 1, row: 4 },
        },
      },
      {
        id: "result",
        role: "result",
        label: copy.resultLabel,
        shortLabel: copy.resultLabel,
        description: copy.resultDescription,
        metadata: ["valor de retorno"],
        accessibilityLabel: `Resultado final da execução, ${outcomeLabel}`,
        placement: {
          desktop: { column: 4, row: 2 },
          mobile: { column: 1, row: 5 },
        },
      },
    ],
    connections: [
      {
        id: "input-decision",
        from: "input",
        to: "decision",
        label: representation === "practical" ? "tentativa" : "valor",
        kind: "decision",
      },
      {
        id: "decision-allowed",
        from: "decision",
        to: "allowed",
        label: "true",
        kind: "success",
      },
      {
        id: "decision-blocked",
        from: "decision",
        to: "blocked",
        label: "false",
        kind: "error",
      },
      {
        id: "allowed-result",
        from: "allowed",
        to: "result",
        label: representation === "practical" ? "feedback" : "return",
        kind: "success",
      },
      {
        id: "blocked-result",
        from: "blocked",
        to: "result",
        label: representation === "practical" ? "feedback" : "return",
        kind: "error",
      },
    ],
    steps: [
      step({
        id: "if-input",
        title: "A entrada define o caso",
        caption: `A execução começa com a entrada atual: idade = ${age}. Ainda não existe escolha de ramo.`,
        focusNodeId: "input",
        concept: {
          title: "Antes do if, existe um valor de entrada",
          bubble: "O if não decide no vazio; ele precisa de um valor concreto para avaliar.",
          summary: "Fluxo condicional sempre depende de um estado anterior. Aqui esse estado é a idade informada, que abastece a comparação booleana.",
          longform: [
            "Esse primeiro quadro existe para eliminar um erro comum de leitura: imaginar que o if é a origem do processo. Na prática, o if é apenas um ponto de decisão dentro de um fluxo que já recebeu dados.",
            representation === "practical"
              ? "Na leitura prática, a pessoa tentando entrar ainda não foi liberada nem bloqueada. O sistema só recebeu uma tentativa e ainda precisa aplicar a regra."
              : "Quando a entrada muda, a condição continua sendo a mesma, mas o caminho escolhido pode mudar completamente. Por isso o valor precisa aparecer com clareza antes da avaliação.",
          ],
          details: [
            representation === "practical"
              ? "A tentativa do usuário chega antes de qualquer resposta da interface."
              : "A entrada é o dado que chega ao trecho de código.",
            "Nesse exemplo, a regra compara a idade com o limite 18.",
            "Nenhum ramo executa antes de a condição produzir true ou false.",
          ],
          alternatePath: alternatePathConcept(age, allowed, copy),
          glossary: [
            { term: "Entrada", definition: "Valor disponível para o trecho de código tomar uma decisão." },
            { term: "Estado atual", definition: "Os dados concretos que existem no momento da execução." },
          ],
          pitfalls: [
            "Ler um if como uma instrução isolada e ignorar de onde veio o valor avaliado.",
          ],
          payloadTitle: "Valor do caso",
          payloadLines: [
            `idade = ${age}`,
            "limite = 18",
          ],
        },
        actions: [
          { type: "reset-node-states" },
          { type: "reset-connection-states" },
          { type: "clear-packets" },
          { type: "set-node-state", nodeId: "input", state: "active" },
        ],
      }),
      step({
        id: "if-read",
        title: "A condição recebe a entrada",
        caption: "O valor trafega até a condição para que a regra possa ser avaliada.",
        focusNodeId: "decision",
        concept: {
          title: "O valor precisa chegar à condição",
          bubble: "Antes de comparar, a execução precisa ler a entrada e levá-la até o ponto de decisão.",
          summary: "Este movimento representa a dependência causal do if: a condição só consegue responder depois de receber o valor que será comparado.",
          details: [
            "A seta deixa explícito que a condição depende da entrada.",
            representation === "practical"
              ? "Na leitura prática, a tentativa do usuário entra no sistema de regra antes de gerar qualquer mensagem de acesso."
              : "O dado que trafega não é uma requisição HTTP; aqui ele representa o valor da variável chegando ao ponto de decisão.",
            "Mesmo em código simples, visualizar essa passagem ajuda a entender por que a avaliação não é mágica.",
          ],
          alternatePath: alternatePathConcept(age, allowed, copy),
          payloadTitle: representation === "practical" ? "Tentativa recebida" : "Valor lido",
          payloadLines: [
            `idade = ${age}`,
          ],
        },
        actions: [
          { type: "reset-node-states" },
          { type: "reset-connection-states" },
          { type: "clear-packets" },
          { type: "set-node-state", nodeId: "input", state: "sending" },
          { type: "set-node-state", nodeId: "decision", state: "receiving" },
          { type: "set-connection-state", connectionId: "input-decision", state: "transmitting" },
          {
            type: "send-packet",
            packet: {
              id: "if-input-value",
              from: "input",
              to: "decision",
              semantic: "request",
              label: "idade",
              payloadLabel: String(age),
              payloadLines: [`idade = ${age}`],
            },
          },
        ],
      }),
      step({
        id: "if-compare",
        title: "A comparação produz um booleano",
        caption: `${age} >= 18 resulta em ${String(allowed)}. A condição decide, mas ainda executa só um caminho.`,
        focusNodeId: "decision",
        concept: {
          title: "Condição booleana",
          bubble: "A comparação transforma valores em uma resposta binária: true ou false.",
          summary: "O papel do if não é executar dois blocos e depois escolher. Primeiro a comparação produz um booleano; só depois o fluxo segue por um único ramo.",
          longform: [
            "O resultado booleano é a peça central da decisão. Ele resume a pergunta 'idade é maior ou igual a 18?' em uma resposta mínima, que o runtime usa para redirecionar a execução.",
            representation === "practical"
              ? "Na leitura prática, esse booleano corresponde ao veredito da regra de acesso. Ainda não é a mensagem final na tela; é só a decisão interna que vai definir o próximo quadro."
              : "Essa separação é importante pedagogicamente: comparação e desvio são operações diferentes. Uma produz informação; a outra consome essa informação para escolher um caminho.",
          ],
          details: [
            "A condição atual é `idade >= 18`.",
            `Com idade ${age}, o booleano calculado é ${String(allowed)}.`,
            "O ramo não escolhido continua sem execução.",
          ],
          alternatePath: alternatePathConcept(age, allowed, copy),
          glossary: [
            { term: "Booleano", definition: "Tipo de dado que só pode assumir true ou false." },
            { term: "Condição", definition: "Expressão avaliada para decidir se o fluxo entra em um ramo ou outro." },
          ],
          pitfalls: [
            "Confundir o booleano com o resultado final do programa. O booleano só escolhe o próximo passo.",
          ],
          payloadTitle: "Expressão avaliada",
          payloadLines: [
            "idade >= 18",
            `${age} >= 18 -> ${String(allowed)}`,
          ],
        },
        actions: [
          { type: "reset-node-states" },
          { type: "reset-connection-states" },
          { type: "clear-packets" },
          { type: "set-node-state", nodeId: "input", state: "waiting" },
          { type: "set-node-state", nodeId: "decision", state: "processing" },
          { type: "set-connection-state", connectionId: "input-decision", state: "active" },
        ],
      }),
      step({
        id: "if-branch",
        title: "O fluxo escolhe um único ramo",
        caption: `A condição envia o fluxo para o ramo ${branchLabel}; o outro caminho permanece sem execução.`,
        focusNodeId: selectedBranchId,
        concept: {
          title: "Branch não significa duplicar execução",
          bubble: "Depois do booleano, a execução segue por um único caminho.",
          summary: "O if atua como um desvio controlado. Ele escolhe um ramo coerente com o resultado da condição e deixa o ramo oposto apenas como alternativa não executada.",
          longform: [
            "Esse é o ponto onde a linearidade visual ajuda mais: o pacote sai do nó de decisão e torna explícito qual bloco receberá o controle. O outro ramo continua visível, mas desativado.",
            representation === "practical"
              ? "Na leitura prática, isso responde diretamente à pergunta 'o que aconteceria se fosse o outro caso?'. O quadro mostra o ramo atual em trânsito e o outro como possibilidade não tomada."
              : "Em fluxos mais complexos, esse mesmo padrão pode explicar else if, switch e tabelas de decisão sem recorrer apenas a balões textuais.",
          ],
          details: [
            `O booleano ${String(allowed)} ativa o ramo ${branchLabel}.`,
            "A cena reduz a ênfase do ramo oposto para mostrar que ele existe, mas não foi executado.",
            "Um if/else bem formado escolhe exatamente um dos dois blocos.",
          ],
          alternatePath: alternatePathConcept(age, allowed, copy),
          pitfalls: [
            "Achar que o bloco não escolhido 'executa escondido'.",
          ],
          payloadTitle: "Escolha do ramo",
          payloadLines: [
            `booleano = ${String(allowed)}`,
            `destino = ramo ${branchLabel}`,
          ],
        },
        actions: [
          { type: "reset-node-states" },
          { type: "reset-connection-states" },
          { type: "clear-packets" },
          { type: "set-node-state", nodeId: "input", state: "waiting" },
          { type: "set-node-state", nodeId: "decision", state: "sending" },
          { type: "set-node-state", nodeId: selectedBranchId, state: "receiving" },
          { type: "set-node-state", nodeId: unselectedBranchId, state: "disabled" },
          { type: "set-connection-state", connectionId: "input-decision", state: "active" },
          { type: "set-connection-state", connectionId: selectedConnectionId, state: "transmitting" },
          {
            type: "send-packet",
            packet: {
              id: `if-branch-${branchLabel}`,
              from: "decision",
              to: selectedBranchId,
              semantic: branchSemantic,
              label: branchLabel,
              payloadLabel: outcomeLabel,
              payloadLines: [
                `resultado = ${String(allowed)}`,
                `ramo = ${branchLabel}`,
              ],
            },
          },
        ],
      }),
      step({
        id: "if-return",
        title: "O ramo escolhido produz o resultado",
        caption: `Somente o ramo ${branchLabel} devolve "${outcomeLabel}" para a saída final.`,
        focusNodeId: "result",
        concept: {
          title: "O resultado nasce do ramo executado",
          bubble: "Depois da escolha, só o bloco ativo pode produzir o valor final.",
          summary: "O retorno do fluxo não vem da condição diretamente. Ele vem do bloco que foi realmente executado após o desvio.",
          longform: [
            "Esse fechamento ajuda a distinguir três papéis que costumam ser misturados: a entrada abastece, a condição decide e o ramo executado produz a saída.",
            representation === "practical"
              ? "Na leitura prática, isso corresponde ao momento em que a interface finalmente mostra o efeito da regra: liberar ou bloquear a continuação."
              : "Quando você entende essa cadeia causal, fica mais fácil ler não só `if`, mas também guard clauses, early return e qualquer fluxo condicional que dependa de uma decisão anterior.",
          ],
          details: [
            `O valor final neste caso é "${outcomeLabel}".`,
            "O ramo oposto continuou fora da execução do começo ao fim.",
            "A visualização continua compreensível mesmo pausada porque a direção do fluxo e o estado de cada nó permanecem explícitos.",
          ],
          alternatePath: alternatePathConcept(age, allowed, copy),
          glossary: [
            { term: "Ramo", definition: "Bloco de código executado apenas se a condição escolher aquele caminho." },
            { term: "Retorno", definition: "Valor final produzido pelo fluxo depois da execução do ramo selecionado." },
          ],
          payloadTitle: "Saída final",
          payloadLines: [
            `return "${outcomeLabel}"`,
          ],
        },
        actions: [
          { type: "reset-node-states" },
          { type: "reset-connection-states" },
          { type: "clear-packets" },
          { type: "set-node-state", nodeId: "input", state: "success" },
          { type: "set-node-state", nodeId: "decision", state: "success" },
          { type: "set-node-state", nodeId: selectedBranchId, state: "sending" },
          { type: "set-node-state", nodeId: unselectedBranchId, state: "disabled" },
          { type: "set-node-state", nodeId: "result", state: "receiving" },
          { type: "set-connection-state", connectionId: selectedResultConnectionId, state: "transmitting" },
          {
            type: "send-packet",
            packet: {
              id: `if-result-${outcomeLabel}`,
              from: selectedBranchId,
              to: "result",
              semantic: "result",
              label: "return",
              payloadLabel: outcomeLabel,
              payloadLines: [`return "${outcomeLabel}"`],
            },
          },
        ],
      }),
    ],
  };
}

interface LoopSceneCopy {
  startLabel: string;
  startDescription: string;
  decisionLabel: string;
  decisionDescription: string;
  bodyLabel: string;
  bodyDescription: string;
  incrementLabel: string;
  incrementDescription: string;
  resultLabel: string;
  resultDescription: string;
  legendInput: string;
  legendCondition: string;
  legendTrue: string;
  legendFalse: string;
  legendResult: string;
}

function buildLoopCopy(limit: number, representation: Representation): LoopSceneCopy {
  if (representation === "practical") {
    return {
      startLabel: "Partida",
      startDescription: "contador começa em 0",
      decisionLabel: "Ainda repete?",
      decisionDescription: `volta atual < ${limit}`,
      bodyLabel: "Tarefa da volta",
      bodyDescription: "somar o valor atual",
      incrementLabel: "Próxima volta",
      incrementDescription: "avançar o contador",
      resultLabel: "Total acumulado",
      resultDescription: `resultado esperado = ${(limit * (limit - 1)) / 2}`,
      legendInput: "Entrada",
      legendCondition: "Teste",
      legendTrue: "Continua",
      legendFalse: "Encerra",
      legendResult: "Resultado",
    };
  }

  if (representation === "memory") {
    return {
      startLabel: "Inicialização",
      startDescription: "WRITE i = 0",
      decisionLabel: "Comparação",
      decisionDescription: `i < ${limit}`,
      bodyLabel: "Corpo do loop",
      bodyDescription: "WRITE soma += i",
      incrementLabel: "Incremento",
      incrementDescription: "i++",
      resultLabel: "Return",
      resultDescription: `return ${(limit * (limit - 1)) / 2}`,
      legendInput: "Write",
      legendCondition: "Compare",
      legendTrue: "Itera",
      legendFalse: "Sai",
      legendResult: "Return",
    };
  }

  return {
    startLabel: "Inicialização",
    startDescription: "i = 0",
    decisionLabel: "Condição",
    decisionDescription: `i < ${limit}`,
    bodyLabel: "Corpo",
    bodyDescription: "soma += i",
    incrementLabel: "Incremento",
    incrementDescription: "i avança",
    resultLabel: "Resultado",
    resultDescription: `soma final = ${(limit * (limit - 1)) / 2}`,
    legendInput: "Início",
    legendCondition: "Condição",
    legendTrue: "Loop continua",
    legendFalse: "Loop para",
    legendResult: "Resultado",
  };
}

function loopAlternatePath(limit: number): FlowSceneConcept["alternatePath"] {
  const alternateLimit = limit < 5 ? limit + 1 : Math.max(1, limit - 1);
  return {
    title: "E se o limite mudasse?",
    summary: `Se o limite fosse ${alternateLimit}, o loop teria ${alternateLimit} verificações úteis e produziria soma ${(alternateLimit * (alternateLimit - 1)) / 2}.`,
    details: [
      `No caso atual, limite = ${limit} e o corpo executa ${limit} vezes.`,
      `Com limite = ${alternateLimit}, o caminho de repetição ficaria ${alternateLimit > limit ? "mais longo" : "mais curto"}.`,
      "O padrão visual permanece o mesmo: verificar, executar o corpo e voltar para a condição até o teste falhar.",
    ],
  };
}

export function createLoopFlowScene(
  limit: number,
  representation: Representation = "abstract",
): FlowSceneDefinition {
  const safeLimit = Math.min(5, Math.max(1, limit));
  const copy = buildLoopCopy(safeLimit, representation);
  const finalSum = (safeLimit * (safeLimit - 1)) / 2;
  const steps: FlowSceneStep[] = [
    step({
      id: "loop-start",
      title: "O loop inicializa o estado",
      caption: "Antes da repetição começar, o contador é zerado e o fluxo se prepara para o primeiro teste.",
      focusNodeId: "start",
      concept: {
        title: "Inicialização do loop",
        bubble: "Todo for começa definindo um estado inicial confiável.",
        summary: "O contador nasce em 0. Esse valor inicial define de onde o ciclo parte e evita uma primeira iteração ambígua.",
        details: [
          "A inicialização acontece uma única vez.",
          `O limite configurado para este caso é ${safeLimit}.`,
          "O corpo ainda não executou; o próximo passo é testar a condição.",
        ],
        alternatePath: loopAlternatePath(safeLimit),
        payloadTitle: "Estado inicial",
        payloadLines: [
          "i = 0",
          "soma = 0",
          `limite = ${safeLimit}`,
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "start", state: "active" },
      ],
    }),
  ];

  let sum = 0;
  for (let index = 0; index < safeLimit; index += 1) {
    steps.push(
      step({
        id: `loop-check-${index}`,
        title: "A condição decide se o loop continua",
        caption: `${index} < ${safeLimit} é true, então a execução pode entrar em mais uma volta.`,
        focusNodeId: "decision",
        concept: {
          title: "Teste de continuação",
          bubble: "Cada volta retorna para a mesma pergunta: ainda existe iteração válida pela frente?",
          summary: "O for não entra no corpo automaticamente. Primeiro ele testa a condição para descobrir se ainda pode repetir.",
          details: [
            `O contador atual é i = ${index}.`,
            `A comparação avaliada é ${index} < ${safeLimit}.`,
            "Como o resultado é true, o fluxo segue para o corpo do loop.",
          ],
          alternatePath: loopAlternatePath(safeLimit),
          payloadTitle: "Comparação atual",
          payloadLines: [
            `i = ${index}`,
            `${index} < ${safeLimit} -> true`,
          ],
        },
        actions: [
          { type: "reset-node-states" },
          { type: "reset-connection-states" },
          { type: "clear-packets" },
          { type: "set-node-state", nodeId: index === 0 ? "start" : "increment", state: "sending" },
          { type: "set-node-state", nodeId: "decision", state: "receiving" },
          {
            type: "set-connection-state",
            connectionId: index === 0 ? "start-decision" : "increment-decision",
            state: "transmitting",
          },
          {
            type: "send-packet",
            packet: {
              id: `loop-check-packet-${index}`,
              from: index === 0 ? "start" : "increment",
              to: "decision",
              semantic: "request",
              label: "i",
              payloadLabel: String(index),
              payloadLines: [`i = ${index}`],
            },
          },
        ],
      }),
    );

    sum += index;
    steps.push(
      step({
        id: `loop-body-${index}`,
        title: "O corpo executa a volta atual",
        caption: `A volta ${index + 1} soma i = ${index}; o acumulado passa a valer ${sum}.`,
        focusNodeId: "body",
        concept: {
          title: "Corpo do loop",
          bubble: "Quando a condição é true, o corpo recebe o controle e aplica a ação da iteração.",
          summary: "Este é o trabalho útil do loop. Aqui o acumulador lê o contador atual e incorpora esse valor ao total.",
          details: [
            `Nesta volta, i = ${index}.`,
            `Depois da escrita, soma = ${sum}.`,
            "Ao final do corpo, o fluxo se prepara para avançar o contador e testar a condição novamente.",
          ],
          alternatePath: loopAlternatePath(safeLimit),
          payloadTitle: "Efeito da volta",
          payloadLines: [
            `soma += ${index}`,
            `soma = ${sum}`,
          ],
        },
        actions: [
          { type: "reset-node-states" },
          { type: "reset-connection-states" },
          { type: "clear-packets" },
          { type: "set-node-state", nodeId: "decision", state: "sending" },
          { type: "set-node-state", nodeId: "body", state: "receiving" },
          { type: "set-node-state", nodeId: "increment", state: "active" },
          { type: "set-connection-state", connectionId: "decision-body", state: "transmitting" },
          {
            type: "send-packet",
            packet: {
              id: `loop-body-packet-${index}`,
              from: "decision",
              to: "body",
              semantic: "condition-true",
              label: "true",
              payloadLabel: `soma = ${sum}`,
              payloadLines: [
                `${index} < ${safeLimit} -> true`,
                `soma = ${sum}`,
              ],
            },
          },
        ],
      }),
    );
  }

  steps.push(
    step({
      id: "loop-stop",
      title: "A condição falha e o loop termina",
      caption: `${safeLimit} < ${safeLimit} é false. O corpo não executa de novo e o resultado final é ${finalSum}.`,
      focusNodeId: "result",
      concept: {
        title: "Saída do ciclo",
        bubble: "O loop para quando a condição deixa de ser verdadeira.",
        summary: "A mesma condição que permitia novas voltas agora bloqueia a continuidade. O fluxo não toca o corpo outra vez e libera o resultado.",
        details: [
          `No teste final, i = ${safeLimit}.`,
          `${safeLimit} < ${safeLimit} produz false.`,
          `A soma entregue na saída é ${finalSum}.`,
        ],
        alternatePath: loopAlternatePath(safeLimit),
        payloadTitle: "Encerramento",
        payloadLines: [
          `${safeLimit} < ${safeLimit} -> false`,
          `return ${finalSum}`,
        ],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "increment", state: "sending" },
        { type: "set-node-state", nodeId: "decision", state: "sending" },
        { type: "set-node-state", nodeId: "result", state: "receiving" },
        { type: "set-connection-state", connectionId: "decision-result", state: "transmitting" },
        {
          type: "send-packet",
          packet: {
            id: "loop-stop-packet",
            from: "decision",
            to: "result",
            semantic: "condition-false",
            label: "false",
            payloadLabel: String(finalSum),
            payloadLines: [
              `${safeLimit} < ${safeLimit} -> false`,
              `resultado = ${finalSum}`,
            ],
          },
        },
      ],
    }),
  );

  return {
    id: `for-loop-${representation}-${safeLimit}`,
    title: "Loop for: estado que evolui",
    description: "O fluxo sai da inicialização, testa a condição, executa o corpo e só encerra quando a condição falha.",
    legend: [
      { semantic: "request", label: copy.legendInput },
      { semantic: "condition", label: copy.legendCondition },
      { semantic: "success", label: copy.legendTrue },
      { semantic: "error", label: copy.legendFalse },
      { semantic: "result", label: copy.legendResult },
    ],
    layouts: {
      desktop: { columns: 5, rows: 1 },
      mobile: { columns: 1, rows: 5 },
    },
    nodes: [
      {
        id: "start",
        role: "input",
        label: copy.startLabel,
        description: copy.startDescription,
        placement: { desktop: { column: 1, row: 1 }, mobile: { column: 1, row: 1 } },
      },
      {
        id: "decision",
        role: "decision",
        label: copy.decisionLabel,
        description: copy.decisionDescription,
        placement: { desktop: { column: 2, row: 1 }, mobile: { column: 1, row: 2 } },
      },
      {
        id: "body",
        role: "outcome",
        label: copy.bodyLabel,
        description: copy.bodyDescription,
        placement: { desktop: { column: 3, row: 1 }, mobile: { column: 1, row: 3 } },
      },
      {
        id: "increment",
        role: "outcome",
        label: copy.incrementLabel,
        description: copy.incrementDescription,
        placement: { desktop: { column: 4, row: 1 }, mobile: { column: 1, row: 4 } },
      },
      {
        id: "result",
        role: "result",
        label: copy.resultLabel,
        description: copy.resultDescription,
        placement: { desktop: { column: 5, row: 1 }, mobile: { column: 1, row: 5 } },
      },
    ],
    connections: [
      { id: "start-decision", from: "start", to: "decision", label: "início", kind: "decision" },
      { id: "decision-body", from: "decision", to: "body", label: "true", kind: "success" },
      { id: "increment-decision", from: "increment", to: "decision", label: "repetir", kind: "decision" },
      { id: "decision-result", from: "decision", to: "result", label: "false", kind: "error" },
    ],
    steps,
  };
}

interface SearchItem {
  id: string;
  value: number;
  abstractLabel: string;
  practicalLabel: string;
  memoryLabel: string;
}

const searchItems: SearchItem[] = [
  { id: "item-0", value: 4, abstractLabel: "4", practicalLabel: "Câmera", memoryLabel: "0x100 · 4" },
  { id: "item-1", value: 8, abstractLabel: "8", practicalLabel: "Mapas", memoryLabel: "0x104 · 8" },
  { id: "item-2", value: 12, abstractLabel: "12", practicalLabel: "Música", memoryLabel: "0x108 · 12" },
  { id: "item-3", value: 16, abstractLabel: "16", practicalLabel: "Fotos", memoryLabel: "0x10C · 16" },
];

function searchTargetPracticalLabel(target: number) {
  return searchItems.find((item) => item.value === target)?.practicalLabel ?? `valor ${target}`;
}

function searchAlternatePath(
  target: number,
  foundIndex: number,
): FlowSceneConcept["alternatePath"] {
  const alternateTarget = foundIndex === -1 ? 12 : 20;
  const alternateFoundIndex = searchItems.findIndex((item) => item.value === alternateTarget);
  return {
    title: "E se o alvo fosse outro?",
    summary: alternateFoundIndex === -1
      ? `Se o alvo fosse ${alternateTarget}, a busca tocaria todos os itens e terminaria com retorno -1.`
      : `Se o alvo fosse ${alternateTarget}, a busca pararia mais cedo, no índice ${alternateFoundIndex}.`,
    details: [
      foundIndex === -1
        ? `No caso atual, ${target} não existe na coleção e o fluxo percorre todos os itens.`
        : `No caso atual, ${target} é encontrado no índice ${foundIndex}.`,
      alternateFoundIndex === -1
        ? `No caminho alternativo, ${alternateTarget} não seria encontrado.`
        : `No caminho alternativo, ${alternateTarget} encerraria a busca no índice ${alternateFoundIndex}.`,
      "A busca linear sempre anda item por item, só mudando o ponto em que ela consegue parar.",
    ],
  };
}

export function createLinearSearchFlowScene(
  target: number,
  representation: Representation = "abstract",
): FlowSceneDefinition {
  const foundIndex = searchItems.findIndex((item) => item.value === target);
  const checkedItems = foundIndex === -1 ? searchItems : searchItems.slice(0, foundIndex + 1);
  const resultLabel = foundIndex === -1 ? "-1" : String(foundIndex);
  const targetPractical = searchTargetPracticalLabel(target);

  const targetNodeLabel = representation === "practical" ? "Busca atual" : representation === "memory" ? "Alvo em memória" : "Alvo";
  const targetNodeDescription = representation === "practical"
    ? `procurar ${targetPractical}`
    : representation === "memory"
      ? `target = ${target}`
      : `valor ${target}`;
  const resultNodeLabel = representation === "practical" ? "Posição encontrada" : representation === "memory" ? "Return" : "Resultado";
  const resultNodeDescription = foundIndex === -1
    ? (representation === "practical" ? "item ausente" : "retorno = -1")
    : (representation === "practical" ? `índice ${foundIndex}` : `retorno = ${foundIndex}`);

  const steps: FlowSceneStep[] = [
    step({
      id: "search-start",
      title: "A busca define o alvo",
      caption: `O algoritmo sabe que está procurando ${target}, mas ainda não sabe onde esse valor está.`,
      focusNodeId: "target",
      concept: {
        title: "Buscar não é o mesmo que já saber a posição",
        bubble: "A busca linear conhece o alvo, mas precisa percorrer a coleção para descobrir onde ele está.",
        summary: "Sem índice auxiliar, o algoritmo só tem um caminho confiável: começar do primeiro item e comparar um por um.",
        details: [
          `O alvo atual é ${target}.`,
          "Nenhum item foi comparado ainda.",
          "O próximo passo é tocar o primeiro elemento da sequência.",
        ],
        alternatePath: searchAlternatePath(target, foundIndex),
        payloadTitle: "Alvo procurado",
        payloadLines: [`target = ${target}`],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: "target", state: "active" },
      ],
    }),
  ];

  checkedItems.forEach((item, index) => {
    const match = item.value === target;
    steps.push(
      step({
        id: `search-compare-${item.value}`,
        title: "A busca compara o próximo item",
        caption: match
          ? `${item.value} corresponde ao alvo. A busca finalmente pode parar.`
          : `${item.value} não é ${target}, então o cursor segue adiante.`,
        focusNodeId: item.id,
        concept: {
          title: match ? "Comparação bem-sucedida" : "Comparação falhou",
          bubble: match
            ? "A igualdade encerra a caminhada. Não é preciso olhar os itens restantes."
            : "Quando a igualdade falha, a busca linear só tem uma opção: avançar para o próximo item.",
          summary: match
            ? "A condição de igualdade finalmente foi satisfeita. O algoritmo agora já sabe qual posição retornar."
            : "A busca linear não pula posições. Cada falha empurra o cursor apenas um passo para frente.",
          details: [
            `Item atual: ${item.value}.`,
            match ? `${item.value} === ${target} produz true.` : `${item.value} === ${target} produz false.`,
            match ? "Os itens seguintes deixam de importar para este caso." : "A sequência continua porque o alvo ainda não foi encontrado.",
          ],
          alternatePath: searchAlternatePath(target, foundIndex),
          payloadTitle: "Comparação atual",
          payloadLines: [
            `item = ${item.value}`,
            `${item.value} === ${target} -> ${String(match)}`,
          ],
        },
        actions: [
          { type: "reset-node-states" },
          { type: "reset-connection-states" },
          { type: "clear-packets" },
          { type: "set-node-state", nodeId: index === 0 ? "target" : checkedItems[index - 1].id, state: "sending" },
          { type: "set-node-state", nodeId: item.id, state: match ? "receiving" : "receiving" },
          {
            type: "set-connection-state",
            connectionId: index === 0 ? "target-item-0" : `${checkedItems[index - 1].id}-${item.id}`,
            state: "transmitting",
          },
          {
            type: "send-packet",
            packet: {
              id: `search-packet-${item.value}`,
              from: index === 0 ? "target" : checkedItems[index - 1].id,
              to: item.id,
              semantic: match ? "condition-true" : "condition-false",
              label: "comparar",
              payloadLabel: String(item.value),
              payloadLines: [`${item.value} === ${target}`],
            },
          },
        ],
      }),
    );
  });

  const finalItem = checkedItems[checkedItems.length - 1];
  steps.push(
    step({
      id: "search-return",
      title: foundIndex === -1 ? "A busca termina sem encontrar o alvo" : "A busca retorna a posição encontrada",
      caption: foundIndex === -1
        ? `Depois de tocar todos os itens, a função devolve -1 para indicar ausência de ${target}.`
        : `A função devolve o índice ${foundIndex}, que aponta para o item ${target}.`,
      focusNodeId: "result",
      concept: {
        title: foundIndex === -1 ? "Retorno de ausência" : "Retorno da posição",
        bubble: foundIndex === -1
          ? "Quando nenhum item bate com o alvo, a busca precisa comunicar essa ausência explicitamente."
          : "Depois da igualdade, o algoritmo não retorna o valor; ele retorna a posição em que o encontrou.",
        summary: foundIndex === -1
          ? "O fluxo completo termina em -1. Esse valor sinaliza que a caminhada acabou sem sucesso."
          : "O fluxo termina no índice do item encontrado. O retorno aponta onde o alvo estava na sequência.",
        details: [
          foundIndex === -1 ? "Todos os itens da coleção foram tocados." : `A busca parou no índice ${foundIndex}.`,
          foundIndex === -1 ? "Não existe atalho extra depois disso." : "Os itens restantes não precisam ser lidos.",
          `O valor retornado neste caso é ${resultLabel}.`,
        ],
        alternatePath: searchAlternatePath(target, foundIndex),
        payloadTitle: "Valor devolvido",
        payloadLines: [`return ${resultLabel}`],
      },
      actions: [
        { type: "reset-node-states" },
        { type: "reset-connection-states" },
        { type: "clear-packets" },
        { type: "set-node-state", nodeId: finalItem.id, state: "sending" },
        { type: "set-node-state", nodeId: "result", state: "receiving" },
        { type: "set-connection-state", connectionId: `${finalItem.id}-result`, state: "transmitting" },
        {
          type: "send-packet",
          packet: {
            id: "search-result-packet",
            from: finalItem.id,
            to: "result",
            semantic: foundIndex === -1 ? "result" : "result",
            label: "return",
            payloadLabel: resultLabel,
            payloadLines: [`return ${resultLabel}`],
          },
        },
      ],
    }),
  );

  return {
    id: `linear-search-${representation}-${target}`,
    title: "Busca linear: encontre o alvo",
    description: "O cursor percorre a sequência item por item até encontrar o alvo ou esgotar a coleção.",
    legend: [
      { semantic: "request", label: "Alvo" },
      { semantic: "condition", label: "Comparação" },
      { semantic: "error", label: "Não bateu" },
      { semantic: "success", label: "Encontrou" },
      { semantic: "result", label: "Retorno" },
    ],
    layouts: {
      desktop: { columns: 6, rows: 1 },
      mobile: { columns: 1, rows: 6 },
    },
    nodes: [
      {
        id: "target",
        role: "input",
        label: targetNodeLabel,
        description: targetNodeDescription,
        placement: { desktop: { column: 1, row: 1 }, mobile: { column: 1, row: 1 } },
      },
      ...searchItems.map((item, index) => ({
        id: item.id,
        role: "outcome" as const,
        label: representation === "practical"
          ? item.practicalLabel
          : representation === "memory"
            ? item.memoryLabel
            : item.abstractLabel,
        description: representation === "practical"
          ? `índice ${index} · valor ${item.value}`
          : representation === "memory"
            ? `slot ${index}`
            : `índice ${index}`,
        placement: {
          desktop: { column: index + 2, row: 1 },
          mobile: { column: 1, row: index + 2 },
        },
      })),
      {
        id: "result",
        role: "result",
        label: resultNodeLabel,
        description: resultNodeDescription,
        placement: { desktop: { column: 6, row: 1 }, mobile: { column: 1, row: 6 } },
      },
    ],
    connections: [
      { id: "target-item-0", from: "target", to: "item-0", label: "início", kind: "decision" },
      { id: "item-0-item-1", from: "item-0", to: "item-1", label: "avançar", kind: "error" },
      { id: "item-1-item-2", from: "item-1", to: "item-2", label: "avançar", kind: "error" },
      { id: "item-2-item-3", from: "item-2", to: "item-3", label: "avançar", kind: "error" },
      { id: "item-0-result", from: "item-0", to: "result", label: "retornar", kind: "success" },
      { id: "item-1-result", from: "item-1", to: "result", label: "retornar", kind: "success" },
      { id: "item-2-result", from: "item-2", to: "result", label: "retornar", kind: "success" },
      { id: "item-3-result", from: "item-3", to: "result", label: "retornar", kind: foundIndex === -1 ? "error" : "success" },
    ],
    steps,
  };
}
