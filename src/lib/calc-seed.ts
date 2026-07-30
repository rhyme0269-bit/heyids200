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
        { id: "first_time", label: "是否為首購族", type: "checkbox" },
      ],
      formulas: [
        { id: "deed_tax", expr: ["*", "$house_value", 0.06] },
        { id: "stamp_tax", expr: ["*", ["+", "$house_value", "$land_value"], 0.001] },
        { id: "reg_fee", expr: ["*", ["+", "$house_value", "$land_value"], 0.001] },
        { id: "agent_fee", expr: 14000 },
        { id: "total", expr: ["+", "$deed_tax", "$stamp_tax", "$reg_fee", "$agent_fee"] },
      ],
      results: [
        { id: "deed_tax", label: "契稅（房屋現值 × 6%）", suffix: "元" },
        { id: "stamp_tax", label: "印花稅（總現值 × 0.1%）", suffix: "元" },
        { id: "reg_fee", label: "登記規費（總現值 × 0.1%）", suffix: "元" },
        { id: "agent_fee", label: "代書費估算", suffix: "元" },
      ],
      total: { id: "total", label: "預估總費用", suffix: "元" },
      notes: [
        { condition: "$first_time", text: "＊首購族可能享有契稅或貸款利率優惠，實際依各主管機關規定。" },
      ],
    },
  },
  {
    slug: "land_value_increment",
    title: "土地增值稅試算",
    icon: "📈",
    description: "依漲價總額與持有年數試算土地增值稅",
    definition: {
      inputs: [
        { id: "prev_value", label: "前次移轉現值（元）", type: "number", placeholder: "例：2,000,000" },
        { id: "curr_value", label: "本次申報現值（元）", type: "number", placeholder: "例：5,000,000" },
        { id: "years_held", label: "持有年數", type: "number", placeholder: "例：15" },
      ],
      formulas: [
        { id: "increment", expr: ["max", ["-", "$curr_value", "$prev_value"], 0] },
        { id: "tax_before_discount", expr: ["tiered", "$prev_value", "$increment", [[1.0, 0.20], [1.0, 0.30], [null, 0.40]]] },
        { id: "discount_rate", expr: ["if", [">", "$years_held", 40], 0.4, ["if", [">", "$years_held", 30], 0.3, ["if", [">", "$years_held", 20], 0.2, 0]]] },
        { id: "discount", expr: ["*", "$tax_before_discount", "$discount_rate"] },
        { id: "tax", expr: ["-", "$tax_before_discount", "$discount"] },
      ],
      results: [
        { id: "increment", label: "漲價總額", suffix: "元" },
        { id: "tax_before_discount", label: "稅額（折扣前）", suffix: "元" },
        { id: "discount", label: "長期持有減徵", suffix: "元", prefix: "-", showIf: [">", "$discount", 0] },
      ],
      total: { id: "tax", label: "預估土地增值稅", suffix: "元" },
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
        { id: "expenses", label: "相關費用（元）", type: "number", placeholder: "例：500,000" },
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
        { id: "taxable_income", expr: ["max", ["-", "$selling_price", "$cost", "$expenses"], 0] },
        { id: "rate", expr: "$holding_period" },
        { id: "tax", expr: ["*", "$taxable_income", "$rate"] },
      ],
      results: [
        { id: "taxable_income", label: "課稅所得", suffix: "元" },
        { id: "rate_display", label: "適用稅率", suffix: "%" },
      ],
      total: { id: "tax", label: "預估房地合一稅", suffix: "元" },
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
        { id: "r", expr: ["/", ["/", "$annual_rate", 100], 12] },
        { id: "n", expr: ["*", "$loan_years", 12] },
        { id: "monthly_payment", expr: ["/", ["*", "$loan_amount", ["*", "$r", ["pow", ["+", 1, "$r"], "$n"]]], ["-", ["pow", ["+", 1, "$r"], "$n"], 1]] },
        { id: "total_payment", expr: ["*", "$monthly_payment", "$n"] },
        { id: "total_interest", expr: ["-", "$total_payment", "$loan_amount"] },
      ],
      results: [
        { id: "monthly_payment", label: "每月還款金額", suffix: "元" },
        { id: "total_payment", label: "還款總金額", suffix: "元" },
      ],
      total: { id: "total_interest", label: "利息總額", suffix: "元" },
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
        { id: "tax", expr: ["*", "$assessed_value", "$rate"] },
      ],
      results: [
        { id: "rate_display", label: "適用稅率", suffix: "%" },
      ],
      total: { id: "tax", label: "應繳契稅", suffix: "元" },
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
        { id: "max_monthly", expr: ["*", "$monthly_income", ["/", "$affordable_ratio", 100]] },
        { id: "r", expr: ["/", ["/", "$annual_rate", 100], 12] },
        { id: "n", expr: ["*", "$loan_years", 12] },
        { id: "max_loan", expr: ["/", ["*", "$max_monthly", ["-", ["pow", ["+", 1, "$r"], "$n"], 1]], ["*", "$r", ["pow", ["+", 1, "$r"], "$n"]]] },
        { id: "estimated_property", expr: ["/", "$max_loan", 0.8] },
      ],
      results: [
        { id: "max_monthly", label: "每月可負擔還款", suffix: "元" },
        { id: "max_loan", label: "最高可貸金額", suffix: "元" },
      ],
      total: { id: "estimated_property", label: "可負擔房價估算（8 成貸款）", suffix: "元" },
    },
  },
];
