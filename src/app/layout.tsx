import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "act.design — Components for the interface",
  description: "A small set of tactile React components with weight, travel and detents. Built with Tailwind CSS and Motion.",
};

// Runs before paint so there is no flash of the wrong theme. Also keeps block
// iframes in sync: they hear the `storage` event when the parent changes it.
const themeScript = `(function(){var d=document.documentElement;function a(){var t=null;try{t=localStorage.getItem('theme')}catch(e){}d.classList.toggle('dark',t!=='light')}a();addEventListener('storage',function(e){if(e.key==='theme')a()})})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-white dark:bg-black font-sans text-neutral-800 dark:text-neutral-200">{children}</body>
    </html>
  );
}
