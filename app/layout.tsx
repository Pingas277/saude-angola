import type { Metadata } from "next";
import "./globals.css";
import AngolanAccent from "./_brand/AngolanAccent";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "Saúde Angola",
    template: "%s · Saúde Angola",
  },
  description:
    "Plataforma digital de saúde para Angola — gestão clínica e telemedicina.",
  applicationName: "Saúde Angola",
  authors: [{ name: "Saúde Angola" }],
  keywords: [
    "saúde",
    "angola",
    "telemedicina",
    "clínica",
    "consulta",
    "Luanda",
  ],
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
      </body>
    </html>
  );
}
