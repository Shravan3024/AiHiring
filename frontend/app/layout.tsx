import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",   // show system font first, swap to Inter when loaded
  preload: false,    // disable preload link to avoid blocking initial paint
});

export const metadata: Metadata = {
  title: "AI Recruitment Platform",
  description: "End-to-end AI-powered recruitment management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
