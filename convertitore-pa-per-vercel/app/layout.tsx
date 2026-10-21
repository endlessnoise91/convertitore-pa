import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Convertitore PA — PDF/A per la burocrazia italiana",
  description:
    "Carica DOCX, PDF o immagini e ottienili in PDF/A ottimizzato per INPS, concorsi pubblici e Agenzia delle Entrate.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${sourceSans.variable} min-h-screen antialiased`}>
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
