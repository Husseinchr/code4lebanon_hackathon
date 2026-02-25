type KPIStatProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function KPIStat({ label, value, hint }: KPIStatProps) {
  return (
    <article
      className="card"
      style={{
        padding: "1.05rem",
        background:
          "linear-gradient(150deg, rgba(255,255,255,1) 0%, rgba(244,251,255,1) 56%, rgba(221,243,249,1) 100%)",
      }}
    >
      <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, fontWeight: 600 }}>{label}</p>
      <p style={{ margin: "0.35rem 0", fontSize: 33, fontWeight: 760, letterSpacing: "-0.02em" }}>{value}</p>
      {hint ? <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>{hint}</p> : null}
    </article>
  );
}
