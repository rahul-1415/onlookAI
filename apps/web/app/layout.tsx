import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

import { AppProviders } from "../src/providers/app-providers";

export const metadata: Metadata = {
  title: "OnlookAI",
  description: "Attention-aware training infrastructure scaffold"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
