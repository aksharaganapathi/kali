import type { Metadata } from "next";
import { Inter, Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const notoSansKannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-kannada",
});

export const metadata: Metadata = {
  title: "Kali — ಕಲಿ | Learn Kannada Script",
  description:
    "A premium, minimalist app for deciphering Kannada script through visual pattern recognition and scaffolded decoding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kn">
      <body
        className={`${inter.variable} ${notoSansKannada.variable} antialiased w-full h-full min-h-screen overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
