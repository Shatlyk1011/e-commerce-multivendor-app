import type { Metadata } from "next";
import "./globals.css";

import "../../public/fonts.css";

export const metadata: Metadata = {
  title: "Medusa Marketplace Storefront",
  description: "Self-hosted multivendor e-commerce storefront",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <body className="antialiased text-apple-lead">{children}</body>
    </html>
  );
}


