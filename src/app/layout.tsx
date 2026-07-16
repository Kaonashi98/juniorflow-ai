import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AccessProvider, LanguageProvider } from "@/components/app-providers";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { APP_COPY } from "@/lib/app-copy";
import { requestLocale } from "@/lib/request-locale.server";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale();
  const copy = APP_COPY[locale].common;

  return {
    metadataBase: new URL(siteUrl),
    applicationName: "JuniorFlow AI",
    category: "education",
    title: {
      default: copy.titles.home,
      template: "%s | JuniorFlow AI",
    },
    description: copy.descriptions.home,
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: copy.titles.home,
      description: copy.descriptions.home,
      type: "website",
      locale: locale === "it" ? "it_IT" : "en_US",
      alternateLocale: locale === "it" ? ["en_US"] : ["it_IT"],
      images: [{
        url: "/branding/juniorflow-ai-brand.png",
        width: 1536,
        height: 1024,
        alt: copy.logoAlt,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.titles.home,
      description: copy.descriptions.home,
      images: ["/branding/juniorflow-ai-brand.png"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialLocale = await requestLocale();

  return (
    <html lang={initialLocale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <LanguageProvider initialLocale={initialLocale}>
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
