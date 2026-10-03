"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InvestigationForm, {
  InvestigationFormData,
} from "@/components/InvestigationForm";
import InvestigationProgress, {
  StepState,
} from "@/components/InvestigationProgress";
import ReportDossier from "@/components/ReportDossier";
import {
  CheckResult,
  InvestigationEvidence,
  AIReportSynthesis,
} from "@/lib/types/investigation";
import { SellerProfileData } from "@/lib/investigation/sellerProfile";
import { LensInvestigationData } from "@/lib/investigation/productLens";
import { PriceComparisonData } from "@/lib/investigation/priceComparison";
import { SellerReputationData } from "@/lib/investigation/sellerReputation";

export default function HomePage() {
  const [currentView, setCurrentView] = useState<"form" | "progress" | "report">(
    "form"
  );
  const [investigationData, setInvestigationData] =
    useState<InvestigationFormData>({
      sellerHandle: "",
      productImage: null,
      previewUrl: null,
      productName: "",
      quotedPrice: "",
    });

  const [profileStatus, setProfileStatus] = useState<StepState>("pending");
  const [lensStatus, setLensStatus] = useState<StepState>("pending");
  const [priceStatus, setPriceStatus] = useState<StepState>("pending");
  const [reputationStatus, setReputationStatus] = useState<StepState>("pending");
  const [synthesisStatus, setSynthesisStatus] = useState<StepState>("pending");

  const [profileResult, setProfileResult] =
    useState<CheckResult<SellerProfileData> | null>(null);
  const [lensResult, setLensResult] =
    useState<CheckResult<LensInvestigationData> | null>(null);
  const [priceResult, setPriceResult] =
    useState<CheckResult<PriceComparisonData> | null>(null);
  const [reputationResult, setReputationResult] =
    useState<CheckResult<SellerReputationData> | null>(null);
  const [synthesis, setSynthesis] = useState<AIReportSynthesis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: InvestigationFormData) => {
    setInvestigationData(data);
    setCurrentView("progress");
    setIsLoading(true);

    // Set initial loading states
    setProfileStatus("loading");
    setLensStatus("loading");
    setPriceStatus("loading");
    setReputationStatus("loading");
    setSynthesisStatus("pending");

    try {
      // Step 1: Run all 4 investigative data collection checks concurrently
      const profilePromise = data.sellerHandle
        ? fetch("/api/seller-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sellerHandle: data.sellerHandle }),
          })
            .then(async (r) => {
              const res = await r.json();
              if (res.status === "success") {
                setProfileStatus("completed");
              } else if (res.status === "no_results") {
                setProfileStatus("no_results");
              } else {
                setProfileStatus("failed");
              }
              return res;
            })
            .catch((err) => {
              setProfileStatus("failed");
              return {
                status: "failed" as const,
                data: null,
                message: err instanceof Error ? err.message : "Network error",
                timestamp: new Date().toISOString(),
              };
            })
        : Promise.resolve(null);

      const lensPromise =
        data.productImage || data.previewUrl
          ? (() => {
              let reqPromise: Promise<Response>;
              if (data.productImage) {
                const formData = new FormData();
                formData.append("image", data.productImage);
                reqPromise = fetch("/api/product-lens", {
                  method: "POST",
                  body: formData,
                });
              } else {
                reqPromise = fetch("/api/product-lens", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ imageUrl: data.previewUrl }),
                });
              }

              return reqPromise
                .then(async (r) => {
                  const res = await r.json();
                  if (res.status === "success") {
                    setLensStatus("completed");
                  } else if (res.status === "no_results") {
                    setLensStatus("no_results");
                  } else {
                    setLensStatus("failed");
                  }
                  return res;
                })
                .catch((err) => {
                  setLensStatus("failed");
                  return {
                    status: "failed" as const,
                    data: null,
                    message: err instanceof Error ? err.message : "Network error",
                    timestamp: new Date().toISOString(),
                  };
                });
            })()
          : Promise.resolve(null);

      const pricePromise = data.quotedPrice
        ? (async () => {
            let lensKeywords: string[] = [];
            if (data.productImage || data.previewUrl) {
              try {
                const lensRes = await lensPromise;
                if (lensRes?.data?.candidateProductTitles) {
                  lensKeywords = lensRes.data.candidateProductTitles;
                }
              } catch (e) {
                // If lens fails, continue with price comparison
              }
            }

            try {
              const res = await fetch("/api/price-comparison", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  productName: data.productName || "",
                  quotedPrice: data.quotedPrice,
                  lensKeywords,
                }),
              });
              const json = await res.json();
              if (json.status === "success") {
                setPriceStatus("completed");
              } else if (json.status === "no_results") {
                setPriceStatus("no_results");
              } else {
                setPriceStatus("failed");
              }
              return json;
            } catch (err) {
              setPriceStatus("failed");
              return {
                status: "failed" as const,
                data: null,
                message: err instanceof Error ? err.message : "Network error",
                timestamp: new Date().toISOString(),
              };
            }
          })()
        : Promise.resolve(null);

      const reputationPromise = data.sellerHandle
        ? fetch("/api/seller-reputation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sellerHandle: data.sellerHandle }),
          })
            .then(async (r) => {
              const res = await r.json();
              if (res.status === "success") {
                setReputationStatus("completed");
              } else if (res.status === "no_results") {
                setReputationStatus("no_results");
              } else {
                setReputationStatus("failed");
              }
              return res;
            })
            .catch((err) => {
              setReputationStatus("failed");
              return {
                status: "failed" as const,
                data: null,
                message: err instanceof Error ? err.message : "Network error",
                timestamp: new Date().toISOString(),
              };
            })
        : Promise.resolve(null);

      const [pResult, lResult, prResult, rResult] = await Promise.all([
        profilePromise,
        lensPromise,
        pricePromise,
        reputationPromise,
      ]);

      setProfileResult(pResult);
      setLensResult(lResult);
      setPriceResult(prResult);
      setReputationResult(rResult);

      // Step 2: Aggregate into typed InvestigationEvidence and trigger AI report synthesis
      setSynthesisStatus("loading");

      const aggregatedEvidence: InvestigationEvidence = {
        sellerProfile: pResult || { status: "not_run", data: null },
        imageMatches: lResult || { status: "not_run", data: null },
        priceComparison: prResult || { status: "not_run", data: null },
        reputationSearch: rResult || { status: "not_run", data: null },
        targetContext: {
          sellerHandle: data.sellerHandle,
          productName: data.productName,
          quotedPrice: data.quotedPrice,
          previewUrl: data.previewUrl,
        },
        executedAt: new Date().toISOString(),
      };

      try {
        const synthRes = await fetch("/api/synthesize-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(aggregatedEvidence),
        });
        const synthJson = await synthRes.json();
        if (synthJson.status === "success" && synthJson.data) {
          setSynthesis(synthJson.data);
          setSynthesisStatus("completed");
        } else {
          setSynthesisStatus("failed");
        }
      } catch (synthErr) {
        console.warn("AI synthesis endpoint warning, using client fallback", synthErr);
        setSynthesisStatus("failed");
      }
    } catch (err: unknown) {
      setProfileResult({
        status: "failed",
        data: null,
        message: err instanceof Error ? err.message : "Network error occurred",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
      // Allow brief moment for smooth transition
      setTimeout(() => {
        setCurrentView("report");
      }, 1000);
    }
  };

  const handleNewInvestigation = () => {
    setCurrentView("form");
    setProfileResult(null);
    setLensResult(null);
    setPriceResult(null);
    setReputationResult(null);
    setSynthesis(null);
    setProfileStatus("pending");
    setLensStatus("pending");
    setPriceStatus("pending");
    setReputationStatus("pending");
    setSynthesisStatus("pending");
    setInvestigationData({
      sellerHandle: "",
      productImage: null,
      previewUrl: null,
      productName: "",
      quotedPrice: "",
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <Header onNewInvestigation={handleNewInvestigation} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* View 1: Clean Investigation Form */}
        {currentView === "form" && (
          <InvestigationForm
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
          />
        )}

        {/* View 2: Live Progress Pipeline */}
        {currentView === "progress" && (
          <InvestigationProgress
            sellerHandle={investigationData.sellerHandle}
            productName={investigationData.productName}
            quotedPrice={investigationData.quotedPrice}
            previewUrl={investigationData.previewUrl}
            profileStatus={profileStatus}
            lensStatus={lensStatus}
            priceStatus={priceStatus}
            reputationStatus={reputationStatus}
            synthesisStatus={synthesisStatus}
            onCancel={handleNewInvestigation}
            onComplete={() => setCurrentView("report")}
          />
        )}

        {/* View 3: Complete Report Dossier */}
        {currentView === "report" && (
          <ReportDossier
            sellerHandle={investigationData.sellerHandle}
            productName={investigationData.productName}
            quotedPrice={investigationData.quotedPrice}
            previewUrl={investigationData.previewUrl}
            profileResult={profileResult}
            lensResult={lensResult}
            priceResult={priceResult}
            reputationResult={reputationResult}
            synthesis={synthesis}
            onNewInvestigation={handleNewInvestigation}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
