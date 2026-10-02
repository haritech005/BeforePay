import { NextRequest, NextResponse } from "next/server";
import { fetchSellerProfile } from "@/lib/investigation/sellerProfile";

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
          message: "Please provide a valid Instagram handle or URL.",
        },
        { status: 400 }
      );
    }

    const result = await fetchSellerProfile(sellerHandle);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json(
      {
        status: "failed",
        data: null,
        message,
      },
      { status: 500 }
    );
  }
}
