import type {
  FlowSceneResponsiveCoordinate,
  FlowSceneSnapshot,
  MessageStatus,
  QueueSceneDefinition,
} from "../../../core/flow-scene/types";

interface QueueSceneRendererProps {
  scene: QueueSceneDefinition;
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
  node: QueueSceneDefinition["queue"]["nodes"][number],
  mobile: boolean,
  width: number,
  height: number,
): Frame {
  const center = point(node.position, mobile, width, height);
  const dimensions = {
    queue: mobile ? { width: 146, height: 70 } : { width: 164, height: 78 },
    worker: mobile ? { width: 110, height: 68 } : { width: 116, height: 72 },
    processor: mobile ? { width: 128, height: 74 } : { width: 136, height: 78 },
    retry: mobile ? { width: 118, height: 60 } : { width: 124, height: 64 },
    dlq: mobile ? { width: 136, height: 70 } : { width: 150, height: 74 },
    outcome: mobile ? { width: 122, height: 56 } : { width: 128, height: 60 },
  }[node.kind];

  return {
    left: center.x - dimensions.width / 2,
    top: center.y - dimensions.height / 2,
    width: dimensions.width,
    height: dimensions.height,
    centerX: center.x,
    centerY: center.y,
  };
}

function anchorPoint(
  scene: QueueSceneDefinition,
  snapshot: FlowSceneSnapshot,
  locationId: string,
  mobile: boolean,
  width: number,
  height: number,
) {
  const queue = snapshot.queue;
  if (!queue) return { x: width / 2, y: height / 2 };

  if (queue.nodes[locationId]) {
    const frame = nodeFrame(queue.nodes[locationId], mobile, width, height);
    return { x: frame.centerX, y: frame.centerY };
  }

  const anchor = queue.anchors[locationId] ?? scene.queue.anchors?.find((candidate) => candidate.id === locationId);
  if (!anchor) return { x: width / 2, y: height / 2 };
  return point(anchor.position, mobile, width, height);
}

function messageTone(status: MessageStatus) {
  switch (status) {
    case "processing":
      return "processing";
    case "failed":
      return "failed";
    case "retrying":
      return "retrying";
    case "dead-lettered":
      return "dead-lettered";
    case "completed":
      return "completed";
    default:
      return "queued";
  }
}

function queuePath(from: Frame, to: Frame) {
  const sameRow = Math.abs(from.centerY - to.centerY) < 40;
  if (sameRow) {
    return `M ${from.centerX} ${from.centerY} C ${(from.centerX + to.centerX) / 2} ${from.centerY}, ${(from.centerX + to.centerX) / 2} ${to.centerY}, ${to.centerX} ${to.centerY}`;
  }

  return `M ${from.centerX} ${from.centerY} C ${from.centerX} ${(from.centerY + to.centerY) / 2}, ${to.centerX} ${(from.centerY + to.centerY) / 2}, ${to.centerX} ${to.centerY}`;
}

export function QueueSceneRenderer({
  scene,
  snapshot,
  width,
  height,
  mobile,
}: QueueSceneRendererProps) {
  const queue = snapshot.queue;
  if (!queue) return null;

  const frames = Object.fromEntries(
    Object.values(queue.nodes).map((node) => [
      node.id,
      nodeFrame(node, mobile, width, height),
    ]),
  ) as Record<string, Frame>;

  return (
    <>
      <svg className="flow-scene__svg" viewBox={`0 0 ${width || 640} ${height || 420}`} aria-hidden="true">
        {Object.values(queue.paths).map((path) => {
          const from = frames[path.from];
          const to = frames[path.to];
          if (!from || !to || !path.visible) return null;
          return (
            <path
              key={path.id}
              className="queue-path"
              data-state={path.state}
              d={queuePath(from, to)}
            />
          );
        })}
      </svg>

      <div className="flow-scene__nodes queue-scene__nodes" aria-hidden="true">
        {Object.values(queue.nodes).map((node) => {
          const frame = frames[node.id];
          return (
            <div
              key={node.id}
              className="queue-node"
              data-kind={node.kind}
              data-state={node.state}
              style={{
                left: frame.left,
                top: frame.top,
                width: frame.width,
                height: frame.height,
              }}
            >
              <span className="queue-node__kicker">{node.kind === "dlq" ? "falha final" : node.kind}</span>
              <strong>{node.label}</strong>
              <p>{node.description}</p>
            </div>
          );
        })}

        {Object.values(queue.messages).map((message) => {
          if (!message.visible) return null;
          const position = anchorPoint(scene, snapshot, message.locationId, mobile, width, height);
          return (
            <div
              key={message.id}
              className="queue-message-token"
              data-status={messageTone(message.status)}
              style={{
                left: position.x - 72,
                top: position.y - 28,
              }}
            >
              <strong>{message.label}</strong>
              <span className="queue-message-token__meta">attempt {message.attempt}/{message.maxAttempts}</span>
              <span className="queue-message-token__status">{message.status}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
