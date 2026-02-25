import { NextResponse } from "next/server";
import { responsesFixture } from "@/data/fixtures/responses";

export async function GET() {
  const last = [...responsesFixture].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

  return NextResponse.json({
    success: true,
    data: { last_response_date: last?.created_at ?? null },
    message: "Last response date fetched successfully",
    timestamp: new Date().toISOString(),
  });
}
