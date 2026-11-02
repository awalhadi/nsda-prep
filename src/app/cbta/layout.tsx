import type { Viewport } from "next";
import { Hind_Siliguri, Plus_Jakarta_Sans } from "next/font/google";
import CbtaHeader from "@/components/cbta/CbtaHeader";
import SwRegistrar from "@/components/cbta/SwRegistrar";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--cbta-sans", display: "swap" });
const bangla = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--cbta-bangla", display: "swap" });

export const viewport: Viewport = { themeColor: "#f7f6f2" };

export default function CbtaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`cbta-root ${sans.variable} ${bangla.variable}`}>
      <CbtaHeader />
      {children}
      <SwRegistrar />
    </div>
  );
}
