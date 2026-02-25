"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard/channel", label: "Channel" },
  { href: "/dashboard/challenges", label: "Challenges" },
  { href: "/dashboard/geo", label: "Geo" },
  { href: "/dashboard/learner", label: "Learner" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "1.25rem 1rem",
      }}
    >
      <div style={{ marginBottom: "1.25rem" }}>
        <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", letterSpacing: "0.08em" }}>NUMU</p>
        <h1 style={{ margin: "0.2rem 0 0", fontSize: "1.2rem" }}>Analytics</h1>
      </div>
      <nav style={{ display: "grid", gap: "0.4rem" }}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "0.65rem 0.8rem",
                borderRadius: 10,
                fontWeight: 600,
                color: active ? "var(--brand)" : "var(--ink)",
                background: active ? "var(--brand-soft)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
