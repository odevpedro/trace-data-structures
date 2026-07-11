import { useEffect, useState } from "react";
import { useTraceStore } from "../../store/useTraceStore";

export function useReducedMotion() {
  const preference = useTraceStore((state) => state.motionPreference);
  const [systemPrefersReduced, setSystemPrefersReduced] = useState(() =>
    typeof matchMedia === "function"
      ? matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemPrefersReduced(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  if (preference === "reduced") return true;
  if (preference === "full") return false;
  return systemPrefersReduced;
}
