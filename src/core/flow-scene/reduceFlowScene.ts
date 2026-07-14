import type {
  FlowSceneAction,
  FlowSceneConnectionSnapshot,
  FlowSceneDefinition,
  FlowSceneNodeSnapshot,
  FlowSceneSnapshot,
  GraphPriorityQueueItemDefinition,
  GraphSceneEdgeSnapshot,
  GraphSceneNodeSnapshot,
  QueueMessageSnapshot,
  QueueSceneNodeSnapshot,
  QueueScenePathSnapshot,
  TreeEdgeSnapshot,
  TreePageSnapshot,
} from "./types";

function initialSnapshot(scene: FlowSceneDefinition): FlowSceneSnapshot {
  return {
    nodes: "nodes" in scene
      ? Object.fromEntries(
        scene.nodes.map((node) => [
          node.id,
          {
            ...node,
            state: "idle",
          } satisfies FlowSceneNodeSnapshot,
        ]),
      )
      : {},
    connections: "connections" in scene
      ? Object.fromEntries(
        scene.connections.map((connection) => [
          connection.id,
          {
            ...connection,
            state: "idle",
          } satisfies FlowSceneConnectionSnapshot,
        ]),
      )
      : {},
    packet: null,
    tree: scene.sceneKind === "tree"
      ? {
        pages: Object.fromEntries(
          scene.tree.pages.map((page) => [
            page.id,
            {
              ...page,
              keys: [...page.keys],
              state: "idle",
              visible: page.visible ?? true,
            } satisfies TreePageSnapshot,
          ]),
        ),
        edges: Object.fromEntries(
          scene.tree.edges.map((edge) => [
            edge.id,
            {
              ...edge,
              state: "idle",
              visible: edge.visible ?? true,
            } satisfies TreeEdgeSnapshot,
          ]),
        ),
        siblingPointers: Object.fromEntries(
          (scene.tree.siblingPointers ?? []).map((edge) => [
            edge.id,
            {
              ...edge,
              state: "idle",
              visible: edge.visible ?? true,
            } satisfies TreeEdgeSnapshot,
          ]),
        ),
        anchors: Object.fromEntries((scene.tree.anchors ?? []).map((anchor) => [anchor.id, anchor])),
        token: scene.tree.token
          ? {
            ...scene.tree.token,
            visible: scene.tree.token.visible ?? true,
            state: scene.tree.token.visible === false ? "hidden" : "waiting",
          }
          : null,
        comparison: null,
      }
      : null,
    queue: scene.sceneKind === "queue"
      ? {
        nodes: Object.fromEntries(
          scene.queue.nodes.map((node) => [
            node.id,
            {
              ...node,
              state: "idle",
            } satisfies QueueSceneNodeSnapshot,
          ]),
        ),
        paths: Object.fromEntries(
          scene.queue.paths.map((path) => [
            path.id,
            {
              ...path,
              visible: path.visible ?? true,
              state: path.visible === false ? "hidden" : "idle",
            } satisfies QueueScenePathSnapshot,
          ]),
        ),
        anchors: Object.fromEntries((scene.queue.anchors ?? []).map((anchor) => [anchor.id, anchor])),
        messages: Object.fromEntries(
          (scene.queue.messages ?? []).map((message) => [
            message.id,
            {
              ...message,
              visible: message.visible ?? true,
            } satisfies QueueMessageSnapshot,
          ]),
        ),
      }
      : null,
    graph: scene.sceneKind === "graph"
      ? {
        nodes: Object.fromEntries(
          scene.graph.nodes.map((node) => [
            node.id,
            {
              ...node,
              state: "unvisited",
            } satisfies GraphSceneNodeSnapshot,
          ]),
        ),
        edges: Object.fromEntries(
          scene.graph.edges.map((edge) => [
            edge.id,
            {
              ...edge,
              state: "idle",
            } satisfies GraphSceneEdgeSnapshot,
          ]),
        ),
        priorityQueue: [...(scene.graph.priorityQueue ?? [])],
        sourceId: scene.graph.sourceId,
        targetId: scene.graph.targetId ?? null,
        currentNodeId: null,
        inspectedEdgeId: null,
        candidate: null,
        shortestPath: null,
      }
      : null,
  };
}

function upsertQueueItem(
  items: GraphPriorityQueueItemDefinition[],
  nodeId: string,
  distance: number,
) {
  const next = items.filter((item) => item.nodeId !== nodeId);
  next.push({ nodeId, distance });
  next.sort((left, right) => left.distance - right.distance || left.nodeId.localeCompare(right.nodeId));
  return next;
}

function applyAction(snapshot: FlowSceneSnapshot, action: FlowSceneAction): FlowSceneSnapshot {
  switch (action.type) {
    case "reset-node-states":
      return {
        ...snapshot,
        nodes: Object.fromEntries(
          Object.values(snapshot.nodes).map((node) => [node.id, { ...node, state: "idle" }]),
        ),
      };
    case "reset-connection-states":
      return {
        ...snapshot,
        connections: Object.fromEntries(
          Object.values(snapshot.connections).map((connection) => [
            connection.id,
            { ...connection, state: "idle" },
          ]),
        ),
      };
    case "set-node-state":
      if (!snapshot.nodes[action.nodeId]) return snapshot;
      return {
        ...snapshot,
        nodes: {
          ...snapshot.nodes,
          [action.nodeId]: {
            ...snapshot.nodes[action.nodeId],
            state: action.state,
          },
        },
      };
    case "set-connection-state":
      if (!snapshot.connections[action.connectionId]) return snapshot;
      return {
        ...snapshot,
        connections: {
          ...snapshot.connections,
          [action.connectionId]: {
            ...snapshot.connections[action.connectionId],
            state: action.state,
          },
        },
      };
    case "clear-packets":
      return {
        ...snapshot,
        packet: null,
      };
    case "send-packet":
      return {
        ...snapshot,
        packet: action.packet,
      };
    case "reset-tree-state":
      if (!snapshot.tree) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          pages: Object.fromEntries(
            Object.values(snapshot.tree.pages).map((page) => [
              page.id,
              { ...page, state: "idle" },
            ]),
          ),
          edges: Object.fromEntries(
            Object.values(snapshot.tree.edges).map((edge) => [
              edge.id,
              { ...edge, state: "idle" },
            ]),
          ),
          siblingPointers: Object.fromEntries(
            Object.values(snapshot.tree.siblingPointers).map((edge) => [
              edge.id,
              { ...edge, state: "idle" },
            ]),
          ),
          comparison: null,
        },
      };
    case "set-tree-page-state":
      if (!snapshot.tree?.pages[action.pageId]) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          pages: {
            ...snapshot.tree.pages,
            [action.pageId]: {
              ...snapshot.tree.pages[action.pageId],
              state: action.state,
            },
          },
        },
      };
    case "set-tree-edge-state":
      if (!snapshot.tree?.edges[action.edgeId]) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          edges: {
            ...snapshot.tree.edges,
            [action.edgeId]: {
              ...snapshot.tree.edges[action.edgeId],
              state: action.state,
            },
          },
        },
      };
    case "set-tree-edge-visibility":
      if (!snapshot.tree?.edges[action.edgeId]) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          edges: {
            ...snapshot.tree.edges,
            [action.edgeId]: {
              ...snapshot.tree.edges[action.edgeId],
              visible: action.visible,
            },
          },
        },
      };
    case "set-tree-sibling-state":
      if (!snapshot.tree?.siblingPointers[action.pointerId]) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          siblingPointers: {
            ...snapshot.tree.siblingPointers,
            [action.pointerId]: {
              ...snapshot.tree.siblingPointers[action.pointerId],
              state: action.state,
            },
          },
        },
      };
    case "set-tree-sibling-visibility":
      if (!snapshot.tree?.siblingPointers[action.pointerId]) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          siblingPointers: {
            ...snapshot.tree.siblingPointers,
            [action.pointerId]: {
              ...snapshot.tree.siblingPointers[action.pointerId],
              visible: action.visible,
            },
          },
        },
      };
    case "set-tree-token-state":
      if (!snapshot.tree?.token) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          token: {
            ...snapshot.tree.token,
            state: action.state,
            visible: action.state !== "hidden",
          },
        },
      };
    case "move-tree-token":
      if (!snapshot.tree?.token) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          token: {
            ...snapshot.tree.token,
            locationId: action.locationId,
            state: action.state ?? snapshot.tree.token.state,
            visible: (action.state ?? snapshot.tree.token.state) !== "hidden",
          },
        },
      };
    case "compare-keys":
      if (!snapshot.tree) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          comparison: {
            pageId: action.pageId,
            key: action.key,
            against: action.against,
            outcome: action.outcome,
          },
        },
      };
    case "insert-key":
      if (!snapshot.tree?.pages[action.pageId]) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          pages: {
            ...snapshot.tree.pages,
            [action.pageId]: {
              ...snapshot.tree.pages[action.pageId],
              keys: [...snapshot.tree.pages[action.pageId].keys, action.key].sort((left, right) => left - right),
              state: action.state ?? snapshot.tree.pages[action.pageId].state,
            },
          },
        },
      };
    case "split-page":
      if (!snapshot.tree?.pages[action.pageId] || !snapshot.tree.pages[action.rightPageId]) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          pages: {
            ...snapshot.tree.pages,
            [action.pageId]: {
              ...snapshot.tree.pages[action.pageId],
              keys: [...action.leftKeys],
              state: action.state ?? "splitting",
            },
            [action.rightPageId]: {
              ...snapshot.tree.pages[action.rightPageId],
              keys: [...action.rightPageKeys],
              state: action.state ?? "splitting",
              visible: true,
            },
          },
        },
      };
    case "promote-key":
      if (!snapshot.tree?.pages[action.parentPageId]) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          pages: {
            ...snapshot.tree.pages,
            [action.parentPageId]: {
              ...snapshot.tree.pages[action.parentPageId],
              keys: [...snapshot.tree.pages[action.parentPageId].keys, action.key].sort((left, right) => left - right),
              state: "active",
            },
          },
          token: snapshot.tree.token
            ? {
              ...snapshot.tree.token,
              key: action.key,
              locationId: action.parentPageId,
              state: "promoting",
              visible: true,
            }
            : null,
        },
      };
    case "relayout-tree":
      if (!snapshot.tree) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          pages: Object.fromEntries(
            Object.values(snapshot.tree.pages).map((page) => [
              page.id,
              {
                ...page,
                position: action.positions[page.id] ?? page.position,
              },
            ]),
          ),
          token: snapshot.tree.token && action.tokenLocationId
            ? { ...snapshot.tree.token, locationId: action.tokenLocationId }
            : snapshot.tree.token,
        },
      };
    case "clear-tree-comparison":
      if (!snapshot.tree) return snapshot;
      return {
        ...snapshot,
        tree: {
          ...snapshot.tree,
          comparison: null,
        },
      };
    case "reset-queue-state":
      if (!snapshot.queue) return snapshot;
      return {
        ...snapshot,
        queue: {
          ...snapshot.queue,
          nodes: Object.fromEntries(
            Object.values(snapshot.queue.nodes).map((node) => [
              node.id,
              { ...node, state: "idle" },
            ]),
          ),
          paths: Object.fromEntries(
            Object.values(snapshot.queue.paths).map((path) => [
              path.id,
              {
                ...path,
                state: path.visible ? "idle" : "hidden",
              },
            ]),
          ),
        },
      };
    case "set-queue-node-state":
      if (!snapshot.queue?.nodes[action.nodeId]) return snapshot;
      return {
        ...snapshot,
        queue: {
          ...snapshot.queue,
          nodes: {
            ...snapshot.queue.nodes,
            [action.nodeId]: {
              ...snapshot.queue.nodes[action.nodeId],
              state: action.state,
            },
          },
        },
      };
    case "set-queue-path-state":
      if (!snapshot.queue?.paths[action.pathId]) return snapshot;
      return {
        ...snapshot,
        queue: {
          ...snapshot.queue,
          paths: {
            ...snapshot.queue.paths,
            [action.pathId]: {
              ...snapshot.queue.paths[action.pathId],
              state: action.state,
              visible: action.state !== "hidden",
            },
          },
        },
      };
    case "spawn-message":
      if (!snapshot.queue) return snapshot;
      return {
        ...snapshot,
        queue: {
          ...snapshot.queue,
          messages: {
            ...snapshot.queue.messages,
            [action.message.id]: {
              ...action.message,
              visible: action.message.visible ?? true,
            },
          },
        },
      };
    case "move-message":
      if (!snapshot.queue?.messages[action.messageId]) return snapshot;
      return {
        ...snapshot,
        queue: {
          ...snapshot.queue,
          messages: {
            ...snapshot.queue.messages,
            [action.messageId]: {
              ...snapshot.queue.messages[action.messageId],
              locationId: action.locationId,
              status: action.status ?? snapshot.queue.messages[action.messageId].status,
              visible: true,
            },
          },
        },
      };
    case "set-message-status":
      if (!snapshot.queue?.messages[action.messageId]) return snapshot;
      return {
        ...snapshot,
        queue: {
          ...snapshot.queue,
          messages: {
            ...snapshot.queue.messages,
            [action.messageId]: {
              ...snapshot.queue.messages[action.messageId],
              status: action.status,
            },
          },
        },
      };
    case "increment-attempt":
      if (!snapshot.queue?.messages[action.messageId]) return snapshot;
      return {
        ...snapshot,
        queue: {
          ...snapshot.queue,
          messages: {
            ...snapshot.queue.messages,
            [action.messageId]: {
              ...snapshot.queue.messages[action.messageId],
              attempt: Math.min(
                snapshot.queue.messages[action.messageId].attempt + 1,
                snapshot.queue.messages[action.messageId].maxAttempts,
              ),
            },
          },
        },
      };
    case "route-to-dlq":
      if (!snapshot.queue?.messages[action.messageId]) return snapshot;
      return {
        ...snapshot,
        queue: {
          ...snapshot.queue,
          messages: {
            ...snapshot.queue.messages,
            [action.messageId]: {
              ...snapshot.queue.messages[action.messageId],
              locationId: action.dlqId,
              status: "dead-lettered",
            },
          },
        },
      };
    case "clear-messages":
      if (!snapshot.queue) return snapshot;
      return {
        ...snapshot,
        queue: {
          ...snapshot.queue,
          messages: {},
        },
      };
    case "reset-graph-state":
      if (!snapshot.graph) return snapshot;
      {
        const graph = snapshot.graph;
      return {
        ...snapshot,
        graph: {
          ...graph,
          nodes: Object.fromEntries(
            Object.values(graph.nodes).map((node) => [
              node.id,
              {
                ...node,
                state: node.id === graph.sourceId && node.distance === 0 ? "frontier" : "unvisited",
              },
            ]),
          ),
          edges: Object.fromEntries(
            Object.values(graph.edges).map((edge) => [
              edge.id,
              { ...edge, state: "idle" },
            ]),
          ),
          currentNodeId: null,
          inspectedEdgeId: null,
          candidate: null,
          shortestPath: null,
        },
      };
      }
    case "set-graph-source":
      if (!snapshot.graph) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          sourceId: action.nodeId,
        },
      };
    case "set-graph-target":
      if (!snapshot.graph) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          targetId: action.nodeId,
        },
      };
    case "set-graph-node-state":
      if (!snapshot.graph?.nodes[action.nodeId]) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          nodes: {
            ...snapshot.graph.nodes,
            [action.nodeId]: {
              ...snapshot.graph.nodes[action.nodeId],
              state: action.state,
            },
          },
        },
      };
    case "set-current-graph-node":
      if (!snapshot.graph?.nodes[action.nodeId]) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          currentNodeId: action.nodeId,
          nodes: {
            ...snapshot.graph.nodes,
            [action.nodeId]: {
              ...snapshot.graph.nodes[action.nodeId],
              state: "current",
            },
          },
        },
      };
    case "inspect-graph-edge":
      if (!snapshot.graph?.edges[action.edgeId]) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          inspectedEdgeId: action.edgeId,
          edges: {
            ...snapshot.graph.edges,
            [action.edgeId]: {
              ...snapshot.graph.edges[action.edgeId],
              state: "inspecting",
            },
          },
        },
      };
    case "clear-graph-inspection":
      if (!snapshot.graph) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          inspectedEdgeId: null,
        },
      };
    case "calculate-graph-candidate":
      if (!snapshot.graph) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          candidate: {
            from: action.from,
            to: action.to,
            currentDistance: action.currentDistance,
            edgeWeight: action.edgeWeight,
            candidateDistance: action.candidateDistance,
            knownDistance: action.knownDistance,
          },
        },
      };
    case "clear-graph-candidate":
      if (!snapshot.graph) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          candidate: null,
        },
      };
    case "relax-graph-edge":
      if (!snapshot.graph?.nodes[action.nodeId] || !snapshot.graph.edges[action.edgeId]) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          nodes: {
            ...snapshot.graph.nodes,
            [action.nodeId]: {
              ...snapshot.graph.nodes[action.nodeId],
              distance: action.newDistance,
              predecessorId: action.predecessorId,
              state: "frontier",
            },
          },
          edges: {
            ...snapshot.graph.edges,
            [action.edgeId]: {
              ...snapshot.graph.edges[action.edgeId],
              state: "relaxed",
            },
          },
        },
      };
    case "reject-graph-relaxation":
      if (!snapshot.graph?.edges[action.edgeId]) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          edges: {
            ...snapshot.graph.edges,
            [action.edgeId]: {
              ...snapshot.graph.edges[action.edgeId],
              state: "rejected",
            },
          },
        },
      };
    case "mark-graph-visited":
      if (!snapshot.graph?.nodes[action.nodeId]) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          currentNodeId: snapshot.graph.currentNodeId === action.nodeId ? null : snapshot.graph.currentNodeId,
          nodes: {
            ...snapshot.graph.nodes,
            [action.nodeId]: {
              ...snapshot.graph.nodes[action.nodeId],
              state: "visited",
            },
          },
        },
      };
    case "enqueue-graph-node":
      if (!snapshot.graph) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          priorityQueue: upsertQueueItem(snapshot.graph.priorityQueue, action.nodeId, action.distance),
        },
      };
    case "dequeue-graph-min":
      if (!snapshot.graph) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          priorityQueue: snapshot.graph.priorityQueue.filter((item) => item.nodeId !== action.nodeId),
        },
      };
    case "update-graph-priority-queue":
      if (!snapshot.graph) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          priorityQueue: [...action.items].sort(
            (left, right) => left.distance - right.distance || left.nodeId.localeCompare(right.nodeId),
          ),
        },
      };
    case "set-graph-predecessor":
      if (!snapshot.graph?.nodes[action.nodeId]) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          nodes: {
            ...snapshot.graph.nodes,
            [action.nodeId]: {
              ...snapshot.graph.nodes[action.nodeId],
              predecessorId: action.predecessorId,
            },
          },
        },
      };
    case "set-graph-distance":
      if (!snapshot.graph?.nodes[action.nodeId]) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          nodes: {
            ...snapshot.graph.nodes,
            [action.nodeId]: {
              ...snapshot.graph.nodes[action.nodeId],
              distance: action.distance,
            },
          },
        },
      };
    case "reconstruct-graph-path":
      if (!snapshot.graph) return snapshot;
      return {
        ...snapshot,
        graph: {
          ...snapshot.graph,
          shortestPath: {
            nodeIds: [...action.nodeIds],
            edgeIds: [...action.edgeIds],
            totalCost: action.totalCost,
          },
          nodes: Object.fromEntries(
            Object.values(snapshot.graph.nodes).map((node) => [
              node.id,
              {
                ...node,
                state: action.nodeIds.includes(node.id) ? "path" : node.state,
              },
            ]),
          ),
          edges: Object.fromEntries(
            Object.values(snapshot.graph.edges).map((edge) => [
              edge.id,
              {
                ...edge,
                state: action.edgeIds.includes(edge.id) ? "shortest-path" : edge.state,
              },
            ]),
          ),
        },
      };
  }
}

export function reduceFlowScene(scene: FlowSceneDefinition, stepIndex: number): FlowSceneSnapshot {
  const lastStep = Math.min(Math.max(stepIndex, 0), scene.steps.length - 1);
  let snapshot = initialSnapshot(scene);

  for (let index = 0; index <= lastStep; index += 1) {
    for (const action of scene.steps[index].actions) {
      snapshot = applyAction(snapshot, action);
    }
  }

  return snapshot;
}
