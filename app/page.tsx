"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InvestigationForm, {
  InvestigationFormData,
} from "@/components/InvestigationForm";
import InvestigationProgress from "@/components/InvestigationProgress";
import ReportDossier from "@/components/ReportDossier";

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

  const handleFormSubmit = (data: InvestigationFormData) => {
    setInvestigationData(data);
    setCurrentView("progress");

    // Seamlessly transition to the generated report after live progress scan
    setTimeout(() => {
      setCurrentView("report");
    }, 2800);
  };

  const handleNewInvestigation = () => {
    setCurrentView("form");
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
            isLoading={false}
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
            onNewInvestigation={handleNewInvestigation}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
