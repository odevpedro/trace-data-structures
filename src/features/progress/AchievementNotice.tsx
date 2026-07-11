import { useTraceStore } from "../../store/useTraceStore";

export function AchievementNotice() {
  const unlocked = useTraceStore((state) => state.achievementIds.includes("first-trace"));
  const dismissed = useTraceStore((state) => state.dismissedAchievementIds.includes("first-trace"));
  const dismiss = useTraceStore((state) => state.dismissAchievement);
  if (!unlocked || dismissed) return null;

  return (
    <aside className="achievement-notice" aria-label="Conquista desbloqueada">
      <span className="achievement-mark">T</span>
      <div>
        <span className="eyebrow">Conquista de domínio</span>
        <strong>Primeiro Trace</strong>
        <p>Você concluiu um desafio explicando a regra central, não apenas clicando até o fim.</p>
      </div>
      <button
        className="achievement-dismiss"
        type="button"
        aria-label="Dispensar conquista"
        onClick={() => dismiss("first-trace")}
      >
        ✕
      </button>
    </aside>
  );
}
