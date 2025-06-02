import "./globals.css";
import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "AIESEMAR - ASMR Video Player",
  description: "AIESEMAR - ASMR Video Player with Bass Boost and Theme Switcher",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AIESEMAR - ASMR Video Player</title>
        <meta name="description" content="AIESEMAR - ASMR Video Player with Bass Boost and Theme Switcher" />
      </head>
      <body className={inter.className + " bg-background text-foreground min-h-screen"}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
