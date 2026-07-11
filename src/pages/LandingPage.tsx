import { Link } from "react-router-dom";
import { learningPath, moduleLabels } from "../content";

export function LandingPage() {
  return (
    <main>
      <section className="landing-hero">
        <div className="landing-copy">
          <span className="eyebrow">Programação como estado observável</span>
          <h1>Veja a execução.<br />Entenda a escolha.</h1>
          <p>
            Trace transforma código, memória e arquitetura em timelines que você pode
            prever, manipular e explicar — sem esconder os custos.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" to="/app/lesson/array">Começar a jornada <span>→</span></Link>
            <a className="secondary-link" href="/prototype/trace_complete_market_v2.html">Abrir protótipo original</a>
          </div>
        </div>
        <div className="hero-trace" aria-label="Prévia da jornada de aprendizagem">
          <div className="hero-trace__header">
            <span>vertical_slice.trace</span>
            <span>{String(learningPath.length).padStart(2, "0")} estados</span>
          </div>
          <ol>
            {learningPath.map((lesson, index) => (
              <li key={lesson.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{lesson.shortTitle}</strong><small>{moduleLabels[lesson.module]}</small></div>
                <i>{lesson.icon}</i>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="principles-grid" aria-label="Princípios do Trace">
        <article><span>01</span><h2>Uma timeline</h2><p>Abstrato, prática, memória e código observam o mesmo passo — nunca quatro histórias desencontradas.</p></article>
        <article><span>02</span><h2>Custo com contexto</h2><p>O(n) vem acompanhado da entrada, dos elementos tocados e das alternativas possíveis.</p></article>
        <article><span>03</span><h2>Domínio, não cliques</h2><p>Progresso e conquistas nascem de previsões, desafios e revisões concluídas.</p></article>
      </section>
    </main>
  );
}
