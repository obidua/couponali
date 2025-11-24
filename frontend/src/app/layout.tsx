import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "BIDUA Coupons - Save with Coupons, Cashback & Gift Cards",
    template: "%s | BIDUA Coupons",
  },
  description:
    "Save money with verified coupons, earn cashback on every purchase, and buy discounted gift cards from your favorite brands.",
  keywords: [
    "coupons",
    "cashback",
    "gift cards",
    "deals",
    "discounts",
    "offers",
    "promo codes",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
