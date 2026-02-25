import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "ZeroMarket — WASM Skill Registry", template: "%s · ZeroMarket" },
  description: "The official registry for ZeroClaw WASM skills. Browse, install, and publish tool packages for your autonomous agent.",
  keywords: ["zeroclaw", "wasm", "skills", "agent", "tools", "registry"],
  openGraph: {
    siteName: "ZeroMarket",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#080808] text-[#f0f0f0] min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
