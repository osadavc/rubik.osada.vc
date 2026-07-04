import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Learn to solve the Rubik's Cube",
    template: "%s | rubik.osada.vc",
  },
  description:
    "Interactive Rubik's Cube guides with a 3D cube you can turn, scrub, and practice on.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${geistMono.variable} h-full bg-[var(--background)] text-[var(--foreground)] antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
