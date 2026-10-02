import { NextRequest, NextResponse } from "next/server";
import { investigateProductImage } from "@/lib/investigation/productLens";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        {
          status: "failed",
          data: null,
          message: "Please provide a valid product image URL for visual search.",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const result = await investigateProductImage(imageUrl);
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
