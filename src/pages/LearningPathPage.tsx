import { useState } from "react";
import { Link } from "react-router-dom";
import { learningPath, moduleLabels } from "../content";
import { useTraceStore } from "../store/useTraceStore";

const moduleKeys = ["data-structure", "algorithm", "logic", "memory", "system-design"] as const;

export function LearningPathPage() {
  const started = useTraceStore((state) => state.startedLessonIds);
  const completed = useTraceStore((state) => state.completedLessonIds);
  const [search, setSearch] = useState("");
  const [modules, setModules] = useState<Set<string>>(new Set());

  const toggleModule = (key: string) => {
    setModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const query = search.toLowerCase();
  const filtered = learningPath.filter((l) => {
    if (modules.size > 0 && !modules.has(l.module)) return false;
    if (query && !l.title.toLowerCase().includes(query) && !l.description.toLowerCase().includes(query)) return false;
    return true;
  });

  return (
    <main className="path-page">
      <header className="page-hero">
        <div><span className="eyebrow">Jornada · {learningPath.length} lições</span><h1>Da posição na memória ao Bloom Filter.</h1><p>{learningPath.length} traces conectam estruturas, algoritmos, lógica, memória e system design.</p></div>
        <span className="progress-number">{completed.length} / {learningPath.length} dominados</span>
        <Link to="/app/progress" className="text-button">Ver progresso →</Link>
      </header>
      <div className="path-search">
        <input
          type="search"
          placeholder="Filtrar lições…"
          aria-label="Filtrar lições por nome"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="path-modules" role="group" aria-label="Filtrar por módulo">
          {moduleKeys.map((key) => (
            <button
              type="button"
              aria-pressed={modules.has(key)}
              key={key}
              onClick={() => toggleModule(key)}
            >
              {moduleLabels[key]}
            </button>
          ))}
        </div>
      </div>
      <ol className="path-list">
        {filtered.map((lesson) => {
          const index = learningPath.indexOf(lesson);
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
