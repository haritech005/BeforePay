"use client";

import React, { useState } from "react";
import ImageUploader from "./ImageUploader";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  GlobeIcon,
  LockIcon,
  ArrowRightIcon,
  AlertCircleIcon,
} from "./Icons";

export interface InvestigationFormData {
  sellerHandle: string;
  productImage: File | null;
  previewUrl: string | null;
  productName: string;
  quotedPrice: string;
}

interface InvestigationFormProps {
  onSubmit: (data: InvestigationFormData) => void;
  isLoading?: boolean;
}

export default function InvestigationForm({
  onSubmit,
  isLoading = false,
}: InvestigationFormProps) {
  const [formData, setFormData] = useState<InvestigationFormData>({
    sellerHandle: "",
    productImage: null,
    previewUrl: null,
    productName: "",
    quotedPrice: "",
  });

  const [errors, setErrors] = useState<{
    sellerHandle?: string;
    productImage?: string;
    quotedPrice?: string;
  }>({});

  const cleanHandle = (input: string) => {
    let clean = input.trim();
    clean = clean.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
    clean = clean.replace(/\/.*$/, "");
    clean = clean.replace(/^@/, "");
    return clean;
  };

  const validate = (): boolean => {
    const newErrors: {
      sellerHandle?: string;
      productImage?: string;
      quotedPrice?: string;
    } = {};

    const handle = cleanHandle(formData.sellerHandle);
    if (!handle) {
      newErrors.sellerHandle = "Please enter the Instagram handle or profile URL.";
    } else if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
      newErrors.sellerHandle =
        "Instagram handle can only contain letters, numbers, periods, and underscores.";
    }

    if (!formData.productImage && !formData.previewUrl) {
      newErrors.productImage =
        "Please upload a product photo to reverse-search with Google Lens.";
    }

    const priceNum = Number(formData.quotedPrice.replace(/[^0-9.]/g, ""));
    if (!formData.quotedPrice.trim() || isNaN(priceNum) || priceNum <= 0) {
      newErrors.quotedPrice = "Please enter the seller's asking price in INR.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9.]/g, "");
    setFormData((prev) => ({ ...prev, quotedPrice: rawVal }));
    if (errors.quotedPrice) {
      setErrors((prev) => ({ ...prev, quotedPrice: undefined }));
    }
  };

  const handleText = cleanHandle(formData.sellerHandle);
  const isValidHandle =
    handleText.length > 0 && /^[a-zA-Z0-9._]{1,30}$/.test(handleText);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {/* Main Form Card */}
      <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Verify an Instagram seller before you pay
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Check account credibility, find matching product photos across the web, and compare prices on trusted stores.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* Field 1: Instagram Seller Handle */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="seller-handle"
              className="text-sm font-semibold text-slate-900 flex items-center gap-1"
            >
              Instagram Seller Handle or URL
              <span aria-hidden="true" className="text-rose-600 font-bold">
                *
              </span>
            </label>

            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                <span className="font-mono text-sm font-semibold select-none">
                  @
                </span>
              </div>
              <input
                id="seller-handle"
                name="seller-handle"
                type="text"
                value={formData.sellerHandle}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    sellerHandle: e.target.value,
                  }));
                  if (errors.sellerHandle) {
                    setErrors((prev) => ({ ...prev, sellerHandle: undefined }));
                  }
                }}
                placeholder="e.g. brand_shop_india or https://instagram.com/brand_shop_india"
                className={`w-full bg-white text-slate-900 text-sm pl-8 pr-10 py-3 rounded-xl border shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                  errors.sellerHandle
                    ? "border-rose-300 bg-rose-50/20 focus:ring-rose-500"
                    : "border-slate-300 hover:border-slate-400"
                }`}
              />
              {isValidHandle && (
                <div className="absolute right-3.5 flex items-center pointer-events-none text-emerald-600">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                </div>
              )}
            </div>

            {errors.sellerHandle && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                <AlertCircleIcon className="w-3.5 h-3.5" />
                {errors.sellerHandle}
              </p>
            )}
          </div>

          {/* Field 2: Product Image Uploader */}
          <ImageUploader
            imageFile={formData.productImage}
            previewUrl={formData.previewUrl}
            error={errors.productImage}
            onImageChange={(file, previewUrl) => {
              setFormData((prev) => ({
                ...prev,
                productImage: file,
                previewUrl: previewUrl,
              }));
              if (errors.productImage && (file || previewUrl)) {
                setErrors((prev) => ({ ...prev, productImage: undefined }));
              }
            }}
          />

          {/* Field 3: Product Name or Keywords (Optional) */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="product-name"
              className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"
            >
              Product Name or Keywords
              <span className="text-xs text-slate-400 font-normal">
                (Optional)
              </span>
            </label>
            <input
              id="product-name"
              name="product-name"
              type="text"
              value={formData.productName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  productName: e.target.value,
                }))
              }
              placeholder="e.g. Linen Striped Shirt, Korean Baggy Pants"
              className="w-full bg-white text-slate-900 text-sm px-3.5 py-3 rounded-xl border border-slate-300 hover:border-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>

          {/* Field 4: Quoted Price */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="seller-price"
              className="text-sm font-semibold text-slate-900 flex items-center gap-1"
            >
              Seller&apos;s Quoted Price (₹)
              <span aria-hidden="true" className="text-rose-600 font-bold">
                *
              </span>
            </label>
            <div className="relative flex items-center max-w-xs">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-900 font-bold text-base">
                ₹
              </div>
              <input
                id="seller-price"
                name="seller-price"
                type="text"
                value={formData.quotedPrice}
                onChange={handlePriceChange}
                placeholder="780"
                className={`w-full bg-white text-slate-900 text-sm pl-8 pr-4 py-3 rounded-xl border shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                  errors.quotedPrice
                    ? "border-rose-300 bg-rose-50/20 focus:ring-rose-500"
                    : "border-slate-300 hover:border-slate-400"
                }`}
              />
            </div>
            {errors.quotedPrice && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                <AlertCircleIcon className="w-3.5 h-3.5" />
                {errors.quotedPrice}
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Checking seller...</span>
                </>
              ) : (
                <>
                  <span>Check Seller</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
