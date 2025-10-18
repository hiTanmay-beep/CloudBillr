// Update your app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./navbar/Navbar";
import Footer from "./footer/Footer";

export const metadata: Metadata = {
  title: "CloudBillr",
  description: "Simple and powerful billing software",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}