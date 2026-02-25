"use client";

import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";

type RegionSummary = {
  region: string;
  count: number;
  topChannel: string;
};

type RegionCoord = {
  lat: number;
  lng: number;
};

const LEBANON_BOUNDS: [[number, number], [number, number]] = [
  [33.05, 35.05],
  [34.7, 36.65],
];

const REGION_COORDS: Record<string, RegionCoord> = {
  Beirut: { lat: 33.8938, lng: 35.5018 },
  "Mount Lebanon": { lat: 33.86, lng: 35.62 },
  North: { lat: 34.4367, lng: 35.8497 },
  Bekaa: { lat: 33.8469, lng: 35.902 },
  South: { lat: 33.5631, lng: 35.3689 },
};

function radiusFromCount(count: number) {
  if (count <= 1) return 7;
  if (count <= 3) return 10;
  return 13;
}

export function LebanonRegionMapInner({ regions }: { regions: RegionSummary[] }) {
  return (
    <div
      style={{
        height: 390,
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        bounds={LEBANON_BOUNDS}
        boundsOptions={{ padding: [10, 10] }}
        maxBounds={LEBANON_BOUNDS}
        maxBoundsViscosity={1}
        minZoom={8}
        maxZoom={16}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
          noWrap
        />

        {regions.map((item) => {
          const coord = REGION_COORDS[item.region];
          if (!coord) return null;
          return (
            <CircleMarker
              key={item.region}
              center={[coord.lat, coord.lng]}
              radius={radiusFromCount(item.count)}
              pathOptions={{
                color: "#0e7490",
                fillColor: "#0891b2",
                fillOpacity: 0.75,
                weight: 2,
              }}
            >
              <Tooltip sticky>
                <div>
                  <strong>{item.region}</strong>
                  <br />
                  Registrations: {item.count}
                  <br />
                  Top channel: {item.topChannel}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

