import type { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <DashboardNav />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
