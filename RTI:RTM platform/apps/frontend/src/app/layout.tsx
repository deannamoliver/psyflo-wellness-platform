import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/lib/core-ui/sonner";
import { DataRevalidator } from "@/lib/data-revalidator";
import ProgressProvider from "./~lib/progress-provider";

const urbanist = localFont({
  src: [
    {
      path: "../../../../node_modules/@fontsource-variable/urbanist/files/urbanist-latin-wght-normal.woff2",
      style: "normal",
    },
    {
      path: "../../../../node_modules/@fontsource-variable/urbanist/files/urbanist-latin-wght-italic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-urbanist",
  weight: "100 900",
});

const dmSans = localFont({
  src: [
    {
      path: "../../../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2",
      style: "normal",
    },
    {
      path: "../../../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-italic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-dm-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "feelwell",
  description: "Manage stress, school, and your day",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${urbanist.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <ProgressProvider>
          <NuqsAdapter>
            <DataRevalidator />
            {children}
          </NuqsAdapter>
        </ProgressProvider>
        <Toaster position="top-center" richColors className="mt-7" />
      </body>
    </html>
  );
}
