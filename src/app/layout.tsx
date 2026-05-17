import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SMTC - Sri Murugan Tuition Center | Palani",
  description: "Sri Murugan Tuition Center (SMTC) - Palani's premier institution for NEET, JEE & Board exam coaching. 25+ years of academic excellence with 98% pass rate. Learn • Grow • Success",
  keywords: "SMTC, Sri Murugan Tuition Center, Palani, NEET coaching, JEE coaching, tuition center, Tamil Nadu, Board exam coaching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
