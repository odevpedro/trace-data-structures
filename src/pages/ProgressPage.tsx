import { Link } from "react-router-dom";
import { achievements } from "../content/achievements";
import { useTraceStore } from "../store/useTraceStore";

export function ProgressPage() {
  const completedLessonIds = useTraceStore((s) => s.completedLessonIds);
  const startedLessonIds = useTraceStore((s) => s.startedLessonIds);
  const achievementIds = useTraceStore((s) => s.achievementIds);
  const flashcards = useTraceStore((s) => s.flashcards);
  const totalLessons = 25;
  const completed = completedLessonIds.length;
  const started = startedLessonIds.length;
  const totalReviews = Object.values(flashcards).reduce((sum, c) => sum + c.reviews, 0);

  return (
    <main className="progress-page">
      <nav className="lesson-breadcrumb" aria-label="Navegação do progresso">
        <Link to="/app/learn">Jornada</Link><span>/</span><span>Progresso</span>
      </nav>

      <header className="page-hero">
        <h1>Seu progresso</h1>
      </header>

      <section className="progress-stats" aria-label="Estatísticas">
        <div className="stat-card">
          <strong className="stat-value">{completed}</strong>
          <span className="stat-label">Lições concluídas</span>
        </div>
        <div className="stat-card">
          <strong className="stat-value">{started}</strong>
          <span className="stat-label">Lições iniciadas</span>
        </div>
        <div className="stat-card">
          <strong className="stat-value">{totalReviews}</strong>
          <span className="stat-label">Revisões</span>
        </div>
        <div className="stat-card">
          <strong className="stat-value">{achievementIds.length}</strong>
          <span className="stat-label">Conquistas</span>
        </div>
      </section>

      <section aria-label="Conquistas">
        <h2>Conquistas</h2>
        <div className="achievement-grid">
          {achievements.map((a) => {
            const unlocked = achievementIds.includes(a.id);
            return (
              <div
                key={a.id}
                className="achievement-card"
                data-unlocked={unlocked}
              >
                <span className="achievement-icon">{a.icon}</span>
                <div>
                  <strong>{a.title}</strong>
                  <p>{a.description}</p>
                  <small>{a.condition}</small>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Link to="/app/learn" className="text-button">
        ← Voltar à jornada
      </Link>
    </main>
  );
}
