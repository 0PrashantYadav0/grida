import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ToasterWithMax } from "@/components/toaster";

import "../editor.css";

const inter = Inter({ subsets: ["latin"] });
// const inconsolata = Inconsolata({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Grida",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ToasterWithMax position="bottom-center" max={5} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
