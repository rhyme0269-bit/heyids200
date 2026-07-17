import type { Metadata } from "next";
import ToolsClient from "./ToolsClient";

export const metadata: Metadata = {
  title: "小工具",
  description:
    "不動產實用試算工具：購屋費用試算、土地增值稅試算、房地合一稅試算、房貸試算、契稅試算、貸款負擔能力試算。",
};

export default function ToolsPage() {
  return <ToolsClient />;
}
