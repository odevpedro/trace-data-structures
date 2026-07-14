export type FlowNodeRole =
  | "client"
  | "browser"
  | "server"
  | "api"
  | "database"
  | "cache"
  | "queue"
  | "worker"
  | "load-balancer"
  | "auth"
  | "input"
  | "decision"
  | "outcome"
  | "result";

export type FlowNodeState =
  | "idle"
  | "active"
  | "receiving"
  | "processing"
  | "sending"
  | "waiting"
  | "success"
  | "error"
  | "disabled";

export type FlowConnectionState =
  | "idle"
  | "active"
  | "transmitting"
  | "success"
  | "error"
  | "timeout"
  | "blocked"
  | "retry";

export type FlowPacketSemantic =
  | "request"
  | "response"
  | "query"
  | "result"
  | "cache-hit"
  | "cache-miss"
  | "cache-update"
  | "condition-true"
  | "condition-false";

export type FlowConnectionKind =
  | "http"
  | "response"
  | "database"
  | "cache"
  | "event"
  | "decision"
  | "success"
  | "error";

export type FlowLegendSemantic =
  | "request"
  | "response"
  | "processing"
  | "storage"
  | "condition"
  | "success"
  | "error"
  | "result";

export type SceneKind =
  | "pipeline"
  | "tree"
  | "queue"
  | "memory"
  | "graph"
  | "state-machine"
  | "distribution"
  | "transformation";

export interface FlowGridPlacement {
  column: number;
  row: number;
}

export interface FlowSceneLayout {
  columns: number;
  rows: number;
}

export interface FlowSceneCoordinate {
  x: number;
  y: number;
}

export interface FlowSceneResponsiveCoordinate {
  desktop: FlowSceneCoordinate;
  mobile?: FlowSceneCoordinate;
}

export interface FlowSceneNodeDefinition {
  id: string;
  role: FlowNodeRole;
  label: string;
  shortLabel?: string;
  description: string;
  metadata?: string[];
  accessibilityLabel?: string;
  placement: {
    desktop: FlowGridPlacement;
    mobile?: FlowGridPlacement;
  };
}

export interface FlowSceneConnectionDefinition {
  id: string;
  from: string;
  to: string;
  label?: string;
  kind: FlowConnectionKind;
}

export interface FlowScenePacketDefinition {
  id: string;
  from: string;
  to: string;
  semantic: FlowPacketSemantic;
  label: string;
  payloadLabel?: string;
  payloadLines?: string[];
}

export interface FlowSceneGlossaryItem {
  term: string;
  definition: string;
}

export interface FlowSceneLegendItem {
  semantic: FlowLegendSemantic;
  label: string;
}

export interface FlowSceneAlternatePath {
  title: string;
  summary: string;
  details: string[];
}

export interface FlowSceneConcept {
  title: string;
  bubble: string;
  summary: string;
  longform?: string[];
  details: string[];
  alternatePath?: FlowSceneAlternatePath;
  glossary?: FlowSceneGlossaryItem[];
  pitfalls?: string[];
  payloadTitle?: string;
  payloadLines?: string[];
}

export type TreePageKind = "root" | "internal" | "leaf";

export type TreePageState = "idle" | "active" | "receiving" | "overflow" | "splitting" | "success";

export type TreeEdgeState = "idle" | "active" | "muted" | "success";

export type TreeTokenState = "hidden" | "waiting" | "moving" | "inserting" | "promoting" | "placed";

export interface TreePageDefinition {
  id: string;
  kind: TreePageKind;
  label?: string;
  keys: number[];
  capacity: number;
  description: string;
  position: FlowSceneResponsiveCoordinate;
  visible?: boolean;
}

export interface TreeEdgeDefinition {
  id: string;
  from: string;
  to: string;
  visible?: boolean;
}

export interface TreeSiblingPointerDefinition {
  id: string;
  from: string;
  to: string;
  visible?: boolean;
}

export interface TreeAnchorDefinition {
  id: string;
  label: string;
  position: FlowSceneResponsiveCoordinate;
}

export interface TreeTokenDefinition {
  id: string;
  key: number;
  locationId: string;
  visible?: boolean;
}

export interface TreeSceneDefinitionData {
  pages: TreePageDefinition[];
  edges: TreeEdgeDefinition[];
  siblingPointers?: TreeSiblingPointerDefinition[];
  anchors?: TreeAnchorDefinition[];
  token?: TreeTokenDefinition;
}

export type QueueNodeKind = "queue" | "worker" | "processor" | "retry" | "dlq" | "outcome";

export type QueueNodeState =
  | "idle"
  | "active"
  | "processing"
  | "waiting"
  | "success"
  | "error";

export type QueuePathState = "hidden" | "idle" | "active" | "transmitting" | "error" | "success";

export type MessageStatus =
  | "queued"
  | "consuming"
  | "processing"
  | "failed"
  | "retrying"
  | "dead-lettered"
  | "completed";

export interface QueueSceneNodeDefinition {
  id: string;
  kind: QueueNodeKind;
  label: string;
  description: string;
  position: FlowSceneResponsiveCoordinate;
}

export interface QueueScenePathDefinition {
  id: string;
  from: string;
  to: string;
  label?: string;
  visible?: boolean;
}

export interface QueueMessageDefinition {
  id: string;
  label: string;
  attempt: number;
  maxAttempts: number;
  locationId: string;
  status: MessageStatus;
  payloadLines?: string[];
  visible?: boolean;
}

export interface QueueSceneDefinitionData {
  nodes: QueueSceneNodeDefinition[];
  paths: QueueScenePathDefinition[];
  anchors?: TreeAnchorDefinition[];
  messages?: QueueMessageDefinition[];
}

export type GraphNodeState =
  | "unvisited"
  | "frontier"
  | "current"
  | "visited"
  | "path";

export type GraphEdgeState =
  | "idle"
  | "inspecting"
  | "relaxed"
  | "rejected"
  | "shortest-path";

export type GraphDistance = number | "∞";

export interface GraphSceneNodeDefinition {
  id: string;
  label: string;
  description: string;
  position: FlowSceneResponsiveCoordinate;
  distance: GraphDistance;
  predecessorId?: string | null;
}

export interface GraphSceneEdgeDefinition {
  id: string;
  from: string;
  to: string;
  weight: number;
  directed?: boolean;
}

export interface GraphPriorityQueueItemDefinition {
  nodeId: string;
  distance: number;
}

export interface GraphSceneDefinitionData {
  nodes: GraphSceneNodeDefinition[];
  edges: GraphSceneEdgeDefinition[];
  sourceId: string;
  targetId?: string;
  priorityQueue?: GraphPriorityQueueItemDefinition[];
}

export type FlowSceneAction =
  | { type: "reset-node-states" }
  | { type: "reset-connection-states" }
  | { type: "set-node-state"; nodeId: string; state: FlowNodeState }
  | { type: "set-connection-state"; connectionId: string; state: FlowConnectionState }
  | { type: "clear-packets" }
  | { type: "send-packet"; packet: FlowScenePacketDefinition }
  | { type: "reset-tree-state" }
  | { type: "set-tree-page-state"; pageId: string; state: TreePageState }
  | { type: "set-tree-edge-state"; edgeId: string; state: TreeEdgeState }
  | { type: "set-tree-edge-visibility"; edgeId: string; visible: boolean }
  | { type: "set-tree-sibling-state"; pointerId: string; state: TreeEdgeState }
  | { type: "set-tree-sibling-visibility"; pointerId: string; visible: boolean }
  | { type: "set-tree-token-state"; state: TreeTokenState }
  | { type: "move-tree-token"; locationId: string; state?: TreeTokenState }
  | { type: "compare-keys"; pageId: string; key: number; against: number; outcome: "lt" | "eq" | "gt" }
  | { type: "insert-key"; pageId: string; key: number; state?: TreePageState }
  | {
      type: "split-page";
      pageId: string;
      leftKeys: number[];
      rightPageId: string;
      rightPageKeys: number[];
      state?: TreePageState;
    }
  | { type: "promote-key"; key: number; parentPageId: string }
  | {
      type: "relayout-tree";
      positions: Record<string, FlowSceneResponsiveCoordinate>;
      tokenLocationId?: string;
    }
  | { type: "clear-tree-comparison" }
  | { type: "reset-queue-state" }
  | { type: "set-queue-node-state"; nodeId: string; state: QueueNodeState }
  | { type: "set-queue-path-state"; pathId: string; state: QueuePathState }
  | { type: "spawn-message"; message: QueueMessageDefinition }
  | { type: "move-message"; messageId: string; locationId: string; status?: MessageStatus }
  | { type: "set-message-status"; messageId: string; status: MessageStatus }
  | { type: "increment-attempt"; messageId: string }
  | { type: "route-to-dlq"; messageId: string; dlqId: string }
  | { type: "clear-messages" }
  | { type: "reset-graph-state" }
  | { type: "set-graph-source"; nodeId: string }
  | { type: "set-graph-target"; nodeId: string }
  | { type: "set-graph-node-state"; nodeId: string; state: GraphNodeState }
  | { type: "set-current-graph-node"; nodeId: string }
  | { type: "inspect-graph-edge"; edgeId: string }
  | { type: "clear-graph-inspection" }
  | {
      type: "calculate-graph-candidate";
      from: string;
      to: string;
      currentDistance: number;
      edgeWeight: number;
      candidateDistance: number;
      knownDistance: GraphDistance;
    }
  | { type: "clear-graph-candidate" }
  | {
      type: "relax-graph-edge";
      edgeId: string;
      nodeId: string;
      previousDistance: GraphDistance;
      newDistance: number;
      predecessorId: string;
    }
  | { type: "reject-graph-relaxation"; edgeId: string; nodeId: string }
  | { type: "mark-graph-visited"; nodeId: string }
  | { type: "enqueue-graph-node"; nodeId: string; distance: number }
  | { type: "dequeue-graph-min"; nodeId: string }
  | { type: "update-graph-priority-queue"; items: GraphPriorityQueueItemDefinition[] }
  | { type: "set-graph-predecessor"; nodeId: string; predecessorId: string | null }
  | { type: "set-graph-distance"; nodeId: string; distance: GraphDistance }
  | { type: "reconstruct-graph-path"; nodeIds: string[]; edgeIds: string[]; totalCost: number };

export interface FlowSceneStep {
  id: string;
  title: string;
  caption: string;
  concept: FlowSceneConcept;
  focusNodeId?: string;
  actions: FlowSceneAction[];
}

export interface FlowSceneBaseDefinition {
  id: string;
  title: string;
  description: string;
  sceneKind?: SceneKind;
  legend?: FlowSceneLegendItem[];
  steps: FlowSceneStep[];
}

export interface PipelineSceneDefinition extends FlowSceneBaseDefinition {
  sceneKind?: "pipeline";
  layouts: {
    desktop: FlowSceneLayout;
    mobile: FlowSceneLayout;
  };
  nodes: FlowSceneNodeDefinition[];
  connections: FlowSceneConnectionDefinition[];
}

export interface FlowSceneNodeSnapshot extends FlowSceneNodeDefinition {
  state: FlowNodeState;
}

export interface FlowSceneConnectionSnapshot extends FlowSceneConnectionDefinition {
  state: FlowConnectionState;
}

export interface TreePageSnapshot extends Omit<TreePageDefinition, "keys"> {
  keys: number[];
  state: TreePageState;
  visible: boolean;
}

export interface TreeEdgeSnapshot extends TreeEdgeDefinition {
  state: TreeEdgeState;
  visible: boolean;
}

export interface TreeTokenSnapshot extends TreeTokenDefinition {
  state: TreeTokenState;
  visible: boolean;
}

export interface TreeComparisonSnapshot {
  pageId: string;
  key: number;
  against: number;
  outcome: "lt" | "eq" | "gt";
}

export interface TreeSceneSnapshotState {
  pages: Record<string, TreePageSnapshot>;
  edges: Record<string, TreeEdgeSnapshot>;
  siblingPointers: Record<string, TreeEdgeSnapshot>;
  anchors: Record<string, TreeAnchorDefinition>;
  token: TreeTokenSnapshot | null;
  comparison: TreeComparisonSnapshot | null;
}

export interface TreeSceneDefinition extends FlowSceneBaseDefinition {
  sceneKind: "tree";
  tree: TreeSceneDefinitionData;
}

export interface QueueSceneNodeSnapshot extends QueueSceneNodeDefinition {
  state: QueueNodeState;
}

export interface QueueScenePathSnapshot extends QueueScenePathDefinition {
  state: QueuePathState;
  visible: boolean;
}

export interface QueueMessageSnapshot extends QueueMessageDefinition {
  visible: boolean;
}

export interface QueueSceneSnapshotState {
  nodes: Record<string, QueueSceneNodeSnapshot>;
  paths: Record<string, QueueScenePathSnapshot>;
  anchors: Record<string, TreeAnchorDefinition>;
  messages: Record<string, QueueMessageSnapshot>;
}

export interface QueueSceneDefinition extends FlowSceneBaseDefinition {
  sceneKind: "queue";
  queue: QueueSceneDefinitionData;
}

export interface GraphSceneNodeSnapshot extends GraphSceneNodeDefinition {
  state: GraphNodeState;
}

export interface GraphSceneEdgeSnapshot extends GraphSceneEdgeDefinition {
  state: GraphEdgeState;
}

export interface GraphCandidateSnapshot {
  from: string;
  to: string;
  currentDistance: number;
  edgeWeight: number;
  candidateDistance: number;
  knownDistance: GraphDistance;
}

export interface GraphShortestPathSnapshot {
  nodeIds: string[];
  edgeIds: string[];
  totalCost: number;
}

export interface GraphSceneSnapshotState {
  nodes: Record<string, GraphSceneNodeSnapshot>;
  edges: Record<string, GraphSceneEdgeSnapshot>;
  priorityQueue: GraphPriorityQueueItemDefinition[];
  sourceId: string | null;
  targetId: string | null;
  currentNodeId: string | null;
  inspectedEdgeId: string | null;
  candidate: GraphCandidateSnapshot | null;
  shortestPath: GraphShortestPathSnapshot | null;
}

export interface GraphSceneDefinition extends FlowSceneBaseDefinition {
  sceneKind: "graph";
  graph: GraphSceneDefinitionData;
}

export type FlowSceneDefinition =
  | PipelineSceneDefinition
  | TreeSceneDefinition
  | QueueSceneDefinition
  | GraphSceneDefinition;

export interface FlowSceneSnapshot {
  nodes: Record<string, FlowSceneNodeSnapshot>;
  connections: Record<string, FlowSceneConnectionSnapshot>;
  packet: FlowScenePacketDefinition | null;
  tree: TreeSceneSnapshotState | null;
  queue: QueueSceneSnapshotState | null;
  graph: GraphSceneSnapshotState | null;
}
