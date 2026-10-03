import { NextRequest, NextResponse } from "next/server";
import { investigateProductImage } from "@/lib/investigation/productLens";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;
      const imageUrl = formData.get("imageUrl") as string | null;

      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const result = await investigateProductImage({ imageBuffer: buffer });
        return NextResponse.json(result);
      } else if (imageUrl) {
        const result = await investigateProductImage(imageUrl);
        return NextResponse.json(result);
      } else {
        return NextResponse.json(
          {
            status: "failed",
            data: null,
            message: "No image file or URL was provided in the upload request.",
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        {
          status: "failed",
          data: null,
          message: "Please provide a valid product image URL or upload for visual search.",
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
