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
      className="card"
      style={{
        display: "grid",
        gap: 10,
        padding: "0.9rem",
        background:
          "linear-gradient(130deg, rgba(255,255,255,1) 0%, rgba(241,249,255,1) 64%, rgba(222,242,248,1) 100%)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <strong style={{ fontSize: 14 }}>Global Filters</strong>
        <button onClick={() => router.push(pathname)} style={buttonStyle}>
          Reset
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {includeSearch ? (
          <input
            placeholder="Search learners, city, entity"
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
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{filter.label}</span>
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
  minWidth: 170,
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "0.52rem 0.62rem",
  background: "#fff",
  fontSize: 13,
};

const buttonStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "#fff",
  borderRadius: 10,
  padding: "0.45rem 0.75rem",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};
