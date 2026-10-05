import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Layover — a shelf for your files, right on your Mac",
  description:
    "Park files mid-move, then drop, move or AirDrop them. Searchable clipboard history included.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
