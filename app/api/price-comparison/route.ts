import { NextRequest, NextResponse } from "next/server";
import { compareProductPrices } from "@/lib/investigation/priceComparison";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, quotedPrice } = body;

    if (!productName || typeof productName !== "string") {
      return NextResponse.json(
        {
          status: "failed",
          data: null,
          message: "Please provide a valid product name or search term.",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const result = await compareProductPrices(productName, quotedPrice);
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
