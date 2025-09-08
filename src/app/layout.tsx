import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ST. JOSEPH’S CENTRAL ACADEMY - SIRONOI",
  description: "A GOOD ACADEMIC FOUNDATION FOR A BRIGHTER FUTURE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-garamond antialiased">
        {children}
      </body>
    </html>
  );
}
