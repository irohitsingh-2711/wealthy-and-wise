"use client";

import { useState } from "react";
import { PostResultPrompt } from "@/components/PostResultPrompt";
import { SimpleChart } from "@/components/charts/SimpleChart";
import { formatCurrency, formatDuration } from "@/lib/format";

export function SipDurationCalculator() {
  const [values, setValues] = useState({
    target: 5000000,
    rate: 12,
    monthly: 10000,
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
    let portfolio = 0;
    let invested = 0;
    let months = 0;
    let currentSip = values.monthly;
    const labels = [];
    const investedSeries = [];
    const portfolioSeries = [];
    let yearCounter = 0;

    while (portfolio < values.target && months < 720) {
      for (let month = 0; month < 12 && portfolio < values.target; month += 1) {
        portfolio = (portfolio + currentSip) * (1 + monthlyRate);
        invested += currentSip;
        months += 1;
      }
      yearCounter += 1;
      labels.push(`Y${yearCounter}`);
      investedSeries.push(Math.round(invested));
      portfolioSeries.push(Math.round(Math.min(portfolio, values.target * 1.05)));
      if (values.stepUpEnabled && values.stepUpValue > 0) {
        currentSip =
          values.stepUpType === "percent"
            ? currentSip * (1 + values.stepUpValue / 100)
            : currentSip + values.stepUpValue;
      }
    }

    setResult({
      months,
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
          <Field label="Expected Return" value={values.rate} onChange={(value) => update("rate", value)} suffix="%" step="0.1" />
          <Field label="Monthly Contribution" value={values.monthly} onChange={(value) => update("monthly", value)} prefix="Rs" />
        </div>
        <ToggleBlock
          checked={values.stepUpEnabled}
          onChange={(checked) => update("stepUpEnabled", checked)}
          title="Step-up SIP"
          caption="Increase the SIP every year to shorten the journey."
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
          Find Time Needed
        </button>
      </div>

      {result ? (
        <div className="results-stack">
          <div className="metric-grid">
            <MetricCard
              label="Time To Goal"
              value={result.months >= 720 ? "60+ yrs" : formatDuration(result.months)}
              highlight
            />
            <MetricCard label="Total Invested" value={formatCurrency(result.invested)} />
            <MetricCard label="Estimated Returns" value={formatCurrency(result.returns)} tone="green" />
          </div>

          <SimpleChart
            type="line"
            labels={result.labels}
            datasets={[
              { label: "Invested", data: result.investedSeries, color: "#c8962f" },
              { label: "Portfolio Value", data: result.portfolioSeries, color: "#2f6fc8" }
            ]}
          />

          <PostResultPrompt
            currentSlug="sip-duration"
            message={`At this contribution level, you reach the goal in ${result.months >= 720 ? "more than 60 years" : formatDuration(result.months)}. Try Goal SIP to solve for a faster monthly amount, or use the SIP Calculator to compare different contribution paths.`}
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
        <input type="number" value={value} step={step} onChange={(event) => onChange(Number(event.target.value))} />
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
