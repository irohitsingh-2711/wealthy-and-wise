import Link from "next/link";
import { calculators } from "@/lib/calculators";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">Finance Planner For The Indian Investor</div>
        <h1>
          Precision tools for a <em>wealthy</em> future and a <em>wise</em> plan.
        </h1>
        <p className="hero-copy">
          Model early retirement, SIP growth, home-buying tradeoffs, and target
          planning with calculators that now work together as a connected suite.
        </p>
      </section>

      <section className="home-section">
        <div className="section-label">All Tools</div>
        <div className="tools-grid">
          {calculators.map((tool, index) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className={`tool-card ${index === 0 ? "featured" : ""}`}
            >
              <div className="tool-card-number">{String(index + 1).padStart(2, "0")}</div>
              <div className="tool-card-title-row">
                <h2>{tool.name}</h2>
                <span className="tool-card-arrow">/</span>
              </div>
              <p>{tool.description}</p>
              <div className="tool-tags">
                {tool.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section home-steps">
        <div className="section-label">How It Works</div>
        <div className="steps-grid">
          <article>
            <strong>01</strong>
            <h3>Pick your question</h3>
            <p>Each calculator focuses on a specific planning decision.</p>
          </article>
          <article>
            <strong>02</strong>
            <h3>Run the numbers</h3>
            <p>Use clean forms, readable outputs, and simple charts to model scenarios.</p>
          </article>
          <article>
            <strong>03</strong>
            <h3>Follow the next step</h3>
            <p>Every result suggests related calculators so users keep exploring naturally.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
