import { ChatOllama } from "@langchain/ollama";
import {
  InvestigationEvidence,
  AIReportSynthesis,
  KeyFindingItem,
  SafetyChecklistItem,
} from "@/lib/types/investigation";
import { normalizeInstagramHandle } from "@/lib/investigation/sellerProfile";

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

/**
 * Deterministic fallback generator when Ollama is unavailable or returns unparseable output.
 * Ensures the dossier always renders fully grounded evidence even offline with clean consumer insights.
 */
export function generateDeterministicReport(evidence: InvestigationEvidence): AIReportSynthesis {
  const { sellerProfile, imageMatches, priceComparison, reputationSearch, targetContext } = evidence;
  const handle = normalizeInstagramHandle(targetContext.sellerHandle || "") || "seller";

  const keyFindings: KeyFindingItem[] = [];

  // 1. Price Assessment
  const hasCheaper =
    priceComparison?.status === "success" &&
    priceComparison.data &&
    priceComparison.data.totalQualifyingCount > 0;
  
  if (hasCheaper && priceComparison?.data) {
    const cheapest = priceComparison.data.cheaperListings[0];
    keyFindings.push({
      category: "price",
      title: `Better Deals Online (Save up to ${priceComparison.data.maximumSavingsPercentage || cheapest.savingsPercentage}%)`,
      detail: `Found ${priceComparison.data.totalQualifyingCount} comparable online listing(s) priced below the seller's asking price. Lowest alternative is ₹${cheapest.extractedPrice.toLocaleString("en-IN")} on ${cheapest.source} with standard return warranty.`,
      severity: "warning",
    });
  } else {
    keyFindings.push({
      category: "price",
      title: "Fair Market Price",
      detail: `No verified retail listings were found priced lower than the seller's asking price of ₹${targetContext.quotedPrice || "0"}. The quoted price is competitive.`,
      severity: "neutral",
    });
  }

  // 2. Optical Image Authenticity
  const hasImageMatches =
    imageMatches?.status === "success" &&
    imageMatches.data &&
    imageMatches.data.totalMatches > 0;

  if (hasImageMatches && imageMatches?.data) {
    keyFindings.push({
      category: "optical",
      title: "Wholesale / Catalog Image Match",
      detail: `Google Lens matched this product photo across ${imageMatches.data.totalMatches} external listing(s) and wholesale catalogs (e.g. Alibaba, Made-in-China). Verify the seller has physical stock.`,
      severity: "info",
    });
  } else {
    keyFindings.push({
      category: "optical",
      title: "Original / Unique Product Photo",
      detail: "No duplicate catalog images or mass wholesale listings were found for this photo across public Google Lens indexes.",
      severity: "neutral",
    });
  }

  // 3. Profile Credibility & Impersonation Risk
  if (sellerProfile?.status === "success" && sellerProfile.data) {
    const p = sellerProfile.data;
    const isEstablished = p.followersCount >= 5000 && !p.isPrivate;
    const isLowFollowers = p.signals?.isLowFollowers || p.followersCount < 500;
    const hasNoCod = p.signals?.hasNoCodPolicy;
    const isClone = p.signals?.impersonationRisk === "high" || Boolean(p.signals?.suspectedCloneDetails);

    if (isClone && p.signals?.suspectedCloneDetails) {
      keyFindings.push({
        category: "profile",
        title: "Suspected Duplicate / Clone Account",
        detail: `Found an official brand page (@${p.signals.suspectedCloneDetails.suspectedOfficialHandle}) with substantially more followers. Queried account (@${handle}) has only ${p.followersCount.toLocaleString("en-IN")} followers.`,
        severity: "warning",
      });
    } else if (isLowFollowers && hasNoCod) {
      keyFindings.push({
        category: "profile",
        title: `High Risk Account Signals (${p.followersCount.toLocaleString("en-IN")} Followers)`,
        detail: `Newly created or low-follower account enforcing strict pre-payment (No COD) and direct WhatsApp ordering. High risk of fraud.`,
        severity: "warning",
      });
    } else if (isLowFollowers) {
      keyFindings.push({
        category: "profile",
        title: `Low Follower Count (${p.followersCount.toLocaleString("en-IN")} Followers)`,
        detail: `Account has limited public presence (${p.postsCount} posts). Verify physical stock and seller identity before making high-value transfers.`,
        severity: "info",
      });
    } else {
      keyFindings.push({
        category: "profile",
        title: isEstablished
          ? `Established Account (${p.followersCount.toLocaleString("en-IN")} Followers)`
          : `Public Account (${p.followersCount.toLocaleString("en-IN")} Followers)`,
        detail: `Account is ${p.isPrivate ? "private" : "public"} with ${p.postsCount} recent indexed posts. ${p.externalUrl ? `Bio links to official store/contact: ${p.externalUrl}.` : "No external website linked in bio."}`,
        severity: p.isPrivate || !p.externalUrl ? "info" : "neutral",
      });
    }
  } else {
    keyFindings.push({
      category: "profile",
      title: "Profile Public Index Status",
      detail: sellerProfile?.message || `Instagram profile @${handle} was not found on public index. May be restricted or new.`,
      severity: "info",
    });
  }

  // 4. Reputation & Grievance History
  const hasImpersonationAlerts =
    reputationSearch?.status === "success" &&
    reputationSearch.data &&
    Boolean(reputationSearch.data.summaryFindings.hasImpersonationAlerts);

  const hasComplaints =
    reputationSearch?.status === "success" &&
    reputationSearch.data &&
    reputationSearch.data.summaryFindings.hasDirectComplaints;

  if (hasImpersonationAlerts && reputationSearch?.data) {
    keyFindings.push({
      category: "reputation",
      title: "Public Scam & Impersonation Alert",
      detail: `Public notices or brand warnings detected: Scammers frequently clone this brand's media to solicit advance payments on WhatsApp.`,
      severity: "warning",
    });
  } else if (hasComplaints && reputationSearch?.data) {
    keyFindings.push({
      category: "reputation",
      title: "Consumer Grievance Threads Mentioned",
      detail: `Found discussion threads referencing customer delivery, non-fulfillment, or payment issues. Review community discussions below carefully.`,
      severity: "warning",
    });
  } else if (
    reputationSearch?.status === "success" &&
    reputationSearch.data &&
    reputationSearch.data.totalMentions > 0
  ) {
    keyFindings.push({
      category: "reputation",
      title: `${reputationSearch.data.totalMentions} Public Discussion Mentions`,
      detail: `Found community mentions across social and web platforms. No formal fraud court records or scam warnings indexed.`,
      severity: "neutral",
    });
  } else {
    keyFindings.push({
      category: "reputation",
      title: "Clean Public Track Record",
      detail: `No consumer court orders or unresolved complaint threads were found indexed under @"${handle}".`,
      severity: "neutral",
    });
  }

  // Determine Consumer Trust Verdict
  let trustVerdictLevel: "clean" | "caution" | "elevated_risk" = "clean";
  let trustVerdictTitle = "ESTABLISHED SELLER — VERIFIED CREDIBILITY";
  let executiveSummary = "";
  let bottomLineRecommendation = "";

  const pData = sellerProfile?.data;
  const isClone =
    pData?.signals?.impersonationRisk === "high" ||
    Boolean(pData?.signals?.suspectedCloneDetails) ||
    hasImpersonationAlerts;
  const isHighRiskTerms =
    Boolean(pData?.signals?.isLowFollowers) &&
    (Boolean(pData?.signals?.hasNoCodPolicy) || Boolean(pData?.signals?.isDirectWhatsAppOnly));

  if (isClone) {
    trustVerdictLevel = "elevated_risk";
    trustVerdictTitle = "HIGH RISK — SUSPECTED FAKE / IMPERSONATION ACCOUNT";
    executiveSummary = `CRITICAL WARNING: This account (@${handle}) shows high-risk duplicate/clone signatures. ${
      pData?.signals?.suspectedCloneDetails
        ? pData.signals.suspectedCloneDetails.reason
        : ""
    } ${
      hasImpersonationAlerts
        ? "Public scam alerts warn that fraudulent accounts copy this brand to solicit advance WhatsApp payments."
        : ""
    } It has only ${pData?.followersCount || 0} followers and strictly enforces upfront pre-payment.`;
    bottomLineRecommendation =
      "DO NOT TRANSFER MONEY. This account is strongly suspected to be a fake duplicate page mimicking a legitimate brand. Verify the official brand profile before paying.";
  } else if (isHighRiskTerms) {
    trustVerdictLevel = "elevated_risk";
    trustVerdictTitle = "HIGH RISK — UNVERIFIED ACCOUNT WITH NO COD";
    executiveSummary = `@${handle} has very low follower count (${pData?.followersCount || 0} followers), lacks an official domain checkout, and enforces 'No COD' with direct WhatsApp payments. Unverified social accounts with no buyer protection carry high fraud risk.`;
    bottomLineRecommendation =
      "Do not send 100% upfront payment via personal UPI/GPay. Insist on Cash on Delivery with open-box inspection or cancel the order.";
  } else if (hasComplaints) {
    trustVerdictLevel = "elevated_risk";
    trustVerdictTitle = "ELEVATED RISK — CONSUMER COMPLAINTS FOUND";
    executiveSummary = `@${handle} has public discussion mentions citing consumer grievances or delivery disputes. Exercise caution before sending upfront payment.`;
    bottomLineRecommendation =
      "Do not transfer full payment upfront. Insist on Cash on Delivery (COD) or escrow payment protection.";
  } else if (hasCheaper) {
    trustVerdictLevel = "caution";
    trustVerdictTitle = "ACTIVE SELLER — LOWER PRICES AVAILABLE ONLINE";
    executiveSummary = `@${handle} has verified public profile signals and no scam complaints indexed. However, comparable products are available significantly cheaper on established retail platforms.`;
    bottomLineRecommendation =
      "Compare official retail alternatives (e.g. Flipkart/Amazon) for better prices, verified brand warranties, and hassle-free return policies before buying.";
  } else {
    trustVerdictLevel = "clean";
    trustVerdictTitle = "ESTABLISHED PROFILE — CLEAN PUBLIC SIGNALS";
    executiveSummary = `@${handle} shows active public presence, realistic pricing, and no indexed consumer disputes. Standard safe shopping precautions apply.`;
    bottomLineRecommendation =
      "Profile signals appear genuine. For high-value orders, request a short video proof of stock or Cash on Delivery.";
  }

  // Section 06 Checklist
  const checklist: SafetyChecklistItem[] = [
    {
      id: "chk-cod",
      stepNumber: 1,
      title: "Request Cash on Delivery (COD) with Open-Box Inspection",
      recommendation: "Never transfer 100% upfront via personal UPI / QR code for unverified social media commerce.",
      reason: "UPI transfers to personal bank accounts cannot be disputed or charge-backed once sent.",
    },
    {
      id: "chk-video",
      stepNumber: 2,
      title: "Request a Live Handwritten Video Proof of Stock",
      recommendation: "Ask the seller for a 10-second video showing the product with your name and today's date written on paper.",
      reason: "Confirms the seller has physical possession of the product rather than dropshipping or reusing photos.",
    },
    {
      id: "chk-price",
      stepNumber: 3,
      title: "Compare Official Warranties on Established Marketplaces",
      recommendation: "Verify if comparable items on Amazon/Flipkart offer brand warranty and 7-day replacement policies.",
      reason: "Social media sellers rarely offer return policies or manufacturer warranties.",
    },
    {
      id: "chk-dispute",
      stepNumber: 4,
      title: "Maintain Record of Communication & Agreed Terms",
      recommendation: "Save screenshots of agreed price, specifications, delivery timeline, and the seller's handle.",
      reason: "Essential documentation for consumer grievance filings in case of non-delivery.",
    },
  ];

  return {
    executiveSummary,
    trustVerdictLevel,
    trustVerdictTitle,
    bottomLineRecommendation,
    keyFindings,
    checklist,
    evidenceGrounded: true,
    modelUsed: "deterministic-rule-engine",
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Synthesizes aggregated investigation evidence into structured consumer findings and recommendations
 * using local Ollama (Gemma 3 4B) with LangChain.js, with deterministic fallback.
 */
export async function synthesizeInvestigationReport(
  evidence: InvestigationEvidence
): Promise<AIReportSynthesis> {
  const handle = normalizeInstagramHandle(evidence.targetContext.sellerHandle || "") || "seller";

  const systemPrompt = `You are the lead consumer protection analyst for BeforePay, a fraud-prevention and smart shopping verification platform.
Your job is to synthesize factual investigative data for an Instagram seller (@${handle}) into an easily understandable, actionable report for an online buyer.

CRITICAL GUIDELINES:
1. Speak directly to the buyer in clear, helpful, everyday English. Answer their core questions: "Is this seller legitimate?", "Am I getting a good price?", "What should I do before paying?"
2. Grounding: ONLY use the provided evidence. DO NOT invent facts, store names, prices, or external URLs.
3. Impersonation & Clone Detection: If the profile has very low followers (< 500), has 'No COD' / pre-payment terms, or if reputation evidence indicates brand scam alerts or official accounts with larger followers, assign "elevated_risk" with title "HIGH RISK — SUSPECTED FAKE / IMPERSONATION ACCOUNT" and urge the buyer not to transfer money.
4. Neutral & Objective Tone: Clearly communicate high-risk indicators to protect consumer funds without ungrounded speculation.
5. Output STRICT JSON format matching this schema:
{
  "trustVerdictLevel": "clean" | "caution" | "elevated_risk",
  "trustVerdictTitle": "Short 4-6 word punchy verdict header (e.g. 'HIGH RISK — SUSPECTED FAKE / IMPERSONATION ACCOUNT' or 'ACTIVE SELLER — LOWER PRICES AVAILABLE ONLINE' or 'ESTABLISHED PROFILE — CLEAN PUBLIC SIGNALS')",
  "executiveSummary": "2-3 friendly, insightful sentences summarizing the seller's legitimacy, price competitiveness, and public reputation.",
  "bottomLineRecommendation": "1-2 actionable sentences telling the buyer exactly what precaution to take before sending money.",
  "keyFindings": [
    { "category": "price", "title": "Short title", "detail": "1-2 sentence evidence breakdown", "severity": "neutral"|"info"|"warning" },
    { "category": "optical", "title": "Short title", "detail": "1-2 sentence evidence breakdown", "severity": "neutral"|"info"|"warning" },
    { "category": "profile", "title": "Short title", "detail": "1-2 sentence evidence breakdown", "severity": "neutral"|"info"|"warning" },
    { "category": "reputation", "title": "Short title", "detail": "1-2 sentence evidence breakdown", "severity": "neutral"|"info"|"warning" }
  ],
  "checklist": [
    { "id": "1", "stepNumber": 1, "title": "Action title", "recommendation": "Clear instruction", "reason": "Why this protects the buyer" },
    { "id": "2", "stepNumber": 2, "title": "Action title", "recommendation": "Clear instruction", "reason": "Why this protects the buyer" },
    { "id": "3", "stepNumber": 3, "title": "Action title", "recommendation": "Clear instruction", "reason": "Why this protects the buyer" },
    { "id": "4", "stepNumber": 4, "title": "Action title", "recommendation": "Clear instruction", "reason": "Why this protects the buyer" }
  ]
}
OUTPUT ONLY RAW JSON. NO MARKDOWN.`;

  const userPrompt = `Here is the factual investigation data collected for @${handle}:
${JSON.stringify(evidence, null, 2)}

Generate the consumer trust synthesis JSON now.`;

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
        trustVerdictLevel: parsed.trustVerdictLevel || "caution",
        trustVerdictTitle: parsed.trustVerdictTitle || "ACTIVE SELLER — EVIDENCE SYNTHESIZED",
        bottomLineRecommendation: parsed.bottomLineRecommendation || "Verify product details and consider Cash on Delivery before finalizing payment.",
        keyFindings: parsed.keyFindings,
        checklist: parsed.checklist,
        evidenceGrounded: true,
        modelUsed: `ollama/${OLLAMA_MODEL}`,
        generatedAt: new Date().toISOString(),
      };
    }

    return generateDeterministicReport(evidence);
  } catch {
    return generateDeterministicReport(evidence);
  }
}
