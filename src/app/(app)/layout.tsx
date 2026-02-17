import { TRPCReactProvider } from "@/trpc/client";
import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const dmSans = DM_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Harvestly",
  description:
    "Harvestly connects farmers and sellers in a modern crop marketplace. Launch your store, source directly, and deliver fresh produce with ease.",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Harvestly",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased`}>
        <NuqsAdapter>
          <TRPCReactProvider>
            {children}
            <Toaster />
          </TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
