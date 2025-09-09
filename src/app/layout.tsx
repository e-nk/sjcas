import type { Metadata } from "next";
import SessionProvider from '@/components/providers/SessionProvider'
import "./globals.css";

export const metadata: Metadata = {
  title: "ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI",
  description: "Fee Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-garamond antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}