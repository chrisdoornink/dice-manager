import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { ThemeProvider } from "./contexts/ThemeContext";
// import ThemeToggle from "./components/ThemeToggle";
// import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dice Manager",
  description: "A simple and effective dice rolling manager for tabletop games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: "var(--background-color)" }}>
      <body className={inter.className}>
        <GoogleAnalytics />
        <ThemeProvider>
          {children}
          {/* <ThemeToggle /> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
