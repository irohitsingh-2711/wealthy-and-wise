export const calculators = [
  {
    slug: "fire",
    shortName: "FIRE",
    name: "FIRE Calculator",
    category: "Financial Independence Tool",
    headingEmphasis: "FIRE",
    headingSuffix: "Calculator",
    description:
      "Calculate your financial independence corpus, projected portfolio, and retirement-readiness gap.",
    tags: ["FIRE Number", "Inflation Adjusted", "SWR"]
  },
  {
    slug: "coast-fire",
    shortName: "Coast FIRE",
    name: "Coast FIRE Calculator",
    category: "Financial Independence Tool",
    headingEmphasis: "Coast FIRE",
    headingSuffix: "Calculator",
    description:
      "Find when your portfolio can stop receiving contributions and still grow to your retirement target.",
    tags: ["Coasting", "Compounding", "Retirement"]
  },
  {
    slug: "rent-vs-buy",
    shortName: "Rent vs Buy",
    name: "Rent vs Buy Calculator",
    category: "Financial Comparison",
    headingPrefix: "Rent vs",
    headingEmphasis: "Buy",
    description:
      "Compare long-term wealth outcomes between buying a home and renting while investing the difference.",
    tags: ["Real Estate", "EMI", "Wealth Gap"]
  },
  {
    slug: "goal-sip",
    shortName: "Goal SIP",
    name: "Goal SIP Calculator",
    category: "Goal Planning Tool",
    headingEmphasis: "Goal SIP",
    headingSuffix: "Calculator",
    description:
      "Solve for the monthly SIP needed to reach a target corpus within your chosen timeline.",
    tags: ["Goal Planning", "Required SIP", "Target Corpus"]
  },
  {
    slug: "sip",
    shortName: "SIP",
    name: "SIP Calculator",
    category: "Investment Planning Tool",
    headingEmphasis: "SIP",
    headingSuffix: "Calculator",
    description:
      "Project how monthly contributions grow with compounding, including optional annual step-ups.",
    tags: ["Returns", "Growth", "Step Up"]
  },
  {
    slug: "sip-duration",
    shortName: "Time Estimator",
    name: "SIP Duration Estimator",
    category: "Investment Planning Tool",
    headingPrefix: "How Long Should I",
    headingEmphasis: "Invest?",
    description:
      "Estimate how long it takes to reach a target corpus with your current SIP amount and returns.",
    tags: ["Timeline", "Target Date", "Compounding"]
  },
  {
    slug: "fd",
    shortName: "FD / Lumpsum",
    name: "FD / Lumpsum Calculator",
    category: "Fixed Income Tool",
    headingEmphasis: "FD / Lumpsum",
    headingSuffix: "Calculator",
    description:
      "Calculate the maturity value of a one-time fixed deposit or lumpsum investment using the interest rate and time period.",
    tags: ["FD", "Lumpsum", "Maturity Value"]
  }
];

export function getCalculatorBySlug(slug) {
  return calculators.find((tool) => tool.slug === slug);
}

export function getRelatedCalculators(currentSlug) {
  return calculators.filter((tool) => tool.slug !== currentSlug);
}
