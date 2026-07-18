import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter_Tight({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
});

const jbMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f5ee",
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
      className={`${inter.variable} ${instrumentSerif.variable} ${jbMono.variable}`}
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
