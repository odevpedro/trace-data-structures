import { describe, expect, it } from "vitest";
import { lessonById } from "../../content/lessons";
import { reduceTrace } from "./reduceTrace";
import type { TraceDefinition } from "./types";

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

  it("permite busca linear ausente sem quebrar o estado final", () => {
    const lesson = lessonById["linear-search"];
    const trace = lesson.createTrace?.({ target: 20 }) ?? lesson.trace;
    const scene = reduceTrace(trace, trace.steps.length - 1);

    expect(scene.nodes.answer.value).toBe(-1);
    expect(scene.nodes["item-3"].visible).toBe(true);
  });

  it("escolhe apenas o ramo verdadeiro de uma condição", () => {
    const lesson = lessonById["condition-if"];
    const trace = lesson.createTrace?.({ age: 21 }) ?? lesson.trace;
    const scene = reduceTrace(trace, 3);

    expect(scene.nodes.allowed.emphasis).toBe("success");
    expect(scene.nodes.blocked.emphasis).toBe("muted");
  });

  it("volta ao passo zero redefine o estado inicial", () => {
    const trace = lessonById.array.trace;
    const scene = reduceTrace(trace, 0);

    expect(scene.nodes.four.position).toEqual({ x: 45, y: 176 });
    expect(scene.nodes.four.visible).toBe(true);
    expect(scene.nodes.four.emphasis).toBe("idle");
    expect(scene.nodes.six.emphasis).toBe("active");
    expect(scene.nodes.sixteen.position).toEqual({ x: 381, y: 176 });
  });

  it("navega para frente e depois volta mantém coerência", () => {
    const trace = lessonById.array.trace;
    const atStep3 = reduceTrace(trace, 3);
    const atStep1 = reduceTrace(trace, 1);

    expect(atStep1.nodes.sixteen.position).toEqual({ x: 493, y: 176 });
    expect(atStep1.nodes.twelve.position).toEqual({ x: 269, y: 176 });
    expect(atStep3.nodes.twelve.position).toEqual({ x: 381, y: 176 });
  });

  it("lição desconhecida não quebra", () => {
    const trace: TraceDefinition = {
      id: "empty",
      scene: { nodes: [], edges: [] },
      steps: [],
    };
    const scene = reduceTrace(trace, 0);

    expect(scene.nodes).toEqual({});
    expect(scene.edges).toEqual({});
  });
});
