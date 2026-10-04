import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: "BeforePay - Consumer Verification & Seller Dossier",
  description:
    "An AI-powered public evidence investigation tool for Instagram sellers and product listings. Examine profiles, reverse-search images, compare prices, and inspect public reviews before making a payment.",
  keywords: [
    "BeforePay",
    "Instagram seller verification",
    "Instagram scam checker",
    "reverse image search",
    "price comparison",
    "consumer protection",
    "merchant forensics",
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "BeforePay - Consumer Verification & Seller Dossier",
    description:
      "Verify Instagram sellers, reverse-search product photos, compare prices on verified stores, and scan dispute forums before paying.",
    siteName: "BeforePay",
    images: [
      {
        url: "/brand/logo.svg",
        width: 220,
        height: 48,
        alt: "BeforePay Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f9ff] text-[#0b1c30] selection:bg-[#dae2fd] selection:text-[#004ac6] font-sans">
        {children}
      </body>
    </html>
  );
}
