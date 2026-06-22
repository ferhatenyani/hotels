import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Hôtel du Lac Béjaïa — Le Calme au Centre Ville",
  description:
    "A calm, modern hotel in the heart of Béjaïa, on Lac Mézaïa facing Gouraya — lake-view rooms, a gastronomic restaurant and a 498 m² events hall.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans" suppressHydrationWarning>
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
