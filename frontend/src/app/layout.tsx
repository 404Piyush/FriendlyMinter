import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WalletProvider } from '@/components/wallet/WalletProvider';
import { Toaster } from '@/components/ui/sonner';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: {
    default: "FriendlyMinter - Compressed NFT Minting on Solana",
    template: "%s | FriendlyMinter",
  },
  description:
    "Create and mint compressed NFTs (cNFTs) on Solana at a fraction of the cost. Batch mint thousands of NFTs with bulk upload, real-time progress tracking, and Merkle tree management.",
  keywords: [
    "Solana",
    "cNFT",
    "compressed NFT",
    "minting",
    "blockchain",
    "NFT collection",
    "Metaplex",
    "bubblegum",
    "Merkle tree",
    "web3",
  ],
  authors: [{ name: "Piyush (@404Piyush)" }],
  creator: "Piyush",
  applicationName: "FriendlyMinter",
  openGraph: {
    title: "FriendlyMinter - Compressed NFT Minting on Solana",
    description:
      "Batch mint thousands of compressed NFTs on Solana. Cost-efficient, fast, and developer-friendly.",
    type: "website",
    siteName: "FriendlyMinter",
  },
  twitter: {
    card: "summary_large_image",
    title: "FriendlyMinter - Compressed NFT Minting",
    description: "Batch mint thousands of compressed NFTs on Solana.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
