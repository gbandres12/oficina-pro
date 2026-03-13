import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

import { Providers } from "@/components/providers";


export const metadata: Metadata = {
  title: "Andres Oficina Pro | ERP Automotivo",
  description: "Sistema de gestão completo para oficinas mecânicas de alta produtividade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
