"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

function fmt(n: number): string {
  return Math.round(n).toLocaleString("zh-TW");
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "number",
  step,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
  min?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-stone-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        min={min}
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
      />
    </div>
  );
}

function CalcButton({ onClick, label = "開始試算" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 w-full cursor-pointer rounded-lg bg-amber-800 px-4 py-2.5 font-semibold text-white transition hover:bg-amber-900 active:scale-[0.98]"
    >
      {label}
    </button>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-200 py-1.5 last:border-0">
      <span className="text-sm text-stone-600">{label}</span>
      <span className="font-semibold text-stone-800">{value}</span>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-800">
        <span className="text-xl">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  1. 購屋總費用試算                                                    */
/* ------------------------------------------------------------------ */

function HomePurchaseCostCalc() {
  const [houseValue, setHouseValue] = useState("");
  const [landValue, setLandValue] = useState("");
  const [firstTime, setFirstTime] = useState(false);
  const [result, setResult] = useState<{
    deedTax: number;
    stampTax: number;
    regFee: number;
    agentFee: number;
    total: number;
  } | null>(null);

  const calc = () => {
    const hv = Number(houseValue) || 0;
    const lv = Number(landValue) || 0;
    const deedTax = hv * 0.06;
    const stampTax = (hv + lv) * 0.001;
    const regFee = (hv + lv) * 0.001;
    const agentFee = 14000;
    const total = deedTax + stampTax + regFee + agentFee;
    setResult({ deedTax, stampTax, regFee, agentFee, total });
  };

  return (
    <Card title="購屋總費用試算" icon="🏠">
      <div className="flex flex-col gap-3">
        <InputField label="房屋評定現值（元）" value={houseValue} onChange={setHouseValue} placeholder="例：3,000,000" />
        <InputField label="土地公告現值（元）" value={landValue} onChange={setLandValue} placeholder="例：5,000,000" />
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={firstTime}
            onChange={(e) => setFirstTime(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-amber-800 accent-amber-800"
          />
          是否為首購族
        </label>
        <CalcButton onClick={calc} />
        {result && (
          <div className="mt-2 rounded-lg bg-stone-50 p-4">
            <ResultRow label="契稅（房屋現值 × 6%）" value={`${fmt(result.deedTax)} 元`} />
            <ResultRow label="印花稅（總現值 × 0.1%）" value={`${fmt(result.stampTax)} 元`} />
            <ResultRow label="登記規費（總現值 × 0.1%）" value={`${fmt(result.regFee)} 元`} />
            <ResultRow label="代書費估算" value={`${fmt(result.agentFee)} 元`} />
            <div className="mt-2 flex items-center justify-between border-t border-stone-300 pt-2">
              <span className="font-semibold text-stone-700">預估總費用</span>
              <span className="text-lg font-bold text-amber-800">{fmt(result.total)} 元</span>
            </div>
            {firstTime && (
              <p className="mt-2 text-xs text-stone-500">
                ＊首購族可能享有契稅或貸款利率優惠，實際依各主管機關規定。
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  2. 土地增值稅試算                                                    */
/* ------------------------------------------------------------------ */

function LandValueIncrementTaxCalc() {
  const [prevValue, setPrevValue] = useState("");
  const [currValue, setCurrValue] = useState("");
  const [yearsHeld, setYearsHeld] = useState("");
  const [result, setResult] = useState<{
    increment: number;
    taxBeforeDiscount: number;
    discount: number;
    tax: number;
  } | null>(null);

  const calc = () => {
    const pv = Number(prevValue) || 0;
    const cv = Number(currValue) || 0;
    const yh = Number(yearsHeld) || 0;
    const increment = cv - pv;

    if (increment <= 0) {
      setResult({ increment: 0, taxBeforeDiscount: 0, discount: 0, tax: 0 });
      return;
    }

    // Tiered tax calculation
    const tier1Limit = pv; // up to 100% of previous
    const tier2Limit = pv; // next 100% of previous (100%-200%)

    let tax = 0;
    let remaining = increment;

    // Tier 1: up to 100% of previous value -> 20%
    const tier1Amount = Math.min(remaining, tier1Limit);
    tax += tier1Amount * 0.2;
    remaining -= tier1Amount;

    // Tier 2: 100%-200% of previous value -> 30%
    if (remaining > 0) {
      const tier2Amount = Math.min(remaining, tier2Limit);
      tax += tier2Amount * 0.3;
      remaining -= tier2Amount;
    }

    // Tier 3: over 200% -> 40%
    if (remaining > 0) {
      tax += remaining * 0.4;
    }

    const taxBeforeDiscount = tax;

    // Long-term holding discount
    let discountRate = 0;
    if (yh > 40) discountRate = 0.4;
    else if (yh > 30) discountRate = 0.3;
    else if (yh > 20) discountRate = 0.2;

    const discount = tax * discountRate;
    tax = tax - discount;

    setResult({ increment, taxBeforeDiscount, discount, tax });
  };

  return (
    <Card title="土地增值稅試算" icon="📈">
      <div className="flex flex-col gap-3">
        <InputField label="前次移轉現值（元）" value={prevValue} onChange={setPrevValue} placeholder="例：2,000,000" />
        <InputField label="本次申報現值（元）" value={currValue} onChange={setCurrValue} placeholder="例：5,000,000" />
        <InputField label="持有年數" value={yearsHeld} onChange={setYearsHeld} placeholder="例：15" />
        <CalcButton onClick={calc} />
        {result && (
          <div className="mt-2 rounded-lg bg-stone-50 p-4">
            <ResultRow label="漲價總額" value={`${fmt(result.increment)} 元`} />
            <ResultRow label="稅額（折扣前）" value={`${fmt(result.taxBeforeDiscount)} 元`} />
            {result.discount > 0 && <ResultRow label="長期持有減徵" value={`-${fmt(result.discount)} 元`} />}
            <div className="mt-2 flex items-center justify-between border-t border-stone-300 pt-2">
              <span className="font-semibold text-stone-700">預估土地增值稅</span>
              <span className="text-lg font-bold text-amber-800">{fmt(result.tax)} 元</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  3. 房地合一稅試算                                                    */
/* ------------------------------------------------------------------ */

function CombinedIncomeTaxCalc() {
  const [sellingPrice, setSellingPrice] = useState("");
  const [cost, setCost] = useState("");
  const [expenses, setExpenses] = useState("");
  const [holdingPeriod, setHoldingPeriod] = useState("under2");
  const [result, setResult] = useState<{
    taxableIncome: number;
    rate: number;
    tax: number;
  } | null>(null);

  const rateMap: Record<string, number> = {
    under2: 0.45,
    "2to5": 0.35,
    "5to10": 0.2,
    over10: 0.15,
  };

  const periodLabels: Record<string, string> = {
    under2: "未滿 2 年（45%）",
    "2to5": "2～5 年（35%）",
    "5to10": "5～10 年（20%）",
    over10: "超過 10 年（15%）",
  };

  const calc = () => {
    const sp = Number(sellingPrice) || 0;
    const c = Number(cost) || 0;
    const e = Number(expenses) || 0;
    const taxableIncome = Math.max(sp - c - e, 0);
    const rate = rateMap[holdingPeriod];
    const tax = taxableIncome * rate;
    setResult({ taxableIncome, rate, tax });
  };

  return (
    <Card title="房地合一稅試算" icon="🏘️">
      <div className="flex flex-col gap-3">
        <InputField label="出售價格（元）" value={sellingPrice} onChange={setSellingPrice} placeholder="例：15,000,000" />
        <InputField label="取得成本（元）" value={cost} onChange={setCost} placeholder="例：10,000,000" />
        <InputField label="相關費用（元）" value={expenses} onChange={setExpenses} placeholder="例：500,000" />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700">持有期間</label>
          <select
            value={holdingPeriod}
            onChange={(e) => setHoldingPeriod(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
          >
            {Object.entries(periodLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <CalcButton onClick={calc} />
        {result && (
          <div className="mt-2 rounded-lg bg-stone-50 p-4">
            <ResultRow label="課稅所得" value={`${fmt(result.taxableIncome)} 元`} />
            <ResultRow label="適用稅率" value={`${(result.rate * 100).toFixed(0)}%`} />
            <div className="mt-2 flex items-center justify-between border-t border-stone-300 pt-2">
              <span className="font-semibold text-stone-700">預估房地合一稅</span>
              <span className="text-lg font-bold text-amber-800">{fmt(result.tax)} 元</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  4. 房貸試算表                                                       */
/* ------------------------------------------------------------------ */

function MortgageCalc() {
  const [loanAmount, setLoanAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("2.0");
  const [loanYears, setLoanYears] = useState("30");
  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
  } | null>(null);

  const calc = () => {
    const P = Number(loanAmount) || 0;
    const r = (Number(annualRate) || 0) / 100 / 12;
    const n = (Number(loanYears) || 0) * 12;

    if (P <= 0 || r <= 0 || n <= 0) return;

    const monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    setResult({ monthlyPayment, totalPayment, totalInterest });
  };

  return (
    <Card title="房貸試算表" icon="🏦">
      <div className="flex flex-col gap-3">
        <InputField label="貸款金額（元）" value={loanAmount} onChange={setLoanAmount} placeholder="例：8,000,000" />
        <InputField label="年利率（%）" value={annualRate} onChange={setAnnualRate} step="0.1" placeholder="例：2.0" />
        <InputField label="貸款年限（年）" value={loanYears} onChange={setLoanYears} placeholder="例：30" />
        <CalcButton onClick={calc} />
        {result && (
          <div className="mt-2 rounded-lg bg-stone-50 p-4">
            <ResultRow label="每月還款金額" value={`${fmt(result.monthlyPayment)} 元`} />
            <ResultRow label="還款總金額" value={`${fmt(result.totalPayment)} 元`} />
            <div className="mt-2 flex items-center justify-between border-t border-stone-300 pt-2">
              <span className="font-semibold text-stone-700">利息總額</span>
              <span className="text-lg font-bold text-amber-800">{fmt(result.totalInterest)} 元</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  5. 契稅試算                                                         */
/* ------------------------------------------------------------------ */

function DeedTaxCalc() {
  const [assessedValue, setAssessedValue] = useState("");
  const [txnType, setTxnType] = useState("buy");
  const [result, setResult] = useState<{ rate: number; tax: number } | null>(null);

  const txnTypes: Record<string, { label: string; rate: number }> = {
    buy: { label: "買賣（6%）", rate: 0.06 },
    gift: { label: "贈與（6%）", rate: 0.06 },
    dian: { label: "典權（4%）", rate: 0.04 },
    exchange: { label: "交換（2%）", rate: 0.02 },
    split: { label: "分割（2%）", rate: 0.02 },
    occupy: { label: "佔有（6%）", rate: 0.06 },
  };

  const calc = () => {
    const av = Number(assessedValue) || 0;
    const rate = txnTypes[txnType].rate;
    const tax = av * rate;
    setResult({ rate, tax });
  };

  return (
    <Card title="契稅試算" icon="📝">
      <div className="flex flex-col gap-3">
        <InputField
          label="房屋評定現值（元）"
          value={assessedValue}
          onChange={setAssessedValue}
          placeholder="例：3,000,000"
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-stone-700">交易類型</label>
          <select
            value={txnType}
            onChange={(e) => setTxnType(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
          >
            {Object.entries(txnTypes).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <CalcButton onClick={calc} />
        {result && (
          <div className="mt-2 rounded-lg bg-stone-50 p-4">
            <ResultRow label="適用稅率" value={`${(result.rate * 100).toFixed(0)}%`} />
            <div className="mt-2 flex items-center justify-between border-t border-stone-300 pt-2">
              <span className="font-semibold text-stone-700">應繳契稅</span>
              <span className="text-lg font-bold text-amber-800">{fmt(result.tax)} 元</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  6. 貸款負擔能力試算                                                  */
/* ------------------------------------------------------------------ */

function LoanAffordabilityCalc() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [affordableRatio, setAffordableRatio] = useState("30");
  const [annualRate, setAnnualRate] = useState("2.0");
  const [loanYears, setLoanYears] = useState("30");
  const [result, setResult] = useState<{
    maxMonthly: number;
    maxLoan: number;
    estimatedProperty: number;
  } | null>(null);

  const calc = () => {
    const income = Number(monthlyIncome) || 0;
    const ratio = (Number(affordableRatio) || 30) / 100;
    const r = (Number(annualRate) || 2) / 100 / 12;
    const n = (Number(loanYears) || 30) * 12;

    if (income <= 0 || r <= 0 || n <= 0) return;

    const maxMonthly = income * ratio;
    // Reverse mortgage formula: P = M * [(1+r)^n - 1] / [r * (1+r)^n]
    const maxLoan = (maxMonthly * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
    // Assuming 80% LTV
    const estimatedProperty = maxLoan / 0.8;

    setResult({ maxMonthly, maxLoan, estimatedProperty });
  };

  return (
    <Card title="貸款負擔能力試算" icon="💰">
      <div className="flex flex-col gap-3">
        <InputField label="月收入（元）" value={monthlyIncome} onChange={setMonthlyIncome} placeholder="例：60,000" />
        <InputField
          label="每月可負擔比例（%）"
          value={affordableRatio}
          onChange={setAffordableRatio}
          step="1"
          placeholder="預設 30%"
        />
        <InputField label="年利率（%）" value={annualRate} onChange={setAnnualRate} step="0.1" placeholder="預設 2.0%" />
        <InputField label="貸款年限（年）" value={loanYears} onChange={setLoanYears} placeholder="預設 30 年" />
        <CalcButton onClick={calc} />
        {result && (
          <div className="mt-2 rounded-lg bg-stone-50 p-4">
            <ResultRow label="每月可負擔還款" value={`${fmt(result.maxMonthly)} 元`} />
            <ResultRow label="最高可貸金額" value={`${fmt(result.maxLoan)} 元`} />
            <div className="mt-2 flex items-center justify-between border-t border-stone-300 pt-2">
              <span className="font-semibold text-stone-700">可負擔房價估算（8 成貸款）</span>
              <span className="text-lg font-bold text-amber-800">{fmt(result.estimatedProperty)} 元</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function ToolsClient() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50">
      {/* Header */}
      <div className="mx-auto max-w-5xl px-4 pt-16 pb-8 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">小工具</h1>
        <p className="mt-3 text-stone-600">
          實用不動產試算工具，快速估算各類稅費與貸款。
        </p>
      </div>

      {/* Calculator Grid */}
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <HomePurchaseCostCalc />
          <LandValueIncrementTaxCalc />
          <CombinedIncomeTaxCalc />
          <MortgageCalc />
          <DeedTaxCalc />
          <LoanAffordabilityCalc />
        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-center text-sm text-stone-500">
          以上試算結果僅供參考，實際稅費與貸款條件以各主管機關／金融機構核定為準。
        </p>
      </div>
    </section>
  );
}
