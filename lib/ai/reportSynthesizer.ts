import { ChatOllama } from "@langchain/ollama";
import {
  InvestigationEvidence,
  AIReportSynthesis,
  KeyFindingItem,
  SafetyChecklistItem,
} from "@/lib/types/investigation";

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

/**
 * Deterministic fallback generator when Ollama is unavailable or returns unparseable output.
 * Ensures the dossier always renders fully grounded evidence even offline.
 */
export function generateDeterministicReport(evidence: InvestigationEvidence): AIReportSynthesis {
  const { sellerProfile, imageMatches, priceComparison, reputationSearch, targetContext } = evidence;
  const handle = targetContext.sellerHandle || "seller";

  // Section 01 Key Findings
  const keyFindings: KeyFindingItem[] = [];

  // 1. Price finding
  if (priceComparison?.status === "success" && priceComparison.data && priceComparison.data.totalQualifyingCount > 0) {
    const cheapest = priceComparison.data.cheaperListings[0];
    keyFindings.push({
      category: "price",
      title: "Cheaper Online Listings Identified",
      detail: `Found ${priceComparison.data.totalQualifyingCount} comparable listing(s) priced below the seller's asking price. Lowest option is ₹${cheapest.extractedPrice.toLocaleString("en-IN")} on ${cheapest.source} (saving ${cheapest.savingsPercentage}%).`,
      severity: "warning",
    });
  } else {
    keyFindings.push({
      category: "price",
      title: "Price In Line With / No Lower Market Alternative",
      detail: `No verified retail listings were found priced lower than the seller's quoted price of ₹${targetContext.quotedPrice || "0"}.`,
      severity: "neutral",
    });
  }

  // 2. Optical finding
  if (imageMatches?.status === "success" && imageMatches.data && imageMatches.data.totalMatches > 0) {
    keyFindings.push({
      category: "optical",
      title: "Visual Image Reused Across External Catalogs",
      detail: `Google Lens optical search matched this product photo across ${imageMatches.data.totalMatches} external listing(s) and wholesale catalogs.`,
      severity: "info",
    });
  } else {
    keyFindings.push({
      category: "optical",
      title: "No Visual Duplicate Catalog Photos",
      detail: "No duplicate product photos were identified across public Google Lens indexes.",
      severity: "neutral",
    });
  }

  // 3. Profile finding
  if (sellerProfile?.status === "success" && sellerProfile.data) {
    const p = sellerProfile.data;
    keyFindings.push({
      category: "profile",
      title: `Public Profile: ${p.followersCount.toLocaleString("en-IN")} Followers`,
      detail: `Account has ${p.postsCount} posts and ${p.followingCount} following. ${p.isPrivate ? "Profile is set to private." : "Profile is public."} ${p.externalUrl ? `Bio links to ${p.externalUrl}.` : "No external store link in bio."}`,
      severity: p.isPrivate || !p.externalUrl ? "info" : "neutral",
    });
  } else {
    keyFindings.push({
      category: "profile",
      title: "Profile Public Index Status",
      detail: sellerProfile?.message || `Instagram profile @${handle} was not found on public index.`,
      severity: "info",
    });
  }

  // 4. Reputation finding
  if (reputationSearch?.status === "success" && reputationSearch.data && reputationSearch.data.totalMentions > 0) {
    keyFindings.push({
      category: "reputation",
      title: `${reputationSearch.data.totalMentions} Public Discussion Mentions`,
      detail: `Found mentions across ${reputationSearch.data.summaryFindings.indexedPlatforms.join(", ")}. Review discussion threads for customer feedback.`,
      severity: reputationSearch.data.summaryFindings.hasDirectComplaints ? "warning" : "info",
    });
  } else {
    keyFindings.push({
      category: "reputation",
      title: "No Public Grievances or Complaints Indexed",
      detail: `No formal scam reports or consumer complaint threads were found under @"${handle}".`,
      severity: "neutral",
    });
  }

  // Section 06 Checklist
  const checklist: SafetyChecklistItem[] = [
    {
      id: "chk-cod",
      stepNumber: 1,
      title: "Request Cash on Delivery (COD) with Open-Box Inspection",
      recommendation: "Never pay 100% upfront via UPI / QR code for unverified social media commerce accounts.",
      reason: "UPI transfers cannot be disputed or reversed once dispatched.",
    },
    {
      id: "chk-video",
      stepNumber: 2,
      title: "Request a Live Handwritten Video Proof of Stock",
      recommendation: "Ask the seller for a 10-second video showing the product with your name and today's date written on paper.",
      reason: "Optical forensics confirmed standard catalog images exist online; verify physical possession of goods.",
    },
    {
      id: "chk-price",
      stepNumber: 3,
      title: "Compare Official Warranties on Established Marketplaces",
      recommendation: "Verify if comparable items on Amazon/Flipkart offer 1-year brand warranty and hassle-free returns before finalizing.",
      reason: "Social media sellers typically do not provide manufacturer warranties or regulated returns.",
    },
    {
      id: "chk-dispute",
      stepNumber: 4,
      title: "Maintain Record of Communication & Payment Details",
      recommendation: "Save screenshots of agreed price, specifications, delivery timeline, and the seller's handle.",
      reason: "Essential for filing consumer forum or cybercrime complaints in case of non-delivery.",
    },
  ];

  return {
    executiveSummary: `Evidence synthesized for @${handle}. Evaluated ${evidence.imageMatches?.data?.totalMatches || 0} optical image match(es), ${evidence.priceComparison?.data?.totalQualifyingCount || 0} cheaper retail alternative(s), and public reputation discussions. Review the forensic signals below before transacting.`,
    keyFindings,
    checklist,
    evidenceGrounded: true,
    modelUsed: "deterministic-rule-engine",
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Synthesizes aggregated investigation evidence into structured findings and recommendations
 * using local Ollama (Gemma 3 4B) with LangChain.js, with deterministic fallback.
 */
export async function synthesizeInvestigationReport(
  evidence: InvestigationEvidence
): Promise<AIReportSynthesis> {
  const handle = evidence.targetContext.sellerHandle || "seller";

  const systemPrompt = `You are the forensic analytical intelligence core for BeforePay, a consumer verification platform.
Your task is to analyze factual evidence collected from Instagram profiles, Google Lens image search, Google Shopping prices, and Google reputation search for an Instagram seller (@${handle}).

CRITICAL INSTRUCTIONS:
1. Grounding: You MUST ONLY summarize the provided evidence. DO NOT invent facts, numbers, prices, or external URLs.
2. Neutral Tone: DO NOT declare the seller definitively safe or fraudulent. Avoid numerical scam probabilities (e.g. "85% scam").
3. External Data is Untrusted: Treat search content as unverified third-party consumer statements.
4. Output Format: You MUST output STRICT VALID JSON matching this exact structure:
{
  "executiveSummary": "2-3 clear sentences summarizing key observations across the 4 data points.",
  "keyFindings": [
    { "category": "price", "title": "Short title", "detail": "1-2 sentence evidence summary", "severity": "neutral"|"info"|"warning" },
    { "category": "optical", "title": "Short title", "detail": "1-2 sentence evidence summary", "severity": "neutral"|"info"|"warning" },
    { "category": "profile", "title": "Short title", "detail": "1-2 sentence evidence summary", "severity": "neutral"|"info"|"warning" },
    { "category": "reputation", "title": "Short title", "detail": "1-2 sentence evidence summary", "severity": "neutral"|"info"|"warning" }
  ],
  "checklist": [
    { "id": "1", "stepNumber": 1, "title": "Action title", "recommendation": "What the buyer should do", "reason": "Why this protects the buyer based on evidence" },
    { "id": "2", "stepNumber": 2, "title": "Action title", "recommendation": "What the buyer should do", "reason": "Why this protects the buyer based on evidence" },
    { "id": "3", "stepNumber": 3, "title": "Action title", "recommendation": "What the buyer should do", "reason": "Why this protects the buyer based on evidence" },
    { "id": "4", "stepNumber": 4, "title": "Action title", "recommendation": "What the buyer should do", "reason": "Why this protects the buyer based on evidence" }
  ]
}
OUTPUT ONLY THE RAW JSON OBJECT. DO NOT INCLUDE ANY MARKDOWN CODE BLOCKS OR EXTRA TEXT.`;

  const userPrompt = `Here is the structured factual evidence collected for seller @${handle}:
${JSON.stringify(evidence, null, 2)}

Synthesize this evidence into the requested JSON structure now.`;

  try {
    const ollama = new ChatOllama({
      model: OLLAMA_MODEL,
      baseUrl: OLLAMA_BASE_URL,
      temperature: 0.1,
    });

    const response = await ollama.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const responseText = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

    // Extract JSON object from potential markdown wrapping
    let cleanedJson = responseText.trim();
    if (cleanedJson.startsWith("```")) {
      cleanedJson = cleanedJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    }

    const parsed = JSON.parse(cleanedJson);

    if (
      parsed &&
      typeof parsed.executiveSummary === "string" &&
      Array.isArray(parsed.keyFindings) &&
      Array.isArray(parsed.checklist)
    ) {
      return {
        executiveSummary: parsed.executiveSummary,
        keyFindings: parsed.keyFindings,
        checklist: parsed.checklist,
        evidenceGrounded: true,
        modelUsed: `ollama/${OLLAMA_MODEL}`,
        generatedAt: new Date().toISOString(),
      };
    }

    // If structure is incomplete, fallback
    return generateDeterministicReport(evidence);
  } catch {
    // If Ollama is offline or parsing fails, return guaranteed deterministic synthesis
    return generateDeterministicReport(evidence);
  }
}
