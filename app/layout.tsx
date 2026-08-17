import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MainYuk — Belajar Jadi Lebih Seru Sambil Bermain!",
  description: "Belajar Jadi Lebih Seru Sambil Bermain! Platform edukatif interaktif dengan kuis, game edukasi, dan modul belajar untuk anak-anak.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "MainYuk — Belajar Jadi Lebih Seru Sambil Bermain!",
    description: "Platform edukatif interaktif dengan kuis, game edukasi, dan modul belajar untuk anak-anak.",
    siteName: "MainYuk",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", geistSans.variable)} suppressHydrationWarning>
      <head>
        <script src="https://unpkg.com/@phosphor-icons/web" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
