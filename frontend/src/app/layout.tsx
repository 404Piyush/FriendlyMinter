import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter_Tight({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jbMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0a07",
};

export const metadata: Metadata = {
  title: {
    default: "FriendlyMinter — Compressed NFT Minting on Solana",
    template: "%s — FriendlyMinter",
  },
  description:
    "Mint thousands of compressed NFTs on Solana at ~99% lower cost. Bulk upload, live cost estimation, and job-queue minting — wrapped in a wallet-first dark UI.",
  keywords: [
    "Solana",
    "cNFT",
    "compressed NFT",
    "minting",
    "blockchain",
    "NFT collection",
    "Metaplex",
    "Bubblegum",
    "Merkle tree",
    "web3",
    "devnet",
  ],
  authors: [{ name: "Piyush (@404Piyush)" }],
  creator: "Piyush",
  applicationName: "FriendlyMinter",
  openGraph: {
    title: "FriendlyMinter — Compressed NFT Minting on Solana",
    description:
      "Batch mint compressed NFTs on Solana. ~99% cheaper than traditional mints.",
    type: "website",
    siteName: "FriendlyMinter",
  },
  twitter: {
    card: "summary_large_image",
    title: "FriendlyMinter",
    description: "Compressed NFT minting on Solana.",
  },
  icons: {
    icon: "/favicon.ico",
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
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${jbMono.variable}`}
    >
      <body>
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
