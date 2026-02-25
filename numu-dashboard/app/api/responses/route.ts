import { NextResponse } from "next/server";
import { responsesFixture } from "@/data/fixtures/responses";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const surveyId = url.searchParams.get("survey_id");

  const responses = surveyId
    ? responsesFixture.filter((item) => item.survey_id === surveyId)
    : responsesFixture;

  return NextResponse.json({
    success: true,
    data: {
      responses,
      pagination: {
        total: responses.length,
        page: 1,
        limit: 100,
        has_next_page: false,
      },
    },
    message: "Responses fetched successfully",
    timestamp: new Date().toISOString(),
  });
}
