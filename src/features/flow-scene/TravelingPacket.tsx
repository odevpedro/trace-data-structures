import type { CSSProperties } from "react";
import type { FlowScenePacketDefinition } from "../../core/flow-scene/types";

interface TravelingPacketProps {
  packet: FlowScenePacketDefinition;
  from: { x: number; y: number };
  to: { x: number; y: number };
  reducedMotion: boolean;
  speed: number;
  stepKey: string;
}

export function TravelingPacket({
  packet,
  from,
  to,
  reducedMotion,
  speed,
  stepKey,
}: TravelingPacketProps) {
  return (
    <div
      key={`${stepKey}-${packet.id}`}
      className="flow-packet"
      data-semantic={packet.semantic}
      data-reduced-motion={reducedMotion}
      style={{
        "--packet-from-x": `${from.x}px`,
        "--packet-from-y": `${from.y}px`,
        "--packet-to-x": `${to.x}px`,
        "--packet-to-y": `${to.y}px`,
        "--packet-duration": `${Math.max(420, 880 / speed)}ms`,
      } as CSSProperties}
      aria-hidden="true"
    />
  );
}
