import type { FlowSceneResponsiveCoordinate, FlowSceneSnapshot, TreeSceneDefinition } from "../../../core/flow-scene/types";

interface TreeSceneRendererProps {
  scene: TreeSceneDefinition;
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

function pageFrame(
  keys: number[],
  position: FlowSceneResponsiveCoordinate,
  mobile: boolean,
  width: number,
  height: number,
): Frame {
  const center = point(position, mobile, width, height);
  const cellWidth = mobile ? 40 : 46;
  const frameWidth = Math.max(mobile ? 116 : 132, keys.length * cellWidth + 26);
  const frameHeight = mobile ? 56 : 60;

  return {
    left: center.x - frameWidth / 2,
    top: center.y - frameHeight / 2,
    width: frameWidth,
    height: frameHeight,
    centerX: center.x,
    centerY: center.y,
  };
}

function anchorPoint(
  scene: TreeSceneDefinition,
  snapshot: FlowSceneSnapshot,
  locationId: string,
  mobile: boolean,
  width: number,
  height: number,
) {
  const tree = snapshot.tree;
  if (!tree) return { x: width / 2, y: height / 2 };

  if (tree.pages[locationId]) {
    const frame = pageFrame(tree.pages[locationId].keys, tree.pages[locationId].position, mobile, width, height);
    return { x: frame.centerX, y: frame.centerY };
  }

  const anchor = tree.anchors[locationId] ?? scene.tree.anchors?.find((candidate) => candidate.id === locationId);
  if (!anchor) return { x: width / 2, y: height / 2 };
  return point(anchor.position, mobile, width, height);
}

export function TreeSceneRenderer({
  scene,
  snapshot,
  width,
  height,
  mobile,
}: TreeSceneRendererProps) {
  const tree = snapshot.tree;
  if (!tree) return null;

  const frames = Object.fromEntries(
    Object.values(tree.pages).map((page) => [
      page.id,
      pageFrame(page.keys, page.position, mobile, width, height),
    ]),
  ) as Record<string, Frame>;

  const tokenPoint = tree.token
    ? anchorPoint(scene, snapshot, tree.token.locationId, mobile, width, height)
    : null;

  return (
    <>
      <svg className="flow-scene__svg" viewBox={`0 0 ${width || 640} ${height || 420}`} aria-hidden="true">
        {Object.values(tree.edges).map((edge) => {
          const from = frames[edge.from];
          const to = frames[edge.to];
          if (!from || !to || !edge.visible) return null;
          return (
            <path
              key={edge.id}
              className="tree-edge"
              data-state={edge.state}
              d={`M ${from.centerX} ${from.top + from.height} C ${from.centerX} ${(from.centerY + to.centerY) / 2}, ${to.centerX} ${(from.centerY + to.centerY) / 2}, ${to.centerX} ${to.top}`}
            />
          );
        })}
        {Object.values(tree.siblingPointers).map((edge) => {
          const from = frames[edge.from];
          const to = frames[edge.to];
          if (!from || !to || !edge.visible) return null;
          return (
            <path
              key={edge.id}
              className="tree-sibling-edge"
              data-state={edge.state}
              d={`M ${from.left + from.width} ${from.centerY} C ${from.left + from.width + 34} ${from.centerY}, ${to.left - 34} ${to.centerY}, ${to.left} ${to.centerY}`}
            />
          );
        })}
      </svg>

      <div className="flow-scene__nodes tree-scene__nodes" aria-hidden="true">
        {Object.values(tree.pages).map((page) => {
          if (!page.visible) return null;
          const frame = frames[page.id];
          return (
            <div
              key={page.id}
              className="tree-page"
              data-kind={page.kind}
              data-state={page.state}
              style={{
                left: frame.left,
                top: frame.top,
                width: frame.width,
                height: frame.height,
              }}
            >
              {page.label ? <span className="tree-page__label">{page.label}</span> : null}
              <div className="tree-page__cells">
                {page.keys.map((key) => (
                  <span key={`${page.id}-${key}`} className="tree-page__cell">{key}</span>
                ))}
              </div>
            </div>
          );
        })}

        {tree.token && tokenPoint && tree.token.visible ? (
          <div
            className="tree-key-token"
            data-state={tree.token.state}
            style={{
              left: tokenPoint.x - 24,
              top: tokenPoint.y - 24,
            }}
          >
            <span>{tree.token.key}</span>
          </div>
        ) : null}

        {tree.comparison ? (
          <div
            className="tree-comparison"
            data-outcome={tree.comparison.outcome}
            style={{
              left: frames[tree.comparison.pageId].centerX - 68,
              top: frames[tree.comparison.pageId].top - 42,
            }}
          >
            {tree.comparison.key} {tree.comparison.outcome === "lt" ? "<" : tree.comparison.outcome === "gt" ? ">" : "="} {tree.comparison.against}
          </div>
        ) : null}
      </div>
    </>
  );
}
