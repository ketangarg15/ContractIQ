import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { ContractProvider } from "@/context/ContractContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContractIQ - AI-Powered Legal Contract Intelligence",
  description: "Understand every clause in seconds with AI precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans text-slate-800 bg-zinc-50" suppressHydrationWarning>
        <ContractProvider>
          <AppLayout>{children}</AppLayout>
        </ContractProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
