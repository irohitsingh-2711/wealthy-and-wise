import { notFound } from "next/navigation";
import {
  CalculatorShell,
  CoastFireCalculator,
  FireCalculator,
  GoalSipCalculator,
  RentVsBuyCalculator,
  SipCalculator,
  SipDurationCalculator
} from "@/components/calculators";
import { getCalculatorBySlug } from "@/lib/calculators";

const componentMap = {
  fire: FireCalculator,
  "coast-fire": CoastFireCalculator,
  "rent-vs-buy": RentVsBuyCalculator,
  "goal-sip": GoalSipCalculator,
  sip: SipCalculator,
  "sip-duration": SipDurationCalculator
};

export function generateMetadata({ params }) {
  const tool = getCalculatorBySlug(params.slug);
  if (!tool) {
    return {};
  }

  return {
    title: `${tool.name} | Wealthy and Wise`,
    description: tool.description
  };
}

export function generateStaticParams() {
  return Object.keys(componentMap).map((slug) => ({ slug }));
}

export default function ToolPage({ params }) {
  const tool = getCalculatorBySlug(params.slug);
  if (!tool) {
    notFound();
  }

  const Component = componentMap[params.slug];

  return (
    <main className="page-shell">
      <CalculatorShell tool={tool}>
        <Component tool={tool} />
      </CalculatorShell>
    </main>
  );
}
