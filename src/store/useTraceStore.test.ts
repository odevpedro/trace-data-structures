import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTraceStore } from "./useTraceStore";

describe("useTraceStore", () => {
  it("dismissAchievement adiciona o id aos dispensados", () => {
    const { result } = renderHook(() => useTraceStore());

    act(() => {
      result.current.dismissAchievement("first-trace");
    });

    expect(result.current.dismissedAchievementIds).toContain("first-trace");
  });

  it("dismissAchievement não duplica o id", () => {
    const { result } = renderHook(() => useTraceStore());

    act(() => {
      result.current.dismissAchievement("first-trace");
    });

    act(() => {
      result.current.dismissAchievement("first-trace");
    });

    expect(result.current.dismissedAchievementIds).toEqual(["first-trace"]);
  });
});
