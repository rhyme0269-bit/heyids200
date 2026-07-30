import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import PageHero from "@/components/common/PageHero";
import ToolsClient from "./ToolsClient";
import { listCalculators } from "@/lib/calc-db";

export const metadata: Metadata = {
  title: "小工具",
  description:
    "不動產實用試算工具：購屋費用試算、土地增值稅試算、房地合一稅試算、房貸試算、契稅試算、貸款負擔能力試算。",
};

export const dynamic = "force-dynamic";

export default function ToolsPage() {
  noStore();
  const calculators = listCalculators(true);
  return (
    <>
      <PageHero
        title="小工具"
        subtitle="實用不動產試算工具，快速估算各類稅費與貸款。"
        imageKey="tools_bg"
      />
      <ToolsClient calculators={calculators} />
    </>
  );
}
