import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <section
      style={{
        border: "1px solid var(--border)",
        borderRadius: 14,
        background: "var(--surface)",
        padding: "1rem",
      }}
    >
      <h3 style={{ margin: 0, fontSize: "1rem" }}>{title}</h3>
      {subtitle ? <p style={{ margin: "0.35rem 0 0.8rem", color: "var(--muted)", fontSize: 13 }}>{subtitle}</p> : null}
      {children}
    </section>
  );
}
