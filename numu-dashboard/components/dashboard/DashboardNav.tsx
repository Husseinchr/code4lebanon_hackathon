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
        background: "linear-gradient(180deg, #0b7285 0%, #094f64 100%)",
        padding: "1.1rem 0.95rem",
        color: "#eaf8fc",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: "1rem",
      }}
    >
      <div style={{ padding: "0.3rem 0.35rem" }}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.12em", opacity: 0.8 }}>NUMU</p>
        <h1 style={{ margin: "0.18rem 0 0", fontSize: "1.28rem", letterSpacing: "-0.02em" }}>Analytics Hub</h1>
      </div>

      <nav style={{ display: "grid", alignContent: "start", gap: "0.45rem" }}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "0.72rem 0.85rem",
                borderRadius: 11,
                fontWeight: 650,
                fontSize: "0.94rem",
                color: active ? "#07303e" : "#eaf8fc",
                background: active ? "#f0fbff" : "rgba(255,255,255,0.08)",
                border: active ? "1px solid rgba(255,255,255,0.7)" : "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.24)", paddingTop: 10, fontSize: 12, opacity: 0.82 }}>
        Mock-first analytics environment
      </div>
    </aside>
  );
}
