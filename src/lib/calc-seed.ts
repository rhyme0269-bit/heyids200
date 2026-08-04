import type { CalcDefinition } from "./calc-types";

interface CalcSeed {
  slug: string;
  title: string;
  icon: string;
  description: string;
  definition: CalcDefinition;
}

export const defaultCalculators: CalcSeed[] = [
  {
    slug: "home_purchase",
    title: "購屋總費用試算",
    icon: "🏠",
    description: "試算購屋所需的契稅、印花稅、登記規費及代書費",
    definition: {
      inputs: [
        { id: "house_value", label: "房屋評定現值（元）", type: "number", placeholder: "例：3,000,000" },
        { id: "land_value", label: "土地公告現值（元）", type: "number", placeholder: "例：5,000,000" },
        { id: "need_loan", label: "是否需要貸款", type: "checkbox" },
        { id: "loan_amount", label: "貸款金額（元）", type: "number", placeholder: "例：8,000,000", showIf: "$need_loan" },
      ],
      formulas: [
        { id: "deed_tax", label: "契稅", expr: ["*", "$house_value", 0.06] },
        { id: "stamp_tax", label: "印花稅", expr: ["*", ["+", "$house_value", "$land_value"], 0.001] },
        { id: "reg_fee", label: "登記規費", expr: ["*", ["+", "$house_value", "$land_value"], 0.001] },
        { id: "agent_fee", label: "代書費", expr: 14000 },
        { id: "loan_setup_fee", label: "貸款設定費", expr: ["if", "$need_loan", 5000, 0] },
        { id: "loan_reg_fee", label: "設定規費", expr: ["if", "$need_loan", ["*", "$loan_amount", 0.0012], 0] },
        { id: "total", label: "總計", expr: ["+", "$deed_tax", "$stamp_tax", "$reg_fee", "$agent_fee", "$loan_setup_fee", "$loan_reg_fee"] },
      ],
      results: [
        { id: "deed_tax", label: "契稅（房屋現值 × 6%）", suffix: "元" },
        { id: "stamp_tax", label: "印花稅（總現值 × 0.1%）", suffix: "元" },
        { id: "reg_fee", label: "登記規費（總現值 × 0.1%）", suffix: "元" },
        { id: "agent_fee", label: "代書費估算", suffix: "元" },
        { id: "loan_setup_fee", label: "貸款設定費", suffix: "元", showIf: "$need_loan" },
        { id: "loan_reg_fee", label: "設定規費（貸款金額 × 1.2‰）", suffix: "元", showIf: "$need_loan" },
      ],
      total: { id: "total", label: "預估總費用", suffix: "元" },
      notes: [
        { condition: 1, text: "※ 費用僅供參考，實際金額可能因筆棟數、案件繁複度及主管機關規定而有所不同。" },
        { condition: 1, text: "※ 貸款另有貸款手續費及火險地震險等，依各家銀行收費為準。" },
      ],
    },
  },
  {
    slug: "deed_tax",
    title: "契稅試算",
    icon: "📝",
    description: "依房屋評定現值和交易類型試算契稅",
    definition: {
      inputs: [
        { id: "assessed_value", label: "房屋評定現值（元）", type: "number", placeholder: "例：3,000,000" },
        {
          id: "rate", label: "交易類型", type: "select",
          defaultValue: "0.06",
          options: [
            { value: "0.06", label: "買賣（6%）" },
            { value: "0.06_gift", label: "贈與（6%）" },
            { value: "0.04", label: "典權（4%）" },
            { value: "0.02", label: "交換（2%）" },
            { value: "0.02_split", label: "分割（2%）" },
            { value: "0.06_occupy", label: "佔有（6%）" },
          ],
        },
      ],
      formulas: [
        { id: "tax", label: "契稅", expr: ["*", "$assessed_value", "$rate"] },
        { id: "rate_display", label: "稅率百分比", expr: ["*", "$rate", 100] },
      ],
      results: [
        { id: "rate_display", label: "適用稅率", suffix: "%" },
      ],
      total: { id: "tax", label: "應繳契稅", suffix: "元" },
    },
  },
  {
    slug: "mortgage",
    title: "房貸試算表",
    icon: "🏦",
    description: "輸入貸款金額、利率和年限，試算每月還款金額",
    definition: {
      inputs: [
        { id: "loan_amount", label: "貸款金額（元）", type: "number", placeholder: "例：8,000,000" },
        { id: "annual_rate", label: "年利率（%）", type: "number", defaultValue: "2.0", step: "0.1", placeholder: "例：2.0" },
        { id: "loan_years", label: "貸款年限（年）", type: "number", defaultValue: "30", placeholder: "例：30" },
      ],
      formulas: [
        { id: "r", label: "月利率", expr: ["/", ["/", "$annual_rate", 100], 12] },
        { id: "n", label: "還款期數", expr: ["*", "$loan_years", 12] },
        { id: "monthly_payment", label: "每月還款", expr: ["/", ["*", "$loan_amount", ["*", "$r", ["pow", ["+", 1, "$r"], "$n"]]], ["-", ["pow", ["+", 1, "$r"], "$n"], 1]] },
        { id: "total_payment", label: "還款總額", expr: ["*", "$monthly_payment", "$n"] },
        { id: "total_interest", label: "利息總額", expr: ["-", "$total_payment", "$loan_amount"] },
      ],
      results: [
        { id: "monthly_payment", label: "每月還款金額", suffix: "元" },
        { id: "total_payment", label: "還款總金額", suffix: "元" },
      ],
      total: { id: "total_interest", label: "利息總額", suffix: "元" },
    },
  },
  {
    slug: "loan_affordability",
    title: "貸款負擔能力試算",
    icon: "💰",
    description: "依月收入和可負擔比例試算最高貸款金額",
    definition: {
      inputs: [
        { id: "monthly_income", label: "月收入（元）", type: "number", placeholder: "例：60,000" },
        { id: "affordable_ratio", label: "每月可負擔比例（%）", type: "number", defaultValue: "30", step: "1", placeholder: "預設 30%" },
        { id: "annual_rate", label: "年利率（%）", type: "number", defaultValue: "2.0", step: "0.1", placeholder: "預設 2.0%" },
        { id: "loan_years", label: "貸款年限（年）", type: "number", defaultValue: "30", placeholder: "預設 30 年" },
      ],
      formulas: [
        { id: "max_monthly", label: "每月可負擔還款", expr: ["*", "$monthly_income", ["/", "$affordable_ratio", 100]] },
        { id: "r", label: "月利率", expr: ["/", ["/", "$annual_rate", 100], 12] },
        { id: "n", label: "還款期數", expr: ["*", "$loan_years", 12] },
        { id: "max_loan", label: "最高可貸金額", expr: ["/", ["*", "$max_monthly", ["-", ["pow", ["+", 1, "$r"], "$n"], 1]], ["*", "$r", ["pow", ["+", 1, "$r"], "$n"]]] },
        { id: "estimated_property", label: "可負擔房價", expr: ["/", "$max_loan", 0.8] },
      ],
      results: [
        { id: "max_monthly", label: "每月可負擔還款", suffix: "元" },
        { id: "max_loan", label: "最高可貸金額", suffix: "元" },
      ],
      total: { id: "estimated_property", label: "可負擔房價估算（8 成貸款）", suffix: "元" },
    },
  },
  {
    slug: "combined_income_tax",
    title: "房地合一稅試算",
    icon: "🏘️",
    description: "依出售價格、成本及持有期間試算房地合一稅",
    definition: {
      inputs: [
        { id: "selling_price", label: "出售價格（元）", type: "number", placeholder: "例：15,000,000" },
        { id: "cost", label: "取得成本（元）", type: "number", placeholder: "例：10,000,000" },
        {
          id: "holding_period", label: "持有期間", type: "select",
          defaultValue: "0.45",
          options: [
            { value: "0.45", label: "未滿 2 年（45%）" },
            { value: "0.35", label: "2～5 年（35%）" },
            { value: "0.20", label: "5～10 年（20%）" },
            { value: "0.15", label: "超過 10 年（15%）" },
          ],
        },
      ],
      formulas: [
        { id: "expenses", label: "推計費用", expr: ["min", ["*", "$selling_price", 0.03], 300000] },
        { id: "taxable_income", label: "課稅所得", expr: ["max", ["-", "$selling_price", "$cost", "$expenses"], 0] },
        { id: "rate", label: "適用稅率", expr: "$holding_period" },
        { id: "rate_display", label: "稅率百分比", expr: ["*", "$rate", 100] },
        { id: "tax", label: "房地合一稅", expr: ["*", "$taxable_income", "$rate"] },
      ],
      results: [
        { id: "expenses", label: "推計費用（售價 × 3%，上限 30 萬）", suffix: "元" },
        { id: "taxable_income", label: "課稅所得", suffix: "元" },
        { id: "rate_display", label: "適用稅率", suffix: "%" },
      ],
      total: { id: "tax", label: "預估房地合一稅", suffix: "元" },
      notes: [
        { condition: 1, text: "※ 欲精準計算可至財政部稅額試算：https://www.etax.nat.gov.tw/etwmain/online-service/tax-pre-calculation/house-land-transfer-tax" },
        { condition: 1, text: "※ 或洽詢地政士協助計算。" },
      ],
    },
  },
  {
    slug: "land_value_increment",
    title: "土地增值稅試算",
    icon: "📈",
    description: "提供政府官方土地增值稅試算連結",
    definition: {
      inputs: [],
      formulas: [],
      results: [],
      total: { id: "", label: "", suffix: "" },
      links: [
        { label: "全台 — 財政部稅額試算", url: "https://www.etax.nat.gov.tw/etwmain/etw158w/51" },
        { label: "新北市 — 地政局試算", url: "https://i.land.ntpc.gov.tw/iland/index.php/land-value/vatcal" },
        { label: "台北市 — 地政雲試算", url: "https://cloud.land.gov.taipei/cloud/map/index.html?fun=g21" },
      ],
    },
  },
];
