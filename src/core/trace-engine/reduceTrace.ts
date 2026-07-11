import type {
  ComputedScene,
  NodeEmphasis,
  SceneDefinition,
  SceneEdgeState,
  SceneNodeState,
  TraceDefinition,
  TraceEvent,
} from "./types";

function initialScene(scene: SceneDefinition): ComputedScene {
  return {
    nodes: Object.fromEntries(
      scene.nodes.map((node) => [
        node.id,
        {
          ...node,
          position: { ...node.position },
          visible: node.visible ?? true,
          emphasis: node.emphasis ?? "idle",
        } satisfies SceneNodeState,
      ]),
    ),
    edges: Object.fromEntries(
      scene.edges.map((edge) => [
        edge.id,
        {
          ...edge,
          visible: edge.visible ?? true,
          emphasis: edge.emphasis ?? "idle",
        } satisfies SceneEdgeState,
      ]),
    ),
  };
}

function emphasize(
  scene: ComputedScene,
  target: string | undefined,
  emphasis: NodeEmphasis = "active",
) {
  if (target && scene.nodes[target]) {
    scene.nodes[target] = { ...scene.nodes[target], emphasis };
  }
}

function moveMessage(
  scene: ComputedScene,
  target: string | undefined,
  destination: string,
) {
  if (!target || !scene.nodes[target] || !scene.nodes[destination]) return;
  const destinationNode = scene.nodes[destination];
  scene.nodes[target] = {
    ...scene.nodes[target],
    visible: true,
    emphasis: "active",
    position: {
      x: destinationNode.position.x + destinationNode.width / 2 - scene.nodes[target].width / 2,
      y: destinationNode.position.y + destinationNode.height + 34,
    },
  };
}

export function applyTraceEvent(scene: ComputedScene, event: TraceEvent): ComputedScene {
  const next: ComputedScene = {
    nodes: { ...scene.nodes },
    edges: { ...scene.edges },
  };

  switch (event.type) {
    case "COMPARE":
      event.targets.forEach((target) => emphasize(next, target));
      break;
    case "MOVE":
      if (next.nodes[event.target]) {
        next.nodes[event.target] = {
          ...next.nodes[event.target],
          position: { ...event.to },
          emphasis: "active",
        };
      }
      break;
    case "INSERT":
      if (next.nodes[event.target]) {
        next.nodes[event.target] = {
          ...next.nodes[event.target],
          visible: true,
          emphasis: "active",
          position: event.position
            ? { ...event.position }
            : next.nodes[event.target].position,
        };
      }
      break;
    case "REMOVE":
      if (next.nodes[event.target]) {
        next.nodes[event.target] = {
          ...next.nodes[event.target],
          visible: false,
          emphasis: "warning",
        };
      }
      break;
    case "LINK": {
      const edge = Object.values(next.edges).find(
        (item) =>
          item.id === event.edgeId || (item.from === event.from && item.to === event.to),
      );
      if (edge) next.edges[edge.id] = { ...edge, visible: true, emphasis: "active" };
      break;
    }
    case "UNLINK": {
      const edge = Object.values(next.edges).find(
        (item) =>
          item.id === event.edgeId || (item.from === event.from && item.to === event.to),
      );
      if (edge) next.edges[edge.id] = { ...edge, visible: false, emphasis: "warning" };
      break;
    }
    case "HIGHLIGHT":
      event.targets.forEach((target) => {
        emphasize(next, target, event.emphasis);
        if (next.edges[target]) {
          next.edges[target] = { ...next.edges[target], emphasis: event.emphasis };
        }
      });
      break;
    case "READ_MEMORY":
      emphasize(next, event.target ?? event.address);
      break;
    case "WRITE_MEMORY": {
      const target = event.target ?? event.address;
      if (next.nodes[target]) {
        next.nodes[target] = {
          ...next.nodes[target],
          value: event.value,
          emphasis: "active",
        };
      }
      break;
    }
    case "PUSH_STACK_FRAME":
      if (next.nodes[event.frameId]) {
        next.nodes[event.frameId] = {
          ...next.nodes[event.frameId],
          visible: true,
          emphasis: "active",
        };
      }
      break;
    case "POP_STACK_FRAME":
      if (next.nodes[event.frameId]) {
        next.nodes[event.frameId] = {
          ...next.nodes[event.frameId],
          visible: false,
          emphasis: "muted",
        };
      }
      break;
    case "BRANCH":
      emphasize(next, event.target);
      emphasize(next, event.trueTarget, event.result ? "success" : "muted");
      emphasize(next, event.falseTarget, event.result ? "muted" : "success");
      break;
    case "CALL_FUNCTION":
      emphasize(next, event.target);
      break;
    case "RETURN_VALUE":
      if (event.target && next.nodes[event.target]) {
        next.nodes[event.target] = {
          ...next.nodes[event.target],
          value: event.value,
          visible: true,
          emphasis: "success",
        };
      }
      break;
    case "SEND_REQUEST":
      emphasize(next, event.from, "visited");
      emphasize(next, event.to);
      moveMessage(next, event.target, event.to);
      break;
    case "RECEIVE_RESPONSE":
      emphasize(next, event.from, "visited");
      emphasize(next, event.to, "success");
      moveMessage(next, event.target, event.to);
      break;
    case "PUBLISH_EVENT":
    case "CONSUME_EVENT":
    case "CACHE_HIT":
    case "CACHE_MISS":
    case "RETRY":
      emphasize(next, event.target);
      break;
    case "TIMEOUT":
    case "FAIL_NODE":
      emphasize(next, event.target, "warning");
      break;
    case "RECOVER_NODE":
      emphasize(next, event.target, "success");
      break;
  }

  return next;
}

export function reduceTrace(trace: TraceDefinition, stepIndex: number): ComputedScene {
  const lastStep = Math.min(Math.max(stepIndex, 0), trace.steps.length - 1);
  let scene = initialScene(trace.scene);

  for (let index = 0; index <= lastStep; index += 1) {
    for (const event of trace.steps[index].events) {
      scene = applyTraceEvent(scene, event);
    }
  }

  return scene;
}

export function traceStepAt(trace: TraceDefinition, stepIndex: number) {
  return trace.steps[Math.min(Math.max(stepIndex, 0), trace.steps.length - 1)];
}
