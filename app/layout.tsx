import type { Metadata } from "next";
import { Public_Sans, Libre_Baskerville } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Australian AI Safety Forum 2026",
  description: "Join leading researchers, policymakers, and industry experts for two days of rigorous dialogue on the future of AI safety in Australia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${publicSans.variable} ${libreBaskerville.variable} antialiased font-[--font-public-sans]`}
      >
        {children}
      </body>
    </html>
  );
}
