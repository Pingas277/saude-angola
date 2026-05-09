import type { Metadata } from "next";
import "./globals.css";
import AngolanAccent from "./_brand/AngolanAccent";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://saude-angola.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Saúde Angola — Saúde digital para todos os angolanos",
    template: "%s · Saúde Angola",
  },
  description:
    "Telemedicina, receitas digitais e gestão clínica numa só plataforma. Para pacientes em Luanda ou no interior, e para clínicas que querem deixar o papel para trás.",
  applicationName: "Saúde Angola",
  authors: [{ name: "Saúde Angola" }],
  keywords: [
    "saúde",
    "angola",
    "telemedicina",
    "clínica",
    "consulta médica",
    "receita digital",
    "Luanda",
    "Multicaixa Express",
  ],
  openGraph: {
    type: "website",
    locale: "pt_AO",
    url: SITE_URL,
    title: "Saúde Angola — Saúde digital para todos os angolanos",
    description:
      "Telemedicina, receitas digitais e gestão clínica numa só plataforma.",
    siteName: "Saúde Angola",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saúde Angola",
    description:
      "Telemedicina, receitas digitais e gestão clínica numa só plataforma.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-AO" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen antialiased">
        <AngolanAccent />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
