export function EmptyState({ label }: { label: string }) {
  return (
    <section
      style={{
        border: "1px dashed var(--border)",
        borderRadius: 12,
        padding: "1rem",
        textAlign: "center",
        color: "var(--muted)",
        background: "var(--surface)",
      }}
    >
      {label}
    </section>
  );
}
