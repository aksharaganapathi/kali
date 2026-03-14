import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Tiro+Kannada&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased w-full h-full min-h-screen overflow-x-hidden">{children}</body>
    </html>
  );
}
