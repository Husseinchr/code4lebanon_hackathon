import { NextResponse } from "next/server";
import { surveysFixture } from "@/data/fixtures/surveys";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      surveys: surveysFixture,
      pagination: {
        total: surveysFixture.length,
        page: 1,
        limit: 50,
        has_next_page: false,
      },
    },
    message: "Surveys fetched successfully",
    timestamp: new Date().toISOString(),
  });
}
