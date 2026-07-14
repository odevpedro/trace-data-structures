import { useMemo } from "react";
import type {
  FlowSceneConnectionDefinition,
  FlowSceneNodeDefinition,
  FlowSceneSnapshot,
  PipelineSceneDefinition,
} from "../../../core/flow-scene/types";
import { FlowConnection } from "../FlowConnection";
import { FlowNode } from "../FlowNode";
import { TravelingPacket } from "../TravelingPacket";

interface PipelineSceneRendererProps {
  scene: PipelineSceneDefinition;
  snapshot: FlowSceneSnapshot;
  width: number;
  height: number;
  mobile: boolean;
  reducedMotion: boolean;
  speed: number;
  stepKey: string;
}

interface NodeFrame {
  left: number;
  top: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

function connectionPath(from: NodeFrame, to: NodeFrame) {
  const dx = to.centerX - from.centerX;
  const dy = to.centerY - from.centerY;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const controlOffset = horizontal ? Math.max(42, Math.abs(dx) * 0.28) : Math.max(42, Math.abs(dy) * 0.28);

  if (horizontal) {
    return `M ${from.centerX} ${from.centerY} C ${from.centerX + controlOffset} ${from.centerY}, ${to.centerX - controlOffset} ${to.centerY}, ${to.centerX} ${to.centerY}`;
  }

  return `M ${from.centerX} ${from.centerY} C ${from.centerX} ${from.centerY + controlOffset}, ${to.centerX} ${to.centerY - controlOffset}, ${to.centerX} ${to.centerY}`;
}

function labelPoint(from: NodeFrame, to: NodeFrame) {
  return {
    x: (from.centerX + to.centerX) / 2,
    y: (from.centerY + to.centerY) / 2 - 10,
  };
}

function nodeFrame(
  node: FlowSceneNodeDefinition,
  width: number,
  height: number,
  mobile: boolean,
  columns: number,
  rows: number,
): NodeFrame {
  const paddingX = mobile ? 24 : 38;
  const paddingY = mobile ? 24 : 32;
  const placement = mobile ? (node.placement.mobile ?? node.placement.desktop) : node.placement.desktop;
  const cellWidth = Math.max(1, (width - paddingX * 2) / columns);
  const cellHeight = Math.max(1, (height - paddingY * 2) / rows);
  const nodeWidth = mobile
    ? Math.min(width - paddingX * 2, 240)
    : Math.min(182, Math.max(140, cellWidth * 0.78));
  const nodeHeight = mobile ? 96 : 92;
  const centerX = paddingX + cellWidth * (placement.column - 0.5);
  const centerY = paddingY + cellHeight * (placement.row - 0.5);

  return {
    left: centerX - nodeWidth / 2,
    top: centerY - nodeHeight / 2,
    width: nodeWidth,
    height: nodeHeight,
    centerX,
    centerY,
  };
}

export function pipelineFocusStyle(
  scene: PipelineSceneDefinition,
  width: number,
  height: number,
  mobile: boolean,
  focusNodeId?: string,
) {
  const layout = mobile ? scene.layouts.mobile : scene.layouts.desktop;
  const targetId = focusNodeId ?? scene.nodes[0]?.id;
  if (!targetId) return undefined;
  const targetNode = scene.nodes.find((node) => node.id === targetId);
  if (!targetNode) return undefined;
  const frame = nodeFrame(targetNode, width, height, mobile, layout.columns, layout.rows);
  return {
    left: frame.left,
    top: Math.max(16, frame.top - 88),
  };
}

function findConnection(
  connections: FlowSceneConnectionDefinition[],
  from: string,
  to: string,
) {
  return connections.find((connection) => connection.from === from && connection.to === to)
    ?? connections.find((connection) => connection.from === to && connection.to === from);
}

export function PipelineSceneRenderer({
  scene,
  snapshot,
  width,
  height,
  mobile,
  reducedMotion,
  speed,
  stepKey,
}: PipelineSceneRendererProps) {
  const layout = mobile ? scene.layouts.mobile : scene.layouts.desktop;

  const frames = useMemo(() => Object.fromEntries(
    scene.nodes.map((node) => [
      node.id,
      nodeFrame(node, width || 640, height || 380, mobile, layout.columns, layout.rows),
    ]),
  ) as Record<string, NodeFrame>, [height, layout.columns, layout.rows, mobile, scene.nodes, width]);

  const packetConnection = snapshot.packet
    ? findConnection(scene.connections, snapshot.packet.from, snapshot.packet.to)
    : undefined;

  return (
    <>
      <svg className="flow-scene__svg" viewBox={`0 0 ${width || 640} ${height || 380}`} aria-hidden="true">
        {scene.connections.map((connection) => {
          const from = frames[connection.from];
          const to = frames[connection.to];
          const path = connectionPath(from, to);
          const label = labelPoint(from, to);
          return (
            <FlowConnection
              id={connection.id}
              key={connection.id}
              label={connection.label}
              path={path}
              labelX={label.x}
              labelY={label.y}
              state={snapshot.connections[connection.id].state}
              kind={connection.kind}
            />
          );
        })}
      </svg>

      <div className="flow-scene__nodes" aria-hidden="true">
        {Object.values(snapshot.nodes).map((node) => (
          <FlowNode
            key={node.id}
            node={node}
            left={frames[node.id].left}
            top={frames[node.id].top}
            width={frames[node.id].width}
            height={frames[node.id].height}
          />
        ))}

        {snapshot.packet && packetConnection ? (
          <TravelingPacket
            packet={snapshot.packet}
            from={{
              x: frames[snapshot.packet.from].centerX,
              y: frames[snapshot.packet.from].centerY,
            }}
            to={{
              x: frames[snapshot.packet.to].centerX,
              y: frames[snapshot.packet.to].centerY,
            }}
            reducedMotion={reducedMotion}
            speed={speed}
            stepKey={stepKey}
          />
        ) : null}
      </div>
    </>
  );
}
