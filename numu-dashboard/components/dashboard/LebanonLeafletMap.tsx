"use client";

import dynamic from "next/dynamic";

type RegionSummary = {
  region: string;
  count: number;
  topChannel: string;
};

const LeafletInner = dynamic(
  () => import("./LebanonLeafletMapInner").then((module) => module.LebanonLeafletMapInner),
  { ssr: false, loading: () => <p style={{ color: "var(--muted)" }}>Loading map...</p> },
);

export function LebanonLeafletMap({ regions }: { regions: RegionSummary[] }) {
  return <LeafletInner regions={regions} />;
}

