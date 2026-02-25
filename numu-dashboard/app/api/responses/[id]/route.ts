import { NextResponse } from "next/server";
import { responsesFixture } from "@/data/fixtures/responses";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const response = responsesFixture.find((item) => item.id === id);

  if (!response) {
    return NextResponse.json(
      {
        success: false,
        data: {},
        message: "Response not found",
        timestamp: new Date().toISOString(),
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: { response },
    message: "Response fetched successfully",
    timestamp: new Date().toISOString(),
  });
}
