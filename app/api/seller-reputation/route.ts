import { NextRequest, NextResponse } from "next/server";
import { searchSellerReputation } from "@/lib/investigation/sellerReputation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sellerHandle } = body;

    if (!sellerHandle || typeof sellerHandle !== "string") {
      return NextResponse.json(
        {
          status: "failed",
          data: null,
          message: "Please provide a valid seller handle to search reputation records.",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const result = await searchSellerReputation(sellerHandle);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json(
      {
        status: "failed",
        data: null,
        message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
