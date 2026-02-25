type KPIStatProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function KPIStat({ label, value, hint }: KPIStatProps) {
  return (
    <article
      style={{
        border: "1px solid var(--border)",
        borderRadius: 14,
        background: "var(--surface)",
        padding: "1rem",
      }}
    >
      <p style={{ margin: 0, color: "var(--muted)", fontSize: 12 }}>{label}</p>
      <p style={{ margin: "0.25rem 0", fontSize: 30, fontWeight: 700 }}>{value}</p>
      {hint ? <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>{hint}</p> : null}
    </article>
  );
}
