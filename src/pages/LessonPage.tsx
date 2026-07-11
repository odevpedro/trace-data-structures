import { Link, Navigate, useParams } from "react-router-dom";
import { learningPath, lessonById } from "../content";
import { LessonPlayer } from "../features/lesson-player/LessonPlayer";

export function LessonPage() {
  const { lessonId = "" } = useParams();
  const lesson = lessonById[lessonId];
  if (!lesson) return <Navigate replace to="/app/learn" />;
  const index = learningPath.findIndex((item) => item.id === lesson.id);
  const previous = learningPath[index - 1];
  const next = learningPath[index + 1];

  return (
    <main className="lesson-page">
      <nav className="lesson-breadcrumb" aria-label="Navegação da lição">
        <Link to="/app/learn">Jornada</Link><span>/</span><span>{String(index + 1).padStart(2, "0")}</span>
      </nav>
      <LessonPlayer lesson={lesson} />
      <nav className="lesson-pagination" aria-label="Lições adjacentes">
        {previous ? <Link to={`/app/lesson/${previous.id}`}><span>← Anterior</span><strong>{previous.shortTitle}</strong></Link> : <span />}
        {next ? <Link className="next" to={`/app/lesson/${next.id}`}><span>Próxima →</span><strong>{next.shortTitle}</strong></Link> : <Link className="next" to="/app/review"><span>Agora revise →</span><strong>Flashcards</strong></Link>}
      </nav>
    </main>
  );
}
