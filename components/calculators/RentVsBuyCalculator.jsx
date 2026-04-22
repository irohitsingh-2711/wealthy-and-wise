"use client";

import { useState } from "react";
import { PostResultPrompt } from "@/components/PostResultPrompt";
import { SimpleChart } from "@/components/charts/SimpleChart";
import { formatCurrency } from "@/lib/format";

export function RentVsBuyCalculator() {
  const [values, setValues] = useState({
    loan: 7500000,
    loanRate: 9,
    tenure: 20,
    sipRate: 12,
    propertyRate: 6,
    rent: 25000,
    rentHike: 5,
    downpayment: 2500000
  });
  const [result, setResult] = useState(null);

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function calculate() {
    const monthlyLoanRate = values.loanRate / 100 / 12;
    const months = values.tenure * 12;
    const monthlySipRate = values.sipRate / 100 / 12;
    const propertyGrowth = values.propertyRate / 100;
    const emi =
      (values.loan * monthlyLoanRate * Math.pow(1 + monthlyLoanRate, months)) /
      (Math.pow(1 + monthlyLoanRate, months) - 1);
    const totalLoanRepaid = emi * months;
    const totalInterest = totalLoanRepaid - values.loan;
    const finalPropertyValue =
      (values.loan + values.downpayment) * Math.pow(1 + propertyGrowth, values.tenure);
    const buyTotalSpent = totalLoanRepaid + values.downpayment;
    const buyNetWealth = finalPropertyValue - buyTotalSpent;

    let portfolio = values.downpayment;
    let totalRentPaid = 0;
    let currentRent = values.rent;
    const years = [];
    const buySeries = [];
    const rentSeries = [];

    for (let year = 0; year <= values.tenure; year += 1) {
      years.push(`Y${year}`);
      const yearlyPropertyValue =
        (values.loan + values.downpayment) * Math.pow(1 + propertyGrowth, year);
      const yearlyLoanSpent = emi * year * 12 + values.downpayment;
      buySeries.push(Math.round(yearlyPropertyValue - yearlyLoanSpent));
      rentSeries.push(Math.round(portfolio - totalRentPaid));

      if (year < values.tenure) {
        for (let month = 0; month < 12; month += 1) {
          const difference = Math.max(0, emi - currentRent);
          portfolio = (portfolio + difference) * (1 + monthlySipRate);
          totalRentPaid += currentRent;
        }
        currentRent *= 1 + values.rentHike / 100;
      }
    }

    const rentNetWealth = portfolio - totalRentPaid;
    const diff = Math.abs(buyNetWealth - rentNetWealth);
    const buyWins = buyNetWealth > rentNetWealth;

    setResult({
      emi,
      totalInterest,
      totalLoanRepaid,
      finalPropertyValue,
      buyTotalSpent,
      buyNetWealth,
      portfolio,
      totalRentPaid,
      rentNetWealth,
      diff,
      buyWins,
      years,
      buySeries,
      rentSeries
    });
  }

  return (
    <div className="calculator-panel">
      <div className="form-card">
        <div className="field-grid three">
          <Field label="Loan Amount" value={values.loan} onChange={(value) => update("loan", value)} prefix="Rs" />
          <Field label="Interest Rate" value={values.loanRate} onChange={(value) => update("loanRate", value)} suffix="%" step="0.1" />
          <Field label="Tenure" value={values.tenure} onChange={(value) => update("tenure", value)} suffix="yrs" />
          <Field label="SIP Return" value={values.sipRate} onChange={(value) => update("sipRate", value)} suffix="%" step="0.1" />
          <Field label="Real Estate Growth" value={values.propertyRate} onChange={(value) => update("propertyRate", value)} suffix="%" step="0.1" />
          <Field label="Current Rent" value={values.rent} onChange={(value) => update("rent", value)} prefix="Rs" />
          <Field label="Rent Hike" value={values.rentHike} onChange={(value) => update("rentHike", value)} suffix="%" step="0.1" />
          <Field label="Down Payment" value={values.downpayment} onChange={(value) => update("downpayment", value)} prefix="Rs" />
        </div>
        <button className="cta-btn" onClick={calculate}>
          Analyze My Wealth
        </button>
      </div>

      {result ? (
        <div className="results-stack">
          <div className={`insight-card ${result.buyWins ? "buy" : "rent"}`}>
            <span className="section-label">After {values.tenure} Years</span>
            <h3>
              {result.buyWins ? "Buying wins" : "Renting wins"} by {formatCurrency(result.diff)}
            </h3>
            <p>
              {result.buyWins
                ? "Property growth outpaced the investing path even after interest costs."
                : "Investing the spread between EMI and rent leaves you with more net wealth."}
            </p>
          </div>

          <div className="metric-grid">
            <MetricCard label="Monthly EMI" value={formatCurrency(result.emi)} />
            <MetricCard label="Total Interest Paid" value={formatCurrency(result.totalInterest)} />
            <MetricCard label="Total Loan Cost" value={formatCurrency(result.totalLoanRepaid)} highlight />
          </div>

          <div className="compare-grid">
            <article className="compare-card">
              <span>Ownership Outcome</span>
              <strong>{formatCurrency(result.buyNetWealth)}</strong>
              <p>Final property value: {formatCurrency(result.finalPropertyValue)}</p>
              <p>Total spent: {formatCurrency(result.buyTotalSpent)}</p>
            </article>
            <article className="compare-card">
              <span>Rent + Invest Outcome</span>
              <strong>{formatCurrency(result.rentNetWealth)}</strong>
              <p>Portfolio value: {formatCurrency(result.portfolio)}</p>
              <p>Total rent paid: {formatCurrency(result.totalRentPaid)}</p>
            </article>
          </div>

          <SimpleChart
            type="line"
            labels={result.years}
            datasets={[
              { label: "Buy Wealth", data: result.buySeries, color: "#c84b2f" },
              { label: "Rent Wealth", data: result.rentSeries, color: "#2f6fc8" }
            ]}
          />

          <PostResultPrompt
            currentSlug="rent-vs-buy"
            message={`This comparison shows a ${result.buyWins ? "buying" : "renting"} advantage of ${formatCurrency(result.diff)}. Next, try the SIP Calculator to model the invest-the-difference plan in more detail, or use Goal SIP to estimate the monthly amount needed for a down-payment or alternative corpus target.`}
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

function MetricCard({ label, value, highlight }) {
  return (
    <article className={`metric-card ${highlight ? "metric-card-highlight" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
