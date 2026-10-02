"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InvestigationForm, {
  InvestigationFormData,
} from "@/components/InvestigationForm";
import InvestigationProgress from "@/components/InvestigationProgress";
import ReportDossier from "@/components/ReportDossier";
import { CheckResult } from "@/lib/types/investigation";
import { SellerProfileData } from "@/lib/investigation/sellerProfile";
import { LensInvestigationData } from "@/lib/investigation/productLens";

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
  const [profileResult, setProfileResult] =
    useState<CheckResult<SellerProfileData> | null>(null);
  const [lensResult, setLensResult] =
    useState<CheckResult<LensInvestigationData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: InvestigationFormData) => {
    setInvestigationData(data);
    setCurrentView("progress");
    setIsLoading(true);

    try {
      // Run Phase 3 (Seller Profile) and Phase 4 (Product Lens) in parallel
      const profilePromise = data.sellerHandle
        ? fetch("/api/seller-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sellerHandle: data.sellerHandle }),
          })
            .then((r) => r.json())
            .catch((err) => ({
              status: "failed" as const,
              data: null,
              message: err instanceof Error ? err.message : "Network error",
              timestamp: new Date().toISOString(),
            }))
        : Promise.resolve(null);

      const lensPromise = data.previewUrl
        ? fetch("/api/product-lens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: data.previewUrl }),
          })
            .then((r) => r.json())
            .catch((err) => ({
              status: "failed" as const,
              data: null,
              message: err instanceof Error ? err.message : "Network error",
              timestamp: new Date().toISOString(),
            }))
        : Promise.resolve(null);

      const [pResult, lResult] = await Promise.all([profilePromise, lensPromise]);
      setProfileResult(pResult);
      setLensResult(lResult);
    } catch (err: unknown) {
      setProfileResult({
        status: "failed",
        data: null,
        message: err instanceof Error ? err.message : "Network error occurred",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
      // Allow user to view progress animation smoothly
      setTimeout(() => {
        setCurrentView("report");
      }, 1500);
    }
  };

  const handleNewInvestigation = () => {
    setCurrentView("form");
    setProfileResult(null);
    setLensResult(null);
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
            onNewInvestigation={handleNewInvestigation}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
