"use client";

import { useState } from "react";
import { PostResultPrompt } from "@/components/PostResultPrompt";
import { SimpleChart } from "@/components/charts/SimpleChart";
import { formatCurrency } from "@/lib/format";

export function SipCalculator() {
  const [values, setValues] = useState({
    monthly: 10000,
    rate: 12,
    years: 10,
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
    let currentSip = values.monthly;
    let portfolio = 0;
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
      invested,
      returns: portfolio - invested,
      maturity: portfolio,
      labels,
      investedSeries,
      portfolioSeries
    });
  }

  return (
    <div className="calculator-panel">
      <div className="form-card">
        <div className="field-grid two">
          <Field label="Monthly Contribution" value={values.monthly} onChange={(value) => update("monthly", value)} prefix="Rs" />
          <Field label="Expected Return" value={values.rate} onChange={(value) => update("rate", value)} suffix="%" step="0.1" />
          <Field label="Investment Duration" value={values.years} onChange={(value) => update("years", value)} suffix="yrs" />
        </div>
        <ToggleBlock
          checked={values.stepUpEnabled}
          onChange={(checked) => update("stepUpEnabled", checked)}
          title="Step-up SIP"
          caption="Increase the SIP every year as income grows."
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
          Calculate Returns
        </button>
      </div>

      {result ? (
        <div className="results-stack">
          <div className="metric-grid">
            <MetricCard label="Maturity Value" value={formatCurrency(result.maturity)} highlight />
            <MetricCard label="Total Invested" value={formatCurrency(result.invested)} />
            <MetricCard label="Estimated Returns" value={formatCurrency(result.returns)} tone="green" />
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
            currentSlug="sip"
            message={`This SIP grows to ${formatCurrency(result.maturity)}. Want to pressure-test the plan? Use the SIP Duration tool to see how fast you hit a goal, or open Goal SIP to back-solve the monthly amount needed for a target corpus.`}
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
