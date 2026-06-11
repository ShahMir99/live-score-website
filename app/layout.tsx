import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Live Cricket Scores | Ball-by-Ball Updates & Match Stats",
  description:
    "Get real-time cricket scores, ball-by-ball commentary, match schedules, and detailed stats. Follow live international and league cricket matches instantly.",
  keywords: [
    "live cricket scores",
    "cricket scorecard",
    "ball by ball commentary",
    "IPL live scores",
    "T20 live match",
    "cricket updates",
    "match highlights",
  ],
  authors: [{ name: "Shah Mir" }],
  creator: "Shah Mir",

  openGraph: {
    title: "Live Cricket Scores | Real-Time Match Updates",
    description:
      "Follow live cricket matches with real-time scores, stats, and ball-by-ball updates for international and league games.",
    type: "website",
    siteName: "Live Cricket Score App",
  },

  twitter: {
    card: "summary_large_image",
    title: "Live Cricket Scores | Real-Time Updates",
    description:
      "Stay updated with live cricket scores, commentary, and match stats in real time.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body cz-shortcut-listen="true" className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
