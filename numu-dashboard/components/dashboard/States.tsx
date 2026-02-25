export function EmptyState({ label }: { label: string }) {
  return (
    <section
      className="card"
      style={{
        borderStyle: "dashed",
        padding: "1rem",
        textAlign: "center",
        color: "var(--muted)",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fcff 100%)",
      }}
    >
      {label}
    </section>
  );
}
