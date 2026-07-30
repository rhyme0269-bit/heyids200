import type { Expr } from "./calc-types";

export function evaluate(
  expr: Expr,
  vars: Record<string, number>
): number {
  if (typeof expr === "number") return expr;

  if (typeof expr === "string") {
    if (expr.startsWith("$")) {
      return vars[expr.slice(1)] ?? 0;
    }
    return parseFloat(expr) || 0;
  }

  if (!Array.isArray(expr) || expr.length === 0) return 0;

  const [op, ...args] = expr;

  switch (op) {
    case "+": {
      let sum = 0;
      for (const a of args) sum += evaluate(a, vars);
      return sum;
    }
    case "-": {
      if (args.length === 1) return -evaluate(args[0], vars);
      let result = evaluate(args[0], vars);
      for (let i = 1; i < args.length; i++) result -= evaluate(args[i], vars);
      return result;
    }
    case "*": {
      let product = 1;
      for (const a of args) product *= evaluate(a, vars);
      return product;
    }
    case "/": {
      const numerator = evaluate(args[0], vars);
      const denominator = evaluate(args[1], vars);
      return denominator === 0 ? 0 : numerator / denominator;
    }
    case "max": {
      const values = args.map((a) => evaluate(a, vars));
      return Math.max(...values);
    }
    case "min": {
      const values = args.map((a) => evaluate(a, vars));
      return Math.min(...values);
    }
    case "pow": {
      return Math.pow(evaluate(args[0], vars), evaluate(args[1], vars));
    }
    case "round": {
      return Math.round(evaluate(args[0], vars));
    }
    case "abs": {
      return Math.abs(evaluate(args[0], vars));
    }
    case "if": {
      const cond = evaluate(args[0], vars);
      return cond ? evaluate(args[1], vars) : evaluate(args[2] ?? 0, vars);
    }
    case ">":
      return evaluate(args[0], vars) > evaluate(args[1], vars) ? 1 : 0;
    case "<":
      return evaluate(args[0], vars) < evaluate(args[1], vars) ? 1 : 0;
    case ">=":
      return evaluate(args[0], vars) >= evaluate(args[1], vars) ? 1 : 0;
    case "<=":
      return evaluate(args[0], vars) <= evaluate(args[1], vars) ? 1 : 0;
    case "==":
      return evaluate(args[0], vars) === evaluate(args[1], vars) ? 1 : 0;
    case "!=":
      return evaluate(args[0], vars) !== evaluate(args[1], vars) ? 1 : 0;
    case "and": {
      for (const a of args) if (!evaluate(a, vars)) return 0;
      return 1;
    }
    case "or": {
      for (const a of args) if (evaluate(a, vars)) return 1;
      return 0;
    }
    case "not":
      return evaluate(args[0], vars) ? 0 : 1;

    case "tiered": {
      // ["tiered", base, increment, [[multiplier, rate], ...]]
      // Each tier: up to (multiplier * base) amount at rate.
      // multiplier=null means unlimited remainder.
      const base = evaluate(args[0], vars);
      let remaining = evaluate(args[1], vars);
      if (remaining <= 0) return 0;
      const tiers = args[2] as unknown as Array<[number | null, number]>;
      let tax = 0;
      for (const [mult, rate] of tiers) {
        if (remaining <= 0) break;
        if (mult === null) {
          tax += remaining * rate;
          remaining = 0;
        } else {
          const tierLimit = base * mult;
          const amount = Math.min(remaining, tierLimit);
          tax += amount * rate;
          remaining -= amount;
        }
      }
      return tax;
    }

    default:
      return 0;
  }
}

export function evaluateAll(
  formulas: Array<{ id: string; expr: Expr }>,
  inputValues: Record<string, number>
): Record<string, number> {
  const vars = { ...inputValues };
  for (const f of formulas) {
    vars[f.id] = evaluate(f.expr, vars);
  }
  return vars;
}
