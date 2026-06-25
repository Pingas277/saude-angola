import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "./_theme/ThemeProvider";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lunga-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lunga — Marque com qualquer médico, em qualquer clínica",
    template: "%s · Lunga",
  },
  description:
    "Marcação, triagem com IA, receitas digitais, exames e contas de família — tudo num só sítio. A primeira plataforma de saúde digital de Angola.",
  applicationName: "Lunga",
  authors: [{ name: "Lunga" }],
  keywords: [
    "saúde",
    "angola",
    "telemedicina",
    "triagem com IA",
    "clínica",
    "consulta médica",
    "receita digital",
    "exames laboratoriais",
    "conta de família",
    "dependentes",
    "passaporte de saúde",
    "Luanda",
    "Multicaixa Express",
  ],
  openGraph: {
    type: "website",
    locale: "pt_AO",
    url: SITE_URL,
    title: "Lunga — Marque com qualquer médico, em qualquer clínica",
    description:
      "A primeira plataforma que junta médicos e clínicas privadas em Angola num só sítio.",
    siteName: "Lunga",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lunga — Marque com qualquer médico, em qualquer clínica",
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
  // Tells iOS Safari to render the page as a fullscreen 'web app' when the
  // user adds Lunga to the home screen. Status bar matches the brand bg.
  appleWebApp: {
    capable: true,
    title: "Lunga",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // viewport-fit=cover lets the layout extend under the iPhone notch + home
  // indicator. We then opt content back in with env(safe-area-inset-*) in
  // globals.css so nothing important sits under the notch.
  viewportFit: "cover",
  // Browser chrome / address bar follows the brand sky/emerald gradient,
  // matched to light + dark themes.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
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
          <Toaster position="top-center" richColors closeButton />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
