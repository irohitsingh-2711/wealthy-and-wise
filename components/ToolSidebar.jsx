import Link from "next/link";
import { getRelatedCalculators } from "@/lib/calculators";

export function ToolSidebar({ currentSlug }) {
  const related = getRelatedCalculators(currentSlug);

  return (
    <aside className="sidebar-card">
      <div className="sidebar-label">Try These Next</div>
      <h3>Other calculators worth exploring</h3>
      <div className="sidebar-list">
        {related.map((tool) => (
          <Link key={tool.slug} href={`/tools/${tool.slug}`} className="sidebar-item">
            <strong>{tool.name}</strong>
            <span>{tool.description}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
