import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupplyScout — Find Any Brand's Suppliers Instantly",
  description: "Paste any brand URL. Get verified supplier data from real Bill of Lading shipping records — names, countries, shipment volumes, HS codes — in seconds.",
  keywords: "supplier discovery, bill of lading, import records, brand suppliers, supply chain intelligence, e-commerce sourcing",
  openGraph: {
    title: "SupplyScout — Find Any Brand's Suppliers Instantly",
    description: "Paste a brand URL. Get verified supplier data from real shipping records in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
