import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sheen Payment",
  description: "Sheen payment gateway for sheen clients and sheen employees",
  icons: {
    icon: "https://agency.sheen.af/logo.png",
    shortcut: "https://agency.sheen.af/logo.png",
    apple: "https://agency.sheen.af/logo.png",
  },
  openGraph: {
    title: "Sheen Payment",
    description: "Sheen payment gateway for sheen clients and sheen employees",
    images: [
      {
        url: "https://agency.sheen.af/logo.png",
        width: 800,
        height: 800,
        alt: "Sheen Payment Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Sheen Payment",
    description: "Sheen payment gateway for sheen clients and sheen employees",
    images: ["https://agency.sheen.af/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50" suppressHydrationWarning>{children}</body>
    </html>
  );
}
