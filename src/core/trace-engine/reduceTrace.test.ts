import { describe, expect, it } from "vitest";
import { lessonById } from "../../content/lessons";
import { reduceTrace } from "./reduceTrace";

describe("reduceTrace", () => {
  it("reproduz a inserção do array acumulando os eventos da timeline", () => {
    const trace = lessonById.array.trace;
    const scene = reduceTrace(trace, trace.steps.length - 1);

    expect(scene.nodes.six.position).toEqual({ x: 157, y: 176 });
    expect(scene.nodes.six.visible).toBe(true);
    expect(scene.nodes.six.emphasis).toBe("success");
    expect(scene.nodes.sixteen.position.x).toBe(493);
  });

  it("mantém elementos não removidos no estado entre passos", () => {
    const trace = lessonById["linear-search"].trace;
    const firstComparison = reduceTrace(trace, 1);
    const match = reduceTrace(trace, 3);

    expect(firstComparison.nodes["item-0"].visible).toBe(true);
    expect(match.nodes["item-0"].visible).toBe(true);
    expect(match.nodes["item-0"].emphasis).toBe("visited");
    expect(match.nodes["item-2"].emphasis).toBe("success");
  });

  it("escolhe apenas o ramo verdadeiro de uma condição", () => {
    const lesson = lessonById["condition-if"];
    const trace = lesson.createTrace?.({ age: 21 }) ?? lesson.trace;
    const scene = reduceTrace(trace, 3);

    expect(scene.nodes.allowed.emphasis).toBe("success");
    expect(scene.nodes.blocked.emphasis).toBe("muted");
  });
});
