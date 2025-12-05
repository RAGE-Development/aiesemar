import "./globals.css";
import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Crimson_Pro, DM_Sans, JetBrains_Mono } from "next/font/google";

// Elegant serif for display text - evokes calm, sophistication
const crimson = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Clean, modern sans-serif for body text
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Monospace for time displays and technical info
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata = {
  title: "AIESEMAR - Ethereal ASMR Experience",
  description: "Immersive ASMR video player with bass boost, ambient controls, and a calming interface designed for relaxation.",
  keywords: ["ASMR", "video player", "relaxation", "bass boost", "ambient"],
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`
          ${crimson.variable}
          ${dmSans.variable}
          ${jetbrains.variable}
          font-sans
          bg-background
          text-foreground
          min-h-screen
          antialiased
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
