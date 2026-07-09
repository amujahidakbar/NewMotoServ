import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MotoServ - Smart Motorcycle Maintenance & Service Reminder",
  description: "Smart motorcycle maintenance assistant and oil change reminder. Track engine oil, gear oil, belt, and chain conditions in real-time based on odometer mileage with cloud backup.",
  keywords: ["motorcycle service reminder", "bike maintenance tracker", "oil change alert", "odometer tracker", "motoserv", "automatic scooter maintenance", "manual bike care"],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "MotoServ - Smart Motorcycle Maintenance Tracker",
    description: "Real-time smart motorcycle service reminder app based on odometer mileage.",
    type: "website",
  }
};

export default function RootLayout({
  children,
  }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
