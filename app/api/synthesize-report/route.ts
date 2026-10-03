import { NextRequest, NextResponse } from "next/server";
import { synthesizeInvestigationReport } from "@/lib/ai/reportSynthesizer";
import { InvestigationEvidence } from "@/lib/types/investigation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const evidence: InvestigationEvidence = await req.json();

    if (!evidence || !evidence.targetContext) {
      return NextResponse.json(
        {
          status: "failed",
          data: null,
          message: "Please provide valid aggregated investigation evidence.",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const synthesis = await synthesizeInvestigationReport(evidence);
    return NextResponse.json({
      status: "success",
      data: synthesis,
      timestamp: new Date().toISOString(),
    });
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
