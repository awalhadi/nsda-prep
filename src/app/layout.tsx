import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Console // Web Design L-3 Prep",
  description:
    "Interactive practice console for NSDA Web Design Level-3 (ASSET) — HTML, CSS, JavaScript, jQuery, Bootstrap, UX & color theory. Track your accuracy, drill weak spots, build exam readiness.",
};

export const viewport: Viewport = {
  themeColor: "#0d0f14",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
