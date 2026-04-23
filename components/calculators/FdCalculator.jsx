"use client";

import { useState } from "react";
import { PostResultPrompt } from "@/components/PostResultPrompt";
import { SimpleChart } from "@/components/charts/SimpleChart";
import { formatCurrency } from "@/lib/format";

export function FdCalculator() {
  const [values, setValues] = useState({
    principal: 500000,
    rate: 7.5,
    years: 5
  });
  const [result, setResult] = useState(null);

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function calculate() {
    const maturity = values.principal * Math.pow(1 + values.rate / 100, values.years);
    const interestEarned = maturity - values.principal;
    const labels = [];
    const investedSeries = [];
    const maturitySeries = [];

    for (let year = 1; year <= values.years; year += 1) {
      labels.push(`Y${year}`);
      investedSeries.push(Math.round(values.principal));
      maturitySeries.push(
        Math.round(values.principal * Math.pow(1 + values.rate / 100, year))
      );
    }

    setResult({
      maturity,
      interestEarned,
      labels,
      investedSeries,
      maturitySeries
    });
  }

  return (
    <div className="calculator-panel">
      <div className="form-card">
        <div className="field-grid two">
          <Field
            label="Lumpsum Amount"
            value={values.principal}
            onChange={(value) => update("principal", value)}
            prefix="Rs"
          />
          <Field
            label="Interest Rate"
            value={values.rate}
            onChange={(value) => update("rate", value)}
            suffix="%"
            step="0.1"
          />
          <Field
            label="Time Period"
            value={values.years}
            onChange={(value) => update("years", value)}
            suffix="yrs"
          />
        </div>
        <button className="cta-btn" onClick={calculate}>
          Calculate Maturity
        </button>
      </div>

      {result ? (
        <div className="results-stack">
          <div className="metric-grid">
            <MetricCard label="Maturity Value" value={formatCurrency(result.maturity)} highlight />
            <MetricCard label="Principal Invested" value={formatCurrency(values.principal)} />
            <MetricCard label="Interest Earned" value={formatCurrency(result.interestEarned)} tone="green" />
          </div>

          <SimpleChart
            type="bar"
            labels={result.labels}
            datasets={[
              { label: "Principal", data: result.investedSeries, color: "#c8962f" },
              { label: "Maturity Value", data: result.maturitySeries, color: "#2f6fc8" }
            ]}
          />

          <PostResultPrompt
            currentSlug="fd"
            message={`Your lumpsum grows to ${formatCurrency(result.maturity)} over ${values.years} years. Want to compare this with market-linked growth? Try the SIP Calculator or Goal SIP Calculator next.`}
          />
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange, prefix, suffix, step = "1" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        {prefix ? <span className="input-addon">{prefix}</span> : null}
        <input
          type="number"
          value={value === "" ? "" : value}
          step={step}
          onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))}
        />
        {suffix ? <span className="input-addon">{suffix}</span> : null}
      </div>
    </label>
  );
}

function MetricCard({ label, value, highlight, tone }) {
  return (
    <article className={`metric-card ${highlight ? "metric-card-highlight" : ""} ${tone === "green" ? "metric-card-green" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
