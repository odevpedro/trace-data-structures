import { useEffect, useMemo } from "react";
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { AchievementNotice } from "../features/progress/AchievementNotice";
import { LandingPage } from "../pages/LandingPage";
import { LearningPathPage } from "../pages/LearningPathPage";
import { LessonPage } from "../pages/LessonPage";
import { ReviewPage } from "../pages/ReviewPage";
import { ProgressPage } from "../pages/ProgressPage";
import { ComparePage } from "../pages/ComparePage";
import {
  createBrowserProgressRepository,
  type ProgressRepository,
} from "../storage/progressRepository";
import { useTraceStore } from "../store/useTraceStore";
import { PersistenceBridge } from "./PersistenceBridge";

interface AppProps {
  repository?: ProgressRepository;
}

function AppShell() {
  const theme = useTraceStore((state) => state.theme);
  const motionPreference = useTraceStore((state) => state.motionPreference);
  const setTheme = useTraceStore((state) => state.setTheme);
  const setMotionPreference = useTraceStore((state) => state.setMotionPreference);
  const completed = useTraceStore((state) => state.completedLessonIds.length);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.motion = motionPreference;
  }, [motionPreference, theme]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <header className="topbar">
        <Link className="brand" to="/" aria-label="Trace, início"><span>T</span><strong>Trace</strong></Link>
        <nav className="primary-nav" aria-label="Navegação principal">
          <NavLink to="/app/learn">Aprender</NavLink>
          <NavLink to="/app/review">Revisar</NavLink>
          <NavLink to="/app/lesson/request-flow">System design</NavLink>
        </nav>
        <div className="top-actions">
          <span className="domain-count">{completed} dominados</span>
          <label className="motion-select"><span className="sr-only">Preferência de movimento</span><select aria-label="Preferência de movimento" value={motionPreference} onChange={(event) => setMotionPreference(event.target.value as "system" | "reduced" | "full")}><option value="system">Motion: sistema</option><option value="reduced">Motion: reduzido</option><option value="full">Motion: completo</option></select></label>
          <button className="theme-button" type="button" aria-label={`Usar tema ${theme === "dark" ? "claro" : "escuro"}`} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>◐</button>
        </div>
      </header>
      <div id="main-content" className="content-shell">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<Navigate replace to="/app/learn" />} />
          <Route path="/app/learn" element={<LearningPathPage />} />
          <Route path="/app/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/app/review" element={<ReviewPage />} />
          <Route path="/app/progress" element={<ProgressPage />} />
          <Route path="/app/compare/:comparisonId" element={<ComparePage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
      <AchievementNotice />
      <footer className="site-footer"><span>Trace · vertical slice 0.1</span><a href="/prototype/trace_complete_market_v2.html">Protótipo preservado ↗</a></footer>
    </div>
  );
}

export function App({ repository }: AppProps) {
  const progressRepository = useMemo(
    () => repository ?? createBrowserProgressRepository(),
    [repository],
  );
  return (
    <BrowserRouter>
      <PersistenceBridge repository={progressRepository} />
      <AppShell />
    </BrowserRouter>
  );
}
