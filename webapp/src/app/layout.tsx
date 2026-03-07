import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/contexts/GlobalContext";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Budgeting",
  description: "Dê um propósito para cada centavo. Planejador premium de finanças.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-(--color-base-bg) text-(--color-text-main)`}
      >
        <GlobalProvider>
          <AppShell>{children}</AppShell>
        </GlobalProvider>
      </body>
    </html>
  );
}
