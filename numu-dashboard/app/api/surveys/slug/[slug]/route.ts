import { NextResponse } from "next/server";
import { surveysFixture } from "@/data/fixtures/surveys";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const survey = surveysFixture.find((item) => item.slug === slug);

  if (!survey) {
    return NextResponse.json(
      {
        success: false,
        data: {},
        message: "Survey not found",
        timestamp: new Date().toISOString(),
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: { survey },
    message: "Survey fetched successfully",
    timestamp: new Date().toISOString(),
  });
}
