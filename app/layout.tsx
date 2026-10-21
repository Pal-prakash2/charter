import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Charter — OAuth, from setup to launch",
  description: "Source-backed OAuth launch guides for developers and coding agents. Find your path, understand the gates, and know what to do next.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head><link rel="alternate" type="text/markdown" href="/index.md" /><link rel="describedby" href="/llms.txt" /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
