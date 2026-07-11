import { useTraceStore } from "../../store/useTraceStore";

export function AchievementNotice() {
  const unlocked = useTraceStore((state) => state.achievementIds.includes("first-trace"));
  if (!unlocked) return null;

  return (
    <aside className="achievement-notice" aria-label="Conquista desbloqueada">
      <span className="achievement-mark">T</span>
      <div>
        <span className="eyebrow">Conquista de domínio</span>
        <strong>Primeiro Trace</strong>
        <p>Você concluiu um desafio explicando a regra central, não apenas clicando até o fim.</p>
      </div>
    </aside>
  );
}
