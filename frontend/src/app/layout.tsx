import type { Metadata } from "next";
import { Khand } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Primary display font — Devanagari headings
const khand = Khand({
  variable: "--font-khand",
  subsets: ["latin", "devanagari"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "साहित्याच्या पुणेरी पाट्या",
  description: "Pune's Marathi Literary Map — discover quotes, stories and authors across 47 iconic city locations.",
  openGraph: {
    title: "साहित्याच्या पुणेरी पाट्या",
    description: "A cultural map of Pune's Marathi literary landscape.",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mr" className="scroll-smooth">
      <head>
        {/* Google Fonts — Tiro Devanagari Marathi + Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Marathi:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${khand.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
