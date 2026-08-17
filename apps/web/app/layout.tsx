import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

import Providers from "./providers";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "NexERP - Global Textile-to-Retail Platform",
  description: "Multi-Tenant Enterprise ERP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn("font-sans", inter.variable, inter.className)}>
        <body className={`${inter.className} antialiased bg-gray-50 text-slate-900`}>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
