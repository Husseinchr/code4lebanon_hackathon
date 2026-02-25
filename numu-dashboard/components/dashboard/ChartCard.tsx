import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <section className="card" style={{ padding: "1rem 1rem 0.85rem" }}>
      <h3 style={{ margin: 0, fontSize: "1.02rem", letterSpacing: "-0.01em" }}>{title}</h3>
      {subtitle ? <p style={{ margin: "0.35rem 0 0.8rem", color: "var(--muted)", fontSize: 13 }}>{subtitle}</p> : null}
      {children}
    </section>
  );
}
