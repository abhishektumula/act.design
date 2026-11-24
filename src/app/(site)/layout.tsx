import { Navbar } from "@/components/site/navbar";
import { GlowField } from "@/components/site/glow-field";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlowField />
      <Navbar />
      {children}
    </>
  );
}
