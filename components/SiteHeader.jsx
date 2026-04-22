import Link from "next/link";
import { calculators } from "@/lib/calculators";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          Wealthy & <em>Wise</em>
        </Link>
        <nav className="tool-nav" aria-label="All tools">
          {calculators.map((tool) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`}>
              {tool.shortName}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
