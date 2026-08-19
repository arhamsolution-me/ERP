import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

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
    <html lang="en" className="font-sans antialiased">
      <body className="antialiased bg-gray-50 text-slate-900 font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
