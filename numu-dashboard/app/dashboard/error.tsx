"use client";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section style={{ display: "grid", gap: 10 }}>
      <p style={{ color: "var(--danger)", margin: 0 }}>Something failed while loading this section.</p>
      <button
        onClick={reset}
        style={{ width: 120, border: "1px solid var(--border)", padding: "0.5rem", borderRadius: 8 }}
      >
        Try again
      </button>
    </section>
  );
}
