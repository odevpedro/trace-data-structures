import { describe, expect, it } from "vitest";
import { clientServerFlowScene, createCacheFlowScene } from "../../content/backendFlowScenes";
import {
  createIfFlowScene,
  createLinearSearchFlowScene,
  createLoopFlowScene,
} from "../../content/logicFlowScenes";
import { createDijkstraFlowScene } from "../../content/graphFlowScenes";
import { btreeFlowScene, dlqFlowScene } from "../../content/specializedFlowScenes";
import { reduceFlowScene } from "./reduceFlowScene";

describe("reduceFlowScene", () => {
  it("ativa a conexão e envia o pacote de request ao servidor", () => {
    const snapshot = reduceFlowScene(clientServerFlowScene, 2);

    expect(snapshot.nodes.client.state).toBe("sending");
    expect(snapshot.nodes.server.state).toBe("receiving");
    expect(snapshot.connections["client-server"].state).toBe("transmitting");
    expect(snapshot.packet?.from).toBe("client");
    expect(snapshot.packet?.to).toBe("server");
    expect(snapshot.packet?.semantic).toBe("request");
  });

  it("inverte o fluxo quando o banco devolve o resultado", () => {
    const snapshot = reduceFlowScene(clientServerFlowScene, 6);

    expect(snapshot.nodes.database.state).toBe("sending");
    expect(snapshot.nodes.server.state).toBe("receiving");
    expect(snapshot.packet?.from).toBe("database");
    expect(snapshot.packet?.to).toBe("server");
    expect(snapshot.packet?.semantic).toBe("result");
  });

  it("conclui a cena cliente-servidor com sucesso nos três nós", () => {
    const snapshot = reduceFlowScene(clientServerFlowScene, clientServerFlowScene.steps.length - 1);

    expect(snapshot.nodes.client.state).toBe("success");
    expect(snapshot.nodes.server.state).toBe("success");
    expect(snapshot.nodes.database.state).toBe("success");
    expect(snapshot.packet).toBeNull();
  });

  it("reutiliza a mesma infraestrutura para cache hit sem tocar o banco", () => {
    const scene = createCacheFlowScene(1);
    const snapshot = reduceFlowScene(scene, scene.steps.length - 1);

    expect(snapshot.nodes.client.state).toBe("success");
    expect(snapshot.nodes.server.state).toBe("success");
    expect(snapshot.nodes.cache.state).toBe("success");
    expect(snapshot.nodes.database.state).toBe("idle");
  });

  it("reutiliza a mesma infraestrutura para cache miss com fallback ao banco", () => {
    const scene = createCacheFlowScene(2);
    const snapshot = reduceFlowScene(scene, 4);

    expect(snapshot.nodes.server.state).toBe("sending");
    expect(snapshot.nodes.database.state).toBe("receiving");
    expect(snapshot.connections["server-database"].state).toBe("transmitting");
    expect(snapshot.packet?.semantic).toBe("query");
  });

  it("aplica o mesmo player declarativo para um if com ramo true", () => {
    const snapshot = reduceFlowScene(createIfFlowScene(21), 3);

    expect(snapshot.nodes.decision.state).toBe("sending");
    expect(snapshot.nodes.allowed.state).toBe("receiving");
    expect(snapshot.nodes.blocked.state).toBe("disabled");
    expect(snapshot.connections["decision-allowed"].state).toBe("transmitting");
    expect(snapshot.packet?.semantic).toBe("condition-true");
    expect(snapshot.packet?.to).toBe("allowed");
  });

  it("troca para o ramo false quando a condição falha", () => {
    const snapshot = reduceFlowScene(createIfFlowScene(16), 4);

    expect(snapshot.nodes.input.state).toBe("success");
    expect(snapshot.nodes.decision.state).toBe("success");
    expect(snapshot.nodes.allowed.state).toBe("disabled");
    expect(snapshot.nodes.blocked.state).toBe("sending");
    expect(snapshot.nodes.result.state).toBe("receiving");
    expect(snapshot.connections["blocked-result"].state).toBe("transmitting");
    expect(snapshot.packet?.semantic).toBe("result");
    expect(snapshot.packet?.payloadLines).toContain('return "bloqueado"');
  });

  it("reutiliza a infraestrutura para um for com limite variável", () => {
    const snapshot = reduceFlowScene(createLoopFlowScene(4), 2);

    expect(snapshot.nodes.decision.state).toBe("sending");
    expect(snapshot.nodes.body.state).toBe("receiving");
    expect(snapshot.nodes.increment.state).toBe("active");
    expect(snapshot.connections["decision-body"].state).toBe("transmitting");
    expect(snapshot.packet?.semantic).toBe("condition-true");
  });

  it("reutiliza a infraestrutura para busca linear até o caso ausente", () => {
    const scene = createLinearSearchFlowScene(20);
    const snapshot = reduceFlowScene(scene, scene.steps.length - 1);

    expect(snapshot.nodes["item-3"].state).toBe("sending");
    expect(snapshot.nodes.result.state).toBe("receiving");
    expect(snapshot.connections["item-3-result"].state).toBe("transmitting");
    expect(snapshot.packet?.payloadLines).toContain("return -1");
  });

  it("mantém uma árvore real durante o split de B+ Tree", () => {
    const overflow = reduceFlowScene(btreeFlowScene, 2);

    expect(overflow.tree?.pages.left.keys).toEqual([10, 20, 27]);
    expect(overflow.tree?.pages.left.state).toBe("overflow");
    expect(overflow.tree?.token?.locationId).toBe("left");

    const relayout = reduceFlowScene(btreeFlowScene, btreeFlowScene.steps.length - 1);

    expect(relayout.tree?.pages.root.keys).toEqual([27, 30]);
    expect(relayout.tree?.pages.middle.visible).toBe(true);
    expect(relayout.tree?.pages.middle.keys).toEqual([27]);
    expect(relayout.tree?.edges["root-middle"].visible).toBe(true);
    expect(relayout.tree?.token?.visible).toBe(false);
  });

  it("mantém a mesma mensagem ao longo do loop de retry até a DLQ", () => {
    const retry = reduceFlowScene(dlqFlowScene, 4);

    expect(retry.queue?.messages["order-482"].attempt).toBe(2);
    expect(retry.queue?.messages["order-482"].locationId).toBe("worker");
    expect(retry.queue?.messages["order-482"].status).toBe("retrying");

    const dlq = reduceFlowScene(dlqFlowScene, dlqFlowScene.steps.length - 1);

    expect(dlq.queue?.messages["order-482"].attempt).toBe(3);
    expect(dlq.queue?.messages["order-482"].locationId).toBe("dlq");
    expect(dlq.queue?.messages["order-482"].status).toBe("dead-lettered");
    expect(dlq.queue?.paths["processor-dlq"].state).toBe("error");
  });

  it("reproduz Dijkstra com fila de prioridade, relaxamento e caminho final", () => {
    const scene = createDijkstraFlowScene("abstract");

    const reject = reduceFlowScene(scene, 10);
    expect(reject.graph?.nodes.B.distance).toBe(3);
    expect(reject.graph?.nodes.D.distance).toBe(8);
    expect(reject.graph?.nodes.E.distance).toBe(12);
    expect(reject.graph?.edges.be.state).toBe("rejected");
    expect(reject.graph?.candidate?.candidateDistance).toBe(15);
    expect(reject.graph?.candidate?.knownDistance).toBe(12);
    expect(reject.graph?.priorityQueue).toEqual([
      { nodeId: "D", distance: 8 },
      { nodeId: "E", distance: 12 },
    ]);

    const done = reduceFlowScene(scene, scene.steps.length - 1);
    expect(done.graph?.shortestPath?.nodeIds).toEqual(["A", "C", "B", "D", "E"]);
    expect(done.graph?.shortestPath?.edgeIds).toEqual(["ac", "cb", "bd", "de"]);
    expect(done.graph?.shortestPath?.totalCost).toBe(10);
    expect(done.graph?.nodes.E.predecessorId).toBe("D");
    expect(done.graph?.edges.de.state).toBe("shortest-path");
  });
});
