import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

import Providers from "./providers";

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
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
    <html lang="en" className={`${inter.variable} font-sans antialiased`} style={{ fontFamily: "'Inter', 'Work Sans', sans-serif" }}>
      <body className={`${inter.className} antialiased bg-gray-50 text-slate-900`} style={{ fontFamily: "'Inter', 'Work Sans', sans-serif" }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
