import type { FlowConnectionState } from "../../core/flow-scene/types";

interface FlowConnectionProps {
  id: string;
  label?: string;
  path: string;
  labelX: number;
  labelY: number;
  state: FlowConnectionState;
  kind: string;
}

export function FlowConnection({
  id,
  label,
  path,
  labelX,
  labelY,
  state,
  kind,
}: FlowConnectionProps) {
  return (
    <g className="flow-connection" data-state={state} data-connection-id={id} data-kind={kind}>
      <path className="flow-connection__path" d={path} pathLength={100} />
      {label ? (
        <text className="flow-connection__label" x={labelX} y={labelY} textAnchor="middle">
          {label}
        </text>
      ) : null}
    </g>
  );
}
