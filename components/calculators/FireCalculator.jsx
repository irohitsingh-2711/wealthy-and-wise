"use client";

import { useState } from "react";
import { PostResultPrompt } from "@/components/PostResultPrompt";
import { SimpleChart } from "@/components/charts/SimpleChart";
import { formatCurrency } from "@/lib/format";

export function FireCalculator() {
  const [values, setValues] = useState({
    age: 30,
    retireAge: 50,
    expenses: 60000,
    inflation: 6,
    growth: 12,
    postGrowth: 8,
    corpus: 500000,
    monthly: 25000,
    swr: 4,
    stepUpEnabled: false,
    stepUpValue: 10,
    stepUpType: "percent"
  });
  const [result, setResult] = useState(null);

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function calculate() {
    const years = Math.max(values.retireAge - values.age, 0);
    const annualExpenses =
      values.expenses * 12 * Math.pow(1 + values.inflation / 100, years);
    const fireNumber = annualExpenses / (values.swr / 100);
    const monthlyRate = values.growth / 100 / 12;
    let currentSip = values.monthly;
    let portfolio = values.corpus;
    let invested = 0;
    const labels = [String(values.age)];
    const portfolioSeries = [Math.round(portfolio)];
    const targetSeries = [Math.round(fireNumber)];

    for (let year = 1; year <= years; year += 1) {
      for (let month = 0; month < 12; month += 1) {
        portfolio = (portfolio + currentSip) * (1 + monthlyRate);
        invested += currentSip;
      }

      labels.push(String(values.age + year));
      portfolioSeries.push(Math.round(portfolio));
      targetSeries.push(Math.round(fireNumber));

      if (values.stepUpEnabled && values.stepUpValue > 0) {
        currentSip =
          values.stepUpType === "percent"
            ? currentSip * (1 + values.stepUpValue / 100)
            : currentSip + values.stepUpValue;
      }
    }

    const gap = portfolio - fireNumber;
    setResult({
      fireNumber,
      annualExpenses,
      projectedCorpus: portfolio,
      gap,
      progress: Math.min((portfolio / fireNumber) * 100, 100),
      years,
      labels,
      portfolioSeries,
      targetSeries
    });
  }

  return (
    <div className="calculator-panel">
      <div className="form-card">
        <div className="field-grid two">
          <Field label="Current Age" value={values.age} onChange={(value) => update("age", value)} suffix="yrs" />
          <Field label="Retirement Age" value={values.retireAge} onChange={(value) => update("retireAge", value)} suffix="yrs" />
          <Field label="Monthly Expenses" value={values.expenses} onChange={(value) => update("expenses", value)} prefix="Rs" />
          <Field label="Inflation" value={values.inflation} onChange={(value) => update("inflation", value)} suffix="%" step="0.1" />
          <Field label="Pre-Retirement Return" value={values.growth} onChange={(value) => update("growth", value)} suffix="%" step="0.1" />
          <Field label="Post-Retirement Return" value={values.postGrowth} onChange={(value) => update("postGrowth", value)} suffix="%" step="0.1" />
          <Field label="Current Portfolio" value={values.corpus} onChange={(value) => update("corpus", value)} prefix="Rs" />
          <Field label="Monthly SIP" value={values.monthly} onChange={(value) => update("monthly", value)} prefix="Rs" />
          <Field label="Safe Withdrawal Rate" value={values.swr} onChange={(value) => update("swr", value)} suffix="%" step="0.1" />
        </div>
        <ToggleBlock
          checked={values.stepUpEnabled}
          onChange={(checked) => update("stepUpEnabled", checked)}
          title="Step-up SIP"
          caption="Increase your monthly contribution every year."
        >
          <div className="field-grid two compact">
            <Field label="Annual Increase" value={values.stepUpValue} onChange={(value) => update("stepUpValue", value)} />
            <SelectField
              label="Step-up Type"
              value={values.stepUpType}
              onChange={(value) => update("stepUpType", value)}
              options={[
                { label: "% per year", value: "percent" },
                { label: "Fixed Rs per year", value: "fixed" }
              ]}
            />
          </div>
        </ToggleBlock>
        <button className="cta-btn" onClick={calculate}>
          Calculate FIRE Number
        </button>
      </div>

      {result ? (
        <div className="results-stack">
          <div className="metric-grid">
            <MetricCard label="Your FIRE Number" value={formatCurrency(result.fireNumber)} highlight />
            <MetricCard label="Projected Corpus" value={formatCurrency(result.projectedCorpus)} tone="green" />
            <MetricCard
              label="Gap / Surplus"
              value={`${result.gap >= 0 ? "+" : "-"}${formatCurrency(Math.abs(result.gap))}`}
            />
            <MetricCard label="Inflation-Adjusted Annual Spend" value={formatCurrency(result.annualExpenses)} />
          </div>

          <div className="progress-card">
            <div className="progress-row">
              <span>Progress to FIRE</span>
              <strong>{result.progress.toFixed(1)}%</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill fire" style={{ width: `${result.progress}%` }} />
            </div>
          </div>

          <SimpleChart
            type="line"
            labels={result.labels}
            datasets={[
              { label: "Projected Corpus", data: result.portfolioSeries, color: "#c8962f" },
              { label: "FIRE Number", data: result.targetSeries, color: "#e05a1a", dashed: true }
            ]}
          />

          <PostResultPrompt
            currentSlug="fire"
            message={`Your FIRE corpus is ${formatCurrency(result.fireNumber)}. Next, use Coast FIRE to see when your current portfolio can stop receiving new contributions, or use Goal SIP to back-solve the monthly investment required.`}
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

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="select-field" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleBlock({ checked, onChange, title, caption, children }) {
  return (
    <div className="toggle-block">
      <label className="toggle-header">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <div>
          <strong>{title}</strong>
          <span>{caption}</span>
        </div>
      </label>
      {checked ? <div className="toggle-content">{children}</div> : null}
    </div>
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
