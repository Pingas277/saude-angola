import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "./_theme/ThemeProvider";
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
    default: "ANGOLASAUDE — Marque com qualquer médico, em qualquer clínica",
    template: "%s · ANGOLASAUDE",
  },
  description:
    "A primeira plataforma que junta médicos e clínicas privadas em Angola num só sítio. Procure por especialidade, escolha o profissional e marque online — sem telefonemas.",
  applicationName: "ANGOLASAUDE",
  authors: [{ name: "ANGOLASAUDE" }],
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
    title: "ANGOLASAUDE — Marque com qualquer médico, em qualquer clínica",
    description:
      "A primeira plataforma que junta médicos e clínicas privadas em Angola num só sítio.",
    siteName: "ANGOLASAUDE",
  },
  twitter: {
    card: "summary_large_image",
    title: "ANGOLASAUDE — Marque com qualquer médico, em qualquer clínica",
    description:
      "A primeira plataforma que junta médicos e clínicas privadas em Angola num só sítio.",
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
    <html
      lang="pt-AO"
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
