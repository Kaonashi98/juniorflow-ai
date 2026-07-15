import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AccessProvider, LanguageProvider } from "@/components/app-providers";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JuniorFlow AI — Your first job, before the first job",
    template: "%s | JuniorFlow AI",
  },
  description: "Practice realistic junior developer tickets and get educational AI code reviews.",
  openGraph: {
    title: "JuniorFlow AI — Your first job, before the first job",
    description: "Practice realistic junior developer tickets and get educational AI code reviews.",
    type: "website",
    images: [{ url: "/branding/juniorflow-ai-brand.png", width: 1536, height: 1024, alt: "JuniorFlow AI brand" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JuniorFlow AI — Your first job, before the first job",
    description: "Practice realistic junior developer tickets and get educational AI code reviews.",
    images: ["/branding/juniorflow-ai-brand.png"],
  },
  icons: { icon: "/branding/juniorflow-ai-brand.png", apple: "/branding/juniorflow-ai-brand.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <AccessProvider>
            <Header />
            <div className="flex flex-1 flex-col">{children}</div>
            <Footer />
          </AccessProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}