import type { FlowConnectionKind, FlowNodeRole, FlowPacketSemantic, FlowSceneDefinition, FlowSceneStep } from "../core/flow-scene/types";
import type { LessonDefinition, Representation, TraceDefinition, TraceStep } from "../core/trace-engine/types";

function step(definition: FlowSceneStep): FlowSceneStep {
  return definition;
}

const eventTitles: Record<string, string> = {
  OBSERVE: "Observar",
  START: "Começar",
  INPUT: "Entrada",
  INITIALIZE: "Inicializar",
  READ_MEMORY: "Ler valor",
  WRITE_MEMORY: "Atualizar estado",
  COMPARE: "Comparar",
  BRANCH: "Escolher caminho",
  CHECK: "Verificar",
  SHIFT: "Deslocar",
  INSERT: "Inserir",
  REMOVE: "Remover",
  LINK: "Conectar",
  UNLINK: "Desconectar",
  PUSH: "Empilhar",
  POP: "Desempilhar",
  MATCH: "Conferir igualdade",
  HASH: "Calcular hash",
  ROUTE: "Direcionar",
  COLLISION: "Detectar colisão",
  CHAIN: "Encadear",
  EXPAND: "Expandir",
  FOUND: "Encontrar",
  DONE: "Concluir",
  RETURN: "Retornar",
  ROTATE: "Rotacionar",
  IMBALANCE: "Detectar desbalanço",
  ALLOCATE: "Alocar",
  DETACH: "Destacar",
  RELINK: "Religar",
  CALL_FUNCTION: "Chamar função",
  PUSH_STACK_FRAME: "Abrir frame",
};

function humanizeEventLabel(label: string) {
  return eventTitles[label] ?? label.replaceAll("_", " ").toLowerCase();
}

function roleForStep(stepIndex: number, totalSteps: number, traceStep: TraceStep): FlowNodeRole {
  if (stepIndex === 0) return "input";
  if (stepIndex === totalSteps - 1) return "result";
  if (["COMPARE", "BRANCH", "CHECK", "MATCH", "HASH", "ROUTE"].includes(traceStep.eventLabel)) return "decision";
  return "outcome";
}

function packetSemanticForStep(traceStep: TraceStep, targetRole: FlowNodeRole): FlowPacketSemantic {
  if (targetRole === "result") return "result";
  if (targetRole === "decision") return "request";
  if (["COLLISION", "REJECT", "MISS", "TIMEOUT", "FAIL"].some((token) => traceStep.eventLabel.includes(token))) {
    return "condition-false";
  }
  return "condition-true";
}

function connectionKindForStep(traceStep: TraceStep, targetRole: FlowNodeRole): FlowConnectionKind {
  if (targetRole === "result") return "response";
  if (targetRole === "decision") return "decision";
  if (["COLLISION", "REJECT", "MISS", "TIMEOUT", "FAIL"].some((token) => traceStep.eventLabel.includes(token))) {
    return "error";
  }
  return "success";
}

function compactText(text: string, fallback: string, max = 44) {
  const normalized = (text || fallback).replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

function bubbleText(step: TraceStep, representation: Representation) {
  return step.captions[representation] ?? step.description;
}

function legendForRoles(roles: FlowNodeRole[]) {
  const legend = [];
  if (roles.includes("input")) legend.push({ semantic: "request" as const, label: "Entrada" });
  if (roles.includes("decision")) legend.push({ semantic: "condition" as const, label: "Avaliação" });
  if (roles.includes("outcome")) legend.push({ semantic: "success" as const, label: "Transformação" });
  if (roles.includes("result")) legend.push({ semantic: "result" as const, label: "Saída" });
  return legend;
}

export function createGeneratedFlowScene(
  lesson: LessonDefinition,
  trace: TraceDefinition,
  representation: Representation,
): FlowSceneDefinition {
  const desktopColumns = Math.min(4, Math.max(1, trace.steps.length));
  const desktopRows = Math.ceil(trace.steps.length / desktopColumns);
  const roles = trace.steps.map((traceStep, index) => roleForStep(index, trace.steps.length, traceStep));
  const duplicateCounts = new Map<string, number>();

  const nodes = trace.steps.map((traceStep, index) => {
    const title = humanizeEventLabel(traceStep.eventLabel);
    const nextCount = (duplicateCounts.get(title) ?? 0) + 1;
    duplicateCounts.set(title, nextCount);
    const repeated = trace.steps.filter((candidate) => humanizeEventLabel(candidate.eventLabel) === title).length > 1;
    const label = repeated ? `${title} ${nextCount}` : title;
    const description = compactText(bubbleText(traceStep, representation), traceStep.description);

    return {
      id: traceStep.id,
      role: roles[index],
      label,
      shortLabel: label,
      description,
      metadata: [traceStep.metrics.complexity, traceStep.eventLabel],
      accessibilityLabel: `${label}. ${traceStep.description}`,
      placement: {
        desktop: {
          column: (index % desktopColumns) + 1,
          row: Math.floor(index / desktopColumns) + 1,
        },
        mobile: {
          column: 1,
          row: index + 1,
        },
      },
    };
  });

  const connections = trace.steps.slice(1).map((traceStep, index) => ({
    id: `${trace.steps[index].id}-${traceStep.id}`,
    from: trace.steps[index].id,
    to: traceStep.id,
    label: compactText(humanizeEventLabel(traceStep.eventLabel), "passo", 18),
    kind: connectionKindForStep(traceStep, roles[index + 1]),
  }));

  const sceneSteps = trace.steps.map((traceStep, index) => {
    const previousStep = trace.steps[index - 1];
    const currentRole = roles[index];
    const actions: FlowSceneStep["actions"] = [
      { type: "reset-node-states" },
      { type: "reset-connection-states" },
      { type: "clear-packets" },
    ];

    if (index === 0) {
      actions.push({ type: "set-node-state", nodeId: traceStep.id, state: "active" });
    } else {
      actions.push({ type: "set-node-state", nodeId: previousStep.id, state: "sending" });
      actions.push({
        type: "set-node-state",
        nodeId: traceStep.id,
        state: currentRole === "result" ? "receiving" : "receiving",
      });
      actions.push({
        type: "set-connection-state",
        connectionId: `${previousStep.id}-${traceStep.id}`,
        state: "transmitting",
      });
      actions.push({
        type: "send-packet",
        packet: {
          id: `generated-${traceStep.id}`,
          from: previousStep.id,
          to: traceStep.id,
          semantic: packetSemanticForStep(traceStep, currentRole),
          label: traceStep.eventLabel,
          payloadLabel: compactText(bubbleText(traceStep, representation), traceStep.description, 28),
          payloadLines: [
            bubbleText(traceStep, representation),
            traceStep.metrics.context,
          ],
        },
      });
    }

    return step({
      id: `generated-${traceStep.id}`,
      title: nodes[index].label,
      caption: bubbleText(traceStep, representation),
      focusNodeId: traceStep.id,
      concept: {
        title: nodes[index].label,
        bubble: compactText(bubbleText(traceStep, representation), traceStep.description, 120),
        summary: traceStep.description,
        details: [
          bubbleText(traceStep, representation),
          `Complexidade destacada neste passo: ${traceStep.metrics.complexity}.`,
          `Contexto do custo: ${traceStep.metrics.context}`,
        ],
        glossary: [
          { term: "Evento", definition: `Este passo foi classificado como ${traceStep.eventLabel}.` },
          { term: "Fluxo", definition: index === 0 ? "A cena começa aqui antes de qualquer transição." : `O pacote veio de ${nodes[index - 1].label} e entrou em ${nodes[index].label}.` },
        ],
        payloadTitle: "Leitura do passo",
        payloadLines: [
          `step = ${index + 1}/${trace.steps.length}`,
          `evento = ${traceStep.eventLabel}`,
          previousStep ? `origem = ${nodes[index - 1].label}` : "origem = início",
        ],
      },
      actions,
    });
  });

  return {
    id: `generated-${lesson.id}-${representation}`,
    title: lesson.title,
    description: `Cena linear gerada a partir da timeline da lição ${lesson.title}.`,
    legend: legendForRoles(roles),
    layouts: {
      desktop: { columns: desktopColumns, rows: desktopRows },
      mobile: { columns: 1, rows: trace.steps.length },
    },
    nodes,
    connections,
    steps: sceneSteps,
  };
}
