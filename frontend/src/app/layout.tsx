import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora-var",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter-var",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Edmarg — AI-Powered Career Mentorship Platform",
  description: "Find clarity and confidence through AI-driven assessments and expert mentorship. Your guide to the right career path.",
  keywords: "career mentorship, AI career guidance, career assessment, mentor platform, career clarity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0F19] text-[#E2E8F0] font-inter">{children}</body>
    </html>
  );
}
