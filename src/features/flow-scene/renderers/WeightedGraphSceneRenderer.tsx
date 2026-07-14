import type {
  FlowSceneResponsiveCoordinate,
  FlowSceneSnapshot,
  GraphSceneDefinition,
  GraphSceneNodeDefinition,
} from "../../../core/flow-scene/types";

interface WeightedGraphSceneRendererProps {
  scene: GraphSceneDefinition;
  snapshot: FlowSceneSnapshot;
  width: number;
  height: number;
  mobile: boolean;
}

interface Frame {
  left: number;
  top: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

function point(position: FlowSceneResponsiveCoordinate, mobile: boolean, width: number, height: number) {
  const active = mobile ? (position.mobile ?? position.desktop) : position.desktop;
  return {
    x: active.x * width,
    y: active.y * height,
  };
}

function nodeFrame(
  node: GraphSceneNodeDefinition,
  mobile: boolean,
  width: number,
  height: number,
): Frame {
  const center = point(node.position, mobile, width, height);
  const frameWidth = mobile ? 92 : 104;
  const frameHeight = mobile ? 78 : 88;

  return {
    left: center.x - frameWidth / 2,
    top: center.y - frameHeight / 2,
    width: frameWidth,
    height: frameHeight,
    centerX: center.x,
    centerY: center.y,
  };
}

function weightPoint(from: Frame, to: Frame) {
  const midX = (from.centerX + to.centerX) / 2;
  const midY = (from.centerY + to.centerY) / 2;
  const dx = to.centerX - from.centerX;
  const dy = to.centerY - from.centerY;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normalX = -dy / length;
  const normalY = dx / length;

  return {
    x: midX + normalX * 14,
    y: midY + normalY * 14,
  };
}

function edgePath(from: Frame, to: Frame) {
  return `M ${from.centerX} ${from.centerY} L ${to.centerX} ${to.centerY}`;
}

export function graphFocusStyle(
  scene: GraphSceneDefinition,
  width: number,
  height: number,
  mobile: boolean,
  focusNodeId?: string,
) {
  const targetId = focusNodeId ?? scene.graph.sourceId;
  const node = scene.graph.nodes.find((candidate) => candidate.id === targetId);
  if (!node) return undefined;
  const frame = nodeFrame(node, mobile, width, height);
  return {
    left: Math.max(16, frame.left - 6),
    top: Math.max(16, frame.top - 94),
  };
}

export function WeightedGraphSceneRenderer({
  scene,
  snapshot,
  width,
  height,
  mobile,
}: WeightedGraphSceneRendererProps) {
  const graph = snapshot.graph;
  if (!graph) return null;

  const frames = Object.fromEntries(
    Object.values(graph.nodes).map((node) => [
      node.id,
      nodeFrame(node, mobile, width, height),
    ]),
  ) as Record<string, Frame>;

  return (
    <>
      <svg className="flow-scene__svg" viewBox={`0 0 ${width || 640} ${height || 420}`} aria-hidden="true">
        <defs>
          <marker
            id="graph-edge-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="graph-edge-arrowhead" />
          </marker>
        </defs>

        {Object.values(graph.edges).map((edge) => {
          const from = frames[edge.from];
          const to = frames[edge.to];
          if (!from || !to) return null;
          const weight = weightPoint(from, to);

          return (
            <g key={edge.id} className="graph-edge-group">
              <path
                className="graph-edge"
                data-state={edge.state}
                d={edgePath(from, to)}
                markerEnd={edge.directed === false ? undefined : "url(#graph-edge-arrow)"}
              />
              <g transform={`translate(${weight.x}, ${weight.y})`}>
                <rect className="graph-weight-label__bg" x={-16} y={-11} rx={10} ry={10} width={32} height={22} />
                <text className="graph-weight-label" textAnchor="middle" dominantBaseline="central">{edge.weight}</text>
              </g>
            </g>
          );
        })}
      </svg>

      <div className="flow-scene__nodes graph-scene__nodes" aria-hidden="true">
        {Object.values(graph.nodes).map((node) => {
          const frame = frames[node.id];
          const isSource = graph.sourceId === node.id;
          const isTarget = graph.targetId === node.id;

          return (
            <div
              key={node.id}
              className="graph-node"
              data-state={node.state}
              data-source={isSource}
              data-target={isTarget}
              style={{
                left: frame.left,
                top: frame.top,
                width: frame.width,
                height: frame.height,
              }}
            >
              <span className="graph-node__label">{node.label}</span>
              <strong className="graph-node__distance">{node.distance}</strong>
              <span className="graph-node__meta">
                {node.predecessorId ? `pred ${node.predecessorId}` : isSource ? "origem" : isTarget ? "alvo" : "sem pred"}
              </span>
            </div>
          );
        })}

        <aside className="graph-priority-queue" data-mobile={mobile}>
          <div className="graph-priority-queue__header">
            <span className="eyebrow">Priority queue</span>
            <strong>Menor distância primeiro</strong>
          </div>
          <div
            className="graph-priority-queue__list"
            style={{ height: `${Math.max(42, graph.priorityQueue.length * 38)}px` }}
          >
            {graph.priorityQueue.map((item, index) => (
              <div
                key={item.nodeId}
                className="graph-priority-item"
                data-current={graph.currentNodeId === item.nodeId}
                style={{ top: `${index * 38}px` }}
              >
                <span>{item.nodeId}</span>
                <strong>{item.distance}</strong>
              </div>
            ))}
            {graph.priorityQueue.length === 0 ? (
              <div className="graph-priority-queue__empty">fila vazia</div>
            ) : null}
          </div>
        </aside>

        {graph.candidate ? (
          <div className="graph-candidate-panel" data-accepted={graph.candidate.candidateDistance < (graph.candidate.knownDistance === "∞" ? Number.POSITIVE_INFINITY : graph.candidate.knownDistance)}>
            <span className="eyebrow">Cálculo em foco</span>
            <strong>{graph.candidate.from} → {graph.candidate.to}</strong>
            <p>
              {graph.candidate.currentDistance} + {graph.candidate.edgeWeight} = {graph.candidate.candidateDistance}
            </p>
            <p>
              conhecido: {graph.candidate.knownDistance}
            </p>
          </div>
        ) : null}

        {graph.shortestPath ? (
          <div className="graph-shortest-path-card">
            <span className="eyebrow">Menor caminho final</span>
            <strong>{graph.shortestPath.nodeIds.join(" → ")}</strong>
            <p>custo total = {graph.shortestPath.totalCost}</p>
          </div>
        ) : null}
      </div>
    </>
  );
}
