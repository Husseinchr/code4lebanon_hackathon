import type { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <DashboardNav />
      <main style={{ padding: "1rem", display: "grid", gap: "1rem" }}>{children}</main>
    </div>
  );
}
