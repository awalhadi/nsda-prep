import { Hind_Siliguri, Inter, Space_Grotesk } from "next/font/google";

const sans = Inter({ subsets: ["latin"], variable: "--cbta-sans", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--cbta-display", display: "swap" });
const bangla = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--cbta-bangla", display: "swap" });

export default function CbtaLayout({ children }: { children: React.ReactNode }) {
  return <div className={`cbta-root ${sans.variable} ${display.variable} ${bangla.variable}`}>{children}</div>;
}
