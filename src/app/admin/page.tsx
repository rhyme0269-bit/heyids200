import type { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "後台管理",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
