import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "B2B Marketplace - Connect with Verified Sellers",
  description: "India's largest B2B marketplace for industrial products. Browse products, post RFQs, and connect with verified sellers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <Toaster position="top-right" richColors closeButton />
        {children}
      </body>
    </html>
  );
}