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
  title: "BeforePay — Consumer Verification & Seller Dossier",
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
