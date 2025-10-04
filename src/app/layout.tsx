import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto Bubbles | Live Cryptocurrency Market Visualization",
  description:
    "Instantly visualize the cryptocurrency market with Crypto Bubbles. Track real-time price changes, performance, and market data for Bitcoin, Ethereum, and hundreds of coins in a dynamic bubble chart.",
  openGraph: {
    title: "Crypto Bubbles | Live Cryptocurrency Market Visualization",
    description:
      "An interactive and real-time visualization of the cryptocurrency market.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto Bubbles | Live Cryptocurrency Market Visualization",
    description:
      "An interactive and real-time visualization of the cryptocurrency market.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
