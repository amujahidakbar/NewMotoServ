import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MotoServ - Asisten Perawatan Motor & Pengingat Servis Pintar",
  description: "Aplikasi asisten perawatan motor & pengingat ganti oli pintar. Pantau kondisi oli mesin, oli gardan, belt, dan rantai secara real-time berdasarkan jarak tempuh odometer dengan backup MySQL Cloud.",
  keywords: ["pengingat servis motor", "rawat motor", "ganti oli motor", "odometer motor", "service reminder", "motoserv", "perawatan motor matic", "perawatan motor bebek"],
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
    title: "MotoServ - Asisten Cerdas Perawatan Motor",
    description: "Aplikasi pengingat servis motor pintar secara real-time berdasarkan jarak tempuh odometer.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
