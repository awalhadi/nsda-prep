import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/app/AppShell";

export const metadata: Metadata = {
  title: { default: "প্রস্তুতি · NSDA Study", template: "%s · প্রস্তুতি" },
  applicationName: "প্রস্তুতি",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "প্রস্তুতি" },
  icons: { icon: "/icons/study-192.png", apple: "/icons/apple-touch-icon.png" },
  description:
    "NSDA CBT&A Level 4 এবং Web Design Level 3: বাংলা সহায়তা, প্রশ্নচর্চা, রিভিশন ও ব্যক্তিগত শেখার অগ্রগতি।",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
