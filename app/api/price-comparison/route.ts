import { NextRequest, NextResponse } from "next/server";
import { compareProductPrices } from "@/lib/investigation/priceComparison";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, quotedPrice, lensKeywords } = body;

    if (!quotedPrice) {
      return NextResponse.json(
        {
          status: "failed",
          data: null,
          message: "Please provide the seller's asking price to calculate price variances.",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const result = await compareProductPrices({
      productName: typeof productName === "string" ? productName : "",
      quotedPrice,
      lensKeywords: Array.isArray(lensKeywords) ? lensKeywords : undefined,
    });
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
