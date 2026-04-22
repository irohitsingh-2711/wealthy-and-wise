import Link from "next/link";
import { getRelatedCalculators } from "@/lib/calculators";

export function PostResultPrompt({ currentSlug, message }) {
  const related = getRelatedCalculators(currentSlug).slice(0, 3);

  return (
    <section className="post-prompt">
      <div className="section-label">What To Explore Next</div>
      <textarea
        className="prompt-box"
        readOnly
        value={message}
        aria-label="Suggested next step"
      />
      <div className="prompt-links">
        {related.map((tool) => (
          <Link key={tool.slug} href={`/tools/${tool.slug}`} className="prompt-link">
            Try {tool.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
