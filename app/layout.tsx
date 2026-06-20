import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maison Dorée",
  description: "A small house on the Riviera, kept for the unhurried.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&f[]=general-sans-italic@400&f[]=general-serif@400,500,600&display=swap"
        />
      </head>
      <body className="bg-white text-ink font-sans font-semibold">{children}</body>
    </html>
  );
}
