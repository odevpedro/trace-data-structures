import { Link } from "react-router-dom";
import { learningPath, moduleLabels } from "../content";
import { useTraceStore } from "../store/useTraceStore";

export function LearningPathPage() {
  const started = useTraceStore((state) => state.startedLessonIds);
  const completed = useTraceStore((state) => state.completedLessonIds);

  return (
    <main className="path-page">
      <header className="page-hero">
        <div><span className="eyebrow">Jornada · {learningPath.length} lições</span><h1>Da posição na memória ao Bloom Filter.</h1><p>{learningPath.length} traces conectam estruturas, algoritmos, lógica, memória e system design.</p></div>
        <span className="progress-number">{completed.length} / {learningPath.length} dominados</span>
      </header>
      <ol className="path-list">
        {learningPath.map((lesson, index) => {
          const status = completed.includes(lesson.id) ? "Concluído" : started.includes(lesson.id) ? "Em andamento" : "Novo";
          return (
            <li key={lesson.id}>
              <Link to={`/app/lesson/${lesson.id}`}>
                <span className="path-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="path-icon">{lesson.icon}</span>
                <span className="path-copy"><small>{moduleLabels[lesson.module]}</small><strong>{lesson.title}</strong><p>{lesson.description}</p></span>
                <span className="path-status" data-status={status}>{status}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
