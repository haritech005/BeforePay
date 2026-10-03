"use client";

import React, { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { PhotoIcon, CheckIcon, RefreshIcon, TrashIcon, SearchIcon, AlertCircleIcon } from "./Icons";

interface ImageUploaderProps {
  imageFile: File | null;
  previewUrl: string | null;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
  error?: string | null;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export default function ImageUploader({
  imageFile,
  previewUrl,
  onImageChange,
  error,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateAndProcessFile = useCallback(
    (file: File) => {
      setLocalError(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setLocalError(
          `Unsupported format (${file.type || "unknown"}). Please upload JPG, PNG, or WEBP.`
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setLocalError(
          `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum ${MAX_FILE_SIZE_MB}MB limit.`
        );
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      onImageChange(file, objectUrl);
    },
    [onImageChange]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLocalError(null);
    onImageChange(null, null);
  };

  const displayError = error || localError;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-900 flex items-center gap-1">
          Product Image
          <span aria-hidden="true" className="text-rose-600 font-bold">
            *
          </span>
        </label>
      </div>
      <p className="text-xs text-slate-500">
        Upload a screenshot or photo of the product.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        id="product-image-input"
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          role="button"
          aria-label="Upload product image"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`group cursor-pointer relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            isDragging
              ? "border-blue-500 bg-blue-50/70"
              : displayError
              ? "border-rose-300 bg-rose-50/30"
              : "border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-400"
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
              <PhotoIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                <span className="text-blue-600 hover:underline font-bold">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">
                JPG, PNG, WEBP (Max {MAX_FILE_SIZE_MB}MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="mt-1 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          id="upload-preview-container"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300 shadow-xs">
              <Image
                src={previewUrl}
                alt="Product preview"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute bottom-1 right-1 bg-white/90 rounded px-1 py-0.5 shadow-xs flex items-center justify-center">
                <CheckIcon className="w-3 h-3 text-emerald-600" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-slate-900 truncate">
                  {imageFile?.name || "Uploaded Product Photo"}
                </p>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                  {imageFile
                    ? `${(imageFile.size / (1024 * 1024)).toFixed(1)} MB`
                    : "Ready"}
                </span>
              </div>
              <span className="text-xs text-emerald-700 flex items-center gap-1 mt-0.5 font-medium">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                Image ready for search
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer border border-slate-200"
              type="button"
            >
              <RefreshIcon className="w-3.5 h-3.5 text-slate-600" />
              Replace
            </button>
            <button
              onClick={handleRemoveImage}
              className="px-3 py-1.5 rounded-lg bg-white text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors shadow-xs flex items-center gap-1 cursor-pointer border border-rose-200"
              type="button"
            >
              <TrashIcon className="w-3.5 h-3.5 text-rose-600" />
              Remove
            </button>
          </div>
        </div>
      )}

      {displayError && (
        <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold mt-1">
          <AlertCircleIcon className="w-4 h-4 text-rose-600" />
          {displayError}
        </p>
      )}
    </div>
  );
}
