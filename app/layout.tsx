import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  // metadataBase resolves relative OG / twitter image URLs across the site.
  // Production should override via NEXT_PUBLIC_SITE_URL; localhost keeps dev quiet.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Notre Hôtel — Le Calme au Cœur de la Ville",
  description:
    "Un hôtel moderne et calme au cœur de la ville — chambres avec vue, restaurant gastronomique et salle de réception de 498 m².",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="font-sans" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&f[]=erode@400,500,600,700&display=swap"
        />
      </head>
      <body className="bg-white text-ink font-sans font-semibold" suppressHydrationWarning>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
