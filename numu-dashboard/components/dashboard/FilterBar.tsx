"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SelectFilter = {
  key: string;
  label: string;
  options: { label: string; value: string }[];
};

type FilterBarProps = {
  selectFilters?: SelectFilter[];
  includeSearch?: boolean;
  includeDateRange?: boolean;
};

export function FilterBar({
  selectFilters = [],
  includeSearch = true,
  includeDateRange = true,
}: FilterBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <section
      style={{
        display: "grid",
        gap: 10,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "0.85rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <strong>Global Filters</strong>
        <button onClick={() => router.push(pathname)} style={buttonStyle}>
          Reset
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {includeSearch ? (
          <input
            placeholder="Search learners/entity"
            defaultValue={searchParams.get("q") ?? ""}
            onBlur={(event) => setParam("q", event.target.value.trim())}
            style={inputStyle}
          />
        ) : null}
        {includeDateRange ? (
          <>
            <input
              type="date"
              defaultValue={searchParams.get("from") ?? ""}
              onChange={(event) => setParam("from", event.target.value)}
              style={inputStyle}
            />
            <input
              type="date"
              defaultValue={searchParams.get("to") ?? ""}
              onChange={(event) => setParam("to", event.target.value)}
              style={inputStyle}
            />
          </>
        ) : null}
        {selectFilters.map((filter) => (
          <label key={filter.key} style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{filter.label}</span>
            <select
              defaultValue={searchParams.get(filter.key) ?? "all"}
              onChange={(event) => setParam(filter.key, event.target.value)}
              style={inputStyle}
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  minWidth: 150,
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "0.5rem 0.6rem",
  background: "#fff",
};

const buttonStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "#fff",
  borderRadius: 8,
  padding: "0.45rem 0.7rem",
  cursor: "pointer",
};
