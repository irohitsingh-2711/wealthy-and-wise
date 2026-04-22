"use client";

import { useState } from "react";
import { PostResultPrompt } from "@/components/PostResultPrompt";
import { SimpleChart } from "@/components/charts/SimpleChart";
import { formatCurrency } from "@/lib/format";

function solveFlat(target, existing, monthlyRate, months) {
  const futureExisting = existing * Math.pow(1 + monthlyRate, months);
  const remaining = target - futureExisting;
  if (remaining <= 0) return 0;
  const factor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  return remaining / factor;
}

function solveStepUp(target, existing, monthlyRate, years, stepUpValue, stepUpType) {
  function simulate(startingSip) {
    let portfolio = existing;
    let currentSip = startingSip;
    for (let year = 0; year < years; year += 1) {
      for (let month = 0; month < 12; month += 1) {
        portfolio = (portfolio + currentSip) * (1 + monthlyRate);
      }
      currentSip =
        stepUpType === "percent"
          ? currentSip * (1 + stepUpValue / 100)
          : currentSip + stepUpValue;
    }
    return portfolio;
  }

  let low = 0;
  let high = target;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const mid = (low + high) / 2;
    if (simulate(mid) < target) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return high;
}

export function GoalSipCalculator() {
  const [values, setValues] = useState({
    target: 5000000,
    years: 10,
    rate: 12,
    existing: 0,
    stepUpEnabled: false,
    stepUpValue: 10,
    stepUpType: "percent"
  });
  const [result, setResult] = useState(null);

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function calculate() {
    const monthlyRate = values.rate / 100 / 12;
    const months = values.years * 12;
    const sip = values.stepUpEnabled && values.stepUpValue > 0
      ? solveStepUp(values.target, values.existing, monthlyRate, values.years, values.stepUpValue, values.stepUpType)
      : solveFlat(values.target, values.existing, monthlyRate, months);

    let currentSip = Math.ceil(sip);
    let portfolio = values.existing;
    let invested = 0;
    const labels = [];
    const investedSeries = [];
    const portfolioSeries = [];

    for (let year = 1; year <= values.years; year += 1) {
      for (let month = 0; month < 12; month += 1) {
        portfolio = (portfolio + currentSip) * (1 + monthlyRate);
        invested += currentSip;
      }
      labels.push(`Y${year}`);
      investedSeries.push(Math.round(invested));
      portfolioSeries.push(Math.round(portfolio));
      if (values.stepUpEnabled && values.stepUpValue > 0) {
        currentSip =
          values.stepUpType === "percent"
            ? currentSip * (1 + values.stepUpValue / 100)
            : currentSip + values.stepUpValue;
      }
    }

    setResult({
      sip: Math.ceil(sip),
      invested,
      returns: portfolio - invested,
      labels,
      investedSeries,
      portfolioSeries
    });
  }

  return (
    <div className="calculator-panel">
      <div className="form-card">
        <div className="field-grid two">
          <Field label="Target Amount" value={values.target} onChange={(value) => update("target", value)} prefix="Rs" />
          <Field label="Target Years" value={values.years} onChange={(value) => update("years", value)} suffix="yrs" />
          <Field label="Expected Return" value={values.rate} onChange={(value) => update("rate", value)} suffix="%" step="0.1" />
          <Field label="Existing Corpus" value={values.existing} onChange={(value) => update("existing", value)} prefix="Rs" />
        </div>
        <ToggleBlock
          checked={values.stepUpEnabled}
          onChange={(checked) => update("stepUpEnabled", checked)}
          title="Step-up SIP"
          caption="Start lower today and increase the contribution each year."
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
          Calculate My SIP
        </button>
      </div>

      {result ? (
        <div className="results-stack">
          <div className="metric-grid">
            <MetricCard label="Required SIP" value={`${formatCurrency(result.sip)} / mo`} highlight />
            <MetricCard label="Total Invested" value={formatCurrency(result.invested)} />
            <MetricCard label="Expected Returns" value={formatCurrency(result.returns)} tone="green" />
          </div>

          <SimpleChart
            type="bar"
            labels={result.labels}
            datasets={[
              { label: "Invested", data: result.investedSeries, color: "#c8962f" },
              { label: "Portfolio Value", data: result.portfolioSeries, color: "#2f6fc8" }
            ]}
          />

          <PostResultPrompt
            currentSlug="goal-sip"
            message={`To reach your goal, you need about ${formatCurrency(result.sip)} per month. Next, open the SIP Calculator to see how that amount compounds over time, or use SIP Duration to estimate how timeline shifts if you invest a different amount.`}
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
