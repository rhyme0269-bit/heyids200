export interface CalcInput {
  id: string;
  label: string;
  type: "number" | "select" | "checkbox";
  placeholder?: string;
  defaultValue?: string;
  step?: string;
  min?: string;
  options?: Array<{ value: string; label: string }>;
  showIf?: Expr;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExprArray extends Array<Expr> {}

export type Expr =
  | number
  | string
  | null
  | ExprArray;

export interface CalcFormula {
  id: string;
  expr: Expr;
}

export interface CalcResult {
  id: string;
  label: string;
  suffix?: string;
  prefix?: string;
  showIf?: Expr;
}

export interface CalcTotal {
  id: string;
  label: string;
  suffix?: string;
}

export interface CalcNote {
  condition: Expr;
  text: string;
}

export interface CalcLink {
  label: string;
  url: string;
}

export interface CalcDefinition {
  inputs: CalcInput[];
  formulas: CalcFormula[];
  results: CalcResult[];
  total: CalcTotal;
  notes?: CalcNote[];
  links?: CalcLink[];
}

export interface Calculator {
  id: string;
  slug: string;
  title: string;
  icon: string;
  description: string;
  sortOrder: number;
  isSystem: boolean;
  isVisible: boolean;
  definition: CalcDefinition;
  createdAt: string;
  updatedAt: string;
}
