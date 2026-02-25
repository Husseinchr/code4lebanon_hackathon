"use client";

import dynamic from "next/dynamic";

type RegionSummary = {
  region: string;
  count: number;
  topChannel: string;
};

const LebanonRegionMapInner = dynamic(
  () => import("./LebanonRegionMapInner").then((module) => module.LebanonRegionMapInner),
  { ssr: false, loading: () => <p style={{ color: "var(--muted)" }}>Loading map...</p> },
);

export function LebanonRegionMap({ regions }: { regions: RegionSummary[] }) {
  return <LebanonRegionMapInner regions={regions} />;
}

