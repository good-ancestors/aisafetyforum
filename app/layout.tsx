import { Libre_Baskerville, Public_Sans } from "next/font/google";
import { eventConfig, siteConfig } from "@/lib/config";
import type { Metadata } from "next";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
  display: "swap",
});

const siteTitle = `Australian AI Safety Forum ${eventConfig.year}`;
const siteDescription = "Join leading researchers, policymakers, and industry experts for two days of rigorous dialogue on the future of AI safety in Australia.";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  keywords: [
    "AI safety",
    "artificial intelligence",
    "AI governance",
    "AI policy",
    "Australia",
    "AI research",
    "AI risk",
    "machine learning safety",
    "Sydney",
    "conference",
  ],
  authors: [{ name: "Gradient Institute", url: "https://www.gradientinstitute.org" }],
  creator: "Gradient Institute",
  publisher: "Gradient Institute",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: siteConfig.url,
    siteName: siteTitle,
    title: siteTitle,
    description: `${eventConfig.datesLong} in Sydney. ${siteDescription}`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: `${eventConfig.datesLong} in Sydney. ${siteDescription}`,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${publicSans.variable} ${libreBaskerville.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
