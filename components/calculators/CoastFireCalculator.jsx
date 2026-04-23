"use client";

import Link from "next/link";
import { useState } from "react";
import { PostResultPrompt } from "@/components/PostResultPrompt";
import { SimpleChart } from "@/components/charts/SimpleChart";
import { formatCurrency } from "@/lib/format";

export function CoastFireCalculator() {
  const [values, setValues] = useState({
    age: 30,
    retireAge: 55,
    expenses: 60000,
    inflation: 6,
    growth: 12,
    swr: 4,
    current: 500000,
    monthly: 15000,
    stepUpEnabled: false,
    stepUpValue: 10,
    stepUpType: "percent"
  });
  const [result, setResult] = useState(null);
  const [unreachable, setUnreachable] = useState(null);

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function calculate() {
    const yearsToRetire = Math.max(values.retireAge - values.age, 0);
    const inflationAdjustedSpend =
      values.expenses * 12 * Math.pow(1 + values.inflation / 100, yearsToRetire);
    const fireNumber = inflationAdjustedSpend / (values.swr / 100);
    const coastNumber = fireNumber / Math.pow(1 + values.growth / 100, yearsToRetire);
    const monthlyRate = values.growth / 100 / 12;

    let portfolio = values.current;
    let currentSip = values.monthly;
    let invested = 0;
    let coastAge = null;
    const labels = [];
    const portfolioSeries = [];
    const fireSeries = [];
    const coastSeries = [];

    for (let year = 0; year <= yearsToRetire; year += 1) {
      const age = values.age + year;
      labels.push(String(age));
      portfolioSeries.push(Math.round(portfolio));
      fireSeries.push(Math.round(fireNumber));
      coastSeries.push(
        Math.round(fireNumber / Math.pow(1 + values.growth / 100, values.retireAge - age))
      );

      if (portfolio >= coastNumber && coastAge === null) {
        coastAge = age;
      }

      if (year < yearsToRetire) {
        const stillContributing = coastAge === null;
        for (let month = 0; month < 12; month += 1) {
          portfolio = (portfolio + (stillContributing ? currentSip : 0)) * (1 + monthlyRate);
          if (stillContributing) invested += currentSip;
        }

        if (stillContributing && values.stepUpEnabled && values.stepUpValue > 0) {
          currentSip =
            values.stepUpType === "percent"
              ? currentSip * (1 + values.stepUpValue / 100)
              : currentSip + values.stepUpValue;
        }
      }
    }

    if (coastAge === null) {
      const futureValueFactor = Math.pow(1 + monthlyRate, yearsToRetire * 12);
      const annuityFactor = ((futureValueFactor - 1) / monthlyRate) * (1 + monthlyRate);
      const requiredSip = Math.max(0, (coastNumber - values.current * futureValueFactor) / annuityFactor);
      setResult(null);
      setUnreachable({
        coastNumber,
        finalCorpus: portfolioSeries[portfolioSeries.length - 1],
        requiredSip,
        extraYears: Math.ceil((coastNumber - portfolioSeries[portfolioSeries.length - 1]) / Math.max(values.monthly * 12, 1))
      });
      return;
    }

    setUnreachable(null);
    setResult({
      coastNumber,
      fireNumber,
      coastAge,
      invested,
      progress: Math.min((values.current / coastNumber) * 100, 100),
      labels,
      portfolioSeries,
      fireSeries,
      coastSeries
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
          <Field label="Expected Return" value={values.growth} onChange={(value) => update("growth", value)} suffix="%" step="0.1" />
          <Field label="SWR" value={values.swr} onChange={(value) => update("swr", value)} suffix="%" step="0.1" />
          <Field label="Current Portfolio" value={values.current} onChange={(value) => update("current", value)} prefix="Rs" />
          <Field label="Monthly SIP" value={values.monthly} onChange={(value) => update("monthly", value)} prefix="Rs" />
        </div>
        <ToggleBlock
          checked={values.stepUpEnabled}
          onChange={(checked) => update("stepUpEnabled", checked)}
          title="Step-up SIP"
          caption="Increase contributions every year until you hit Coast FIRE."
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
          Calculate Coast FIRE
        </button>
      </div>

      {unreachable ? (
        <div className="insight-card dark">
          <span className="section-label">Coast FIRE Not Reachable Yet</span>
          <h3>Your current plan misses the coast threshold.</h3>
          <p>
            Coast target: {formatCurrency(unreachable.coastNumber)}. Projected corpus by retirement:{" "}
            {formatCurrency(unreachable.finalCorpus)}.
          </p>
          <div className="metric-grid">
            <MetricCard label="Approx. Required SIP" value={formatCurrency(unreachable.requiredSip)} />
            <MetricCard label="Fallback Idea" value={`Extend by about ${unreachable.extraYears} yrs`} />
          </div>
          <PostResultPrompt
            currentSlug="coast-fire"
            message={`You are not at Coast FIRE yet. Try the FIRE Calculator to see the full retirement gap, or use the SIP Calculator to test whether a higher contribution or step-up gets you there sooner.`}
          />
        </div>
      ) : null}

      {result ? (
        <div className="results-stack">
          <div className="metric-grid">
            <MetricCard label="Coast FIRE Number" value={formatCurrency(result.coastNumber)} highlight />
            <MetricCard label="Full FIRE Target" value={formatCurrency(result.fireNumber)} />
            <MetricCard label="Current Progress" value={`${result.progress.toFixed(1)}%`} tone="green" />
            <MetricCard label="Years to Coast" value={`${result.coastAge - values.age} yrs`} />
          </div>

          <div className="progress-card">
            <div className="progress-row">
              <span>Progress to Coast FIRE</span>
              <strong>{result.progress.toFixed(1)}%</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill coast" style={{ width: `${result.progress}%` }} />
            </div>
          </div>

          <SimpleChart
            type="line"
            labels={result.labels}
            datasets={[
              { label: "Portfolio", data: result.portfolioSeries, color: "#c8962f" },
              { label: "FIRE Target", data: result.fireSeries, color: "#e05a1a", dashed: true },
              { label: "Coast Threshold", data: result.coastSeries, color: "#1a5c8a", dashed: true }
            ]}
          />

          <div className="helper-links-card">
            <span className="section-label">Plan The Next Step</span>
            <p className="helper-links-copy">
              Want to know how much SIP you should invest to achieve this target, or how much time
              you would need to invest to get there?
            </p>
            <div className="helper-links-row">
              <Link href="/tools/goal-sip" className="helper-link">
                Open Goal SIP Calculator
              </Link>
              <Link href="/tools/sip-duration" className="helper-link">
                Open SIP Duration Calculator
              </Link>
            </div>
          </div>

          <PostResultPrompt
            currentSlug="coast-fire"
            message={`Your Coast FIRE number is ${formatCurrency(result.coastNumber)} and you can likely coast by age ${result.coastAge}. Use the FIRE Calculator for the full retirement picture or the Goal SIP Calculator to reverse-engineer a faster path.`}
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
