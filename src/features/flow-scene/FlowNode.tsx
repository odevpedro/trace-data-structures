import type { CSSProperties } from "react";
import type { FlowNodeRole, FlowSceneNodeSnapshot, FlowNodeState } from "../../core/flow-scene/types";

interface FlowNodeProps {
  node: FlowSceneNodeSnapshot;
  left: number;
  top: number;
  width: number;
  height: number;
}

function FlowIcon({ role }: { role: FlowNodeRole }) {
  switch (role) {
    case "client":
    case "browser":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 19h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 17v2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "server":
    case "api":
    case "auth":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="4" width="14" height="5" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="5" y="10" width="14" height="5" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="5" y="16" width="14" height="4" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="8" cy="6.5" r="0.9" fill="currentColor" />
          <circle cx="8" cy="12.5" r="0.9" fill="currentColor" />
          <circle cx="8" cy="18" r="0.9" fill="currentColor" />
        </svg>
      );
    case "database":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <ellipse cx="12" cy="6.5" rx="7" ry="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 6.5v9c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2v-9" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 11c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "cache":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="m12 8.5-2 4h2l-1 3 3-4h-2l1-3Z" fill="currentColor" />
        </svg>
      );
    case "queue":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="7" width="4" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="10" y="7" width="4" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="15" y="7" width="4" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "worker":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3.3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 3.8v3M12 17.2v3M20.2 12h-3M6.8 12h-3M17.8 6.2l-2.1 2.1M8.3 15.7l-2.1 2.1M17.8 17.8l-2.1-2.1M8.3 8.3 6.2 6.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "load-balancer":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16M4 12h9M4 18h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="16.5" cy="12" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "input":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4.5" y="5" width="15" height="14" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 12h8M12.5 8.5 16 12l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "decision":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4.2 19.2 12 12 19.8 4.8 12 12 4.2Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 8v4.2M12 16h.01" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "outcome":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 6h10a2 2 0 0 1 2 2v8H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 12h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "result":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="m9.1 12.1 1.9 1.9 3.9-4.1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function stateLabel(state: FlowNodeState) {
  switch (state) {
    case "receiving":
      return "recebendo";
    case "processing":
      return "processando";
    case "sending":
      return "enviando";
    case "waiting":
      return "aguardando";
    case "success":
      return "concluído";
    case "error":
      return "erro";
    case "disabled":
      return "inativo";
    case "active":
      return "ativo";
    case "idle":
    default:
      return "pronto";
  }
}

export function FlowNode({ node, left, top, width, height }: FlowNodeProps) {
  const showProcessing = node.state === "processing";
  return (
    <article
      className="flow-node"
      data-role={node.role}
      data-state={node.state}
      aria-label={node.accessibilityLabel ?? `${node.label}: ${node.description}`}
      style={{
        left,
        top,
        width,
        height,
      } as CSSProperties}
    >
      <div className="flow-node__icon">
        <FlowIcon role={node.role} />
      </div>
      <div className="flow-node__copy">
        <strong>{node.label}</strong>
        <span>{node.description}</span>
      </div>
      <span className="flow-node__state">{stateLabel(node.state)}</span>
      <span className="flow-node__glow" aria-hidden="true" />
      <span className="flow-node__ring" aria-hidden="true" />
      <span className="flow-node__processing" data-visible={showProcessing} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </article>
  );
}
