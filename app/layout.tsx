import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A1 Prüfungstrainer",
  description: "Interaktiver Goethe A1 Übungssatz",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
