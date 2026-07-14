import type { FlowSceneDefinition } from "../flow-scene/types";

export type Representation = "abstract" | "practical" | "memory" | "code";

export type TraceStatus = "idle" | "playing" | "paused" | "completed";

export type NodeKind =
  | "block"
  | "slot"
  | "pill"
  | "tag"
  | "decision"
  | "memory"
  | "service"
  | "message"
  | "linked"
  | "tree"
  | "circle"
  | "container"
  | "bucket"
  | "rail";

export type NodeEmphasis =
  | "idle"
  | "active"
  | "visited"
  | "success"
  | "warning"
  | "muted";

export interface Position {
  x: number;
  y: number;
}

export interface SceneNodeDefinition {
  id: string;
  kind: NodeKind;
  labels: Partial<Record<Representation, string>>;
  valueLabels?: Partial<Record<Representation, string>>;
  position: Position;
  width: number;
  height: number;
  visible?: boolean;
  emphasis?: NodeEmphasis;
  value?: unknown;
}

export interface SceneEdgeDefinition {
  id: string;
  from: string;
  to: string;
  directed?: boolean;
  visible?: boolean;
  emphasis?: NodeEmphasis;
}

export interface SceneDefinition {
  nodes: SceneNodeDefinition[];
  edges: SceneEdgeDefinition[];
}

export interface SceneNodeState extends SceneNodeDefinition {
  visible: boolean;
  emphasis: NodeEmphasis;
}

export interface SceneEdgeState extends SceneEdgeDefinition {
  visible: boolean;
  emphasis: NodeEmphasis;
}

export interface ComputedScene {
  nodes: Record<string, SceneNodeState>;
  edges: Record<string, SceneEdgeState>;
}

export type TraceEvent =
  | { type: "COMPARE"; targets: string[] }
  | { type: "MOVE"; target: string; from?: Position; to: Position }
  | { type: "INSERT"; target: string; position?: Position }
  | { type: "REMOVE"; target: string }
  | { type: "LINK"; from: string; to: string; edgeId?: string }
  | { type: "UNLINK"; from: string; to: string; edgeId?: string }
  | { type: "HIGHLIGHT"; targets: string[]; emphasis: NodeEmphasis }
  | { type: "READ_MEMORY"; address: string; target?: string }
  | { type: "WRITE_MEMORY"; address: string; value: unknown; target?: string }
  | { type: "PUSH_STACK_FRAME"; frameId: string }
  | { type: "POP_STACK_FRAME"; frameId: string }
  | {
      type: "BRANCH";
      condition: string;
      result: boolean;
      target?: string;
      trueTarget?: string;
      falseTarget?: string;
    }
  | { type: "CALL_FUNCTION"; functionName: string; target?: string }
  | { type: "RETURN_VALUE"; value: unknown; target?: string }
  | { type: "SEND_REQUEST"; from: string; to: string; target?: string }
  | { type: "RECEIVE_RESPONSE"; from: string; to: string; target?: string }
  | { type: "PUBLISH_EVENT"; channel: string; target?: string }
  | { type: "CONSUME_EVENT"; channel: string; target?: string }
  | { type: "CACHE_HIT"; key: string; target?: string }
  | { type: "CACHE_MISS"; key: string; target?: string }
  | { type: "TIMEOUT"; target: string }
  | { type: "RETRY"; target: string }
  | { type: "FAIL_NODE"; target: string }
  | { type: "RECOVER_NODE"; target: string };

export interface TraceMetrics {
  operations: number;
  touched: number;
  complexity: string;
  context: string;
}

export interface TraceStep {
  id: string;
  eventLabel: string;
  events: TraceEvent[];
  captions: Partial<Record<Representation, string>>;
  description: string;
  metrics: TraceMetrics;
  codeLine?: number;
  concept?: {
    title: string;
    bubble?: string;
    body: string;
    details?: string[];
    glossary?: { term: string; definition: string }[];
    payloadTitle?: string;
    payloadLines?: string[];
    target?: string;
    placement?: "top" | "right" | "bottom" | "left";
  };
}

export interface TraceDefinition {
  id: string;
  scene: SceneDefinition;
  steps: TraceStep[];
  code?: string[];
}

export type PracticalExampleKind =
  | "visual-analogy"
  | "possible-modeling"
  | "natural-modeling"
  | "common-technical-use";

export interface Choice {
  id: string;
  label: string;
  correct: boolean;
}

export interface ChallengeDefinition {
  question: string;
  hint: string;
  choices: Choice[];
  success: string;
  /** Optional representation-specific challenges that override the default */
  byRepresentation?: Partial<Record<Representation, ChallengeDefinition>>;
}

export type LessonControl =
  | {
      id: string;
      label: string;
      type: "number";
      defaultValue: number;
      min: number;
      max: number;
    }
  | {
      id: string;
      label: string;
      type: "select";
      defaultValue: number;
      options: { value: number; label: string }[];
    };

export interface PredictionDefinition {
  prompt: string;
  options: { id: string; label: string }[];
  evaluate: (inputs: Record<string, number>) => string;
}

export interface ComparisonDefinition {
  id: string;
  title: string;
  lessonIdA: string;
  lessonIdB: string;
  labelA: string;
  labelB: string;
  summaryA: string;
  summaryB: string;
  summaryResult: "neutral" | "good-left" | "good-right";
  traceA?: TraceDefinition;
  traceB?: TraceDefinition;
  representation?: Representation;
  description?: string;
}

export interface LimitationDrawer {
  title: string;
  goodLabel: string;
  goodValue: string;
  goodWidth: number;
  badLabel: string;
  badValue: string;
  badWidth: number;
  text: string;
}

export interface LessonDefinition {
  id: string;
  title: string;
  shortTitle: string;
  module: "data-structure" | "algorithm" | "logic" | "memory" | "system-design";
  icon: string;
  difficulty: "foundation" | "intermediate" | "advanced";
  prerequisites: string[];
  objectives: string[];
  description: string;
  example: {
    kind: PracticalExampleKind;
    label: string;
    note: string;
  };
  representations: Representation[];
  explanation: {
    problem: string;
    model: string;
    cost: string;
    whenToUse: string;
    alternative: string;
  };
  challenge: ChallengeDefinition;
  controls?: LessonControl[];
  prediction?: PredictionDefinition;
  trace: TraceDefinition;
  createTrace?: (inputs: Record<string, number>) => TraceDefinition;
  flowScene?: FlowSceneDefinition;
  createFlowScene?: (inputs: Record<string, number>, representation: Representation) => FlowSceneDefinition;
  comparisonId?: string;
  limitation?: LimitationDrawer;
}
