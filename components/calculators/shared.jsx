import { ToolSidebar } from "@/components/ToolSidebar";

export function CalculatorShell({ tool, children }) {
  return (
    <>
      <section className="calculator-hero">
        <div className="eyebrow">{tool.category}</div>
        <h1>
          {tool.headingPrefix ? `${tool.headingPrefix} ` : ""}
          {tool.headingEmphasis ? <em>{tool.headingEmphasis}</em> : null}
          {tool.headingSuffix ? ` ${tool.headingSuffix}` : ""}
        </h1>
        <p>{tool.description}</p>
      </section>

      <section className="calculator-layout">
        <div className="calculator-main">{children}</div>
        <div className="calculator-side">
          <ToolSidebar currentSlug={tool.slug} />
        </div>
      </section>
    </>
  );
}
