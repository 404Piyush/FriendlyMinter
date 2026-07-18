import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geist = Geist({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e8e1d4",
};

export const metadata: Metadata = {
  title: {
    default: "FriendlyMinter — Compressed NFT Minting on Solana",
    template: "%s — FriendlyMinter",
  },
  description:
    "Mint thousands of compressed NFTs on Solana at ~99% lower cost. Bulk upload, live cost estimation, and job-queue minting.",
  keywords: [
    "Solana",
    "cNFT",
    "compressed NFT",
    "minting",
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
    description: "Batch mint compressed NFTs on Solana.",
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
      className={`${geist.variable} ${geistMono.variable}`}
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
