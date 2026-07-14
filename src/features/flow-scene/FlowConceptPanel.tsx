import type { FlowSceneConcept } from "../../core/flow-scene/types";

interface FlowConceptPanelProps {
  concept: FlowSceneConcept;
}

export function FlowConceptPanel({ concept }: FlowConceptPanelProps) {
  return (
    <section className="flow-concept-panel" aria-label="Conceito em foco">
      <div className="flow-concept-panel__header">
        <span className="eyebrow">Conceito em foco</span>
        <strong>{concept.title}</strong>
        <p>{concept.summary}</p>
        {concept.longform?.map((paragraph) => (
          <p className="flow-concept-panel__longform" key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="flow-concept-panel__grid">
        <section>
          <span className="eyebrow">O que está acontecendo</span>
          <ul>
            {concept.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </section>

        {concept.payloadLines?.length ? (
          <section>
            <span className="eyebrow">{concept.payloadTitle ?? "Payload ilustrativo"}</span>
            <pre>{concept.payloadLines.join("\n")}</pre>
          </section>
        ) : null}

        {concept.alternatePath ? (
          <section>
            <span className="eyebrow">{concept.alternatePath.title}</span>
            <p>{concept.alternatePath.summary}</p>
            <ul>
              {concept.alternatePath.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {concept.glossary?.length ? (
          <section>
            <span className="eyebrow">Glossário rápido</span>
            <dl>
              {concept.glossary.map((item) => (
                <div key={item.term}>
                  <dt>{item.term}</dt>
                  <dd>{item.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {concept.pitfalls?.length ? (
          <section>
            <span className="eyebrow">Confusões comuns</span>
            <ul>
              {concept.pitfalls.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </section>
  );
}
