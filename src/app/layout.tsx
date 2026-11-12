import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "act.design — Instruments for the interface",
  description: "A small set of tactile React components with weight, travel and detents. Built with Tailwind CSS and Motion.",
};

// Runs before paint so there is no flash of the wrong theme or accent. Also keeps
// block iframes in sync: they hear the `storage` event when the parent changes either.
const themeScript = `(function(){var d=document.documentElement,A={cobalt:'oklch(0.56 0.2 262)',moss:'oklch(0.6 0.13 138)',violet:'oklch(0.58 0.2 300)'};function a(){var t=null,c=null;try{t=localStorage.getItem('theme');c=localStorage.getItem('accent')}catch(e){}d.classList.toggle('dark',t==='dark');if(A[c])d.style.setProperty('--signal',A[c]);else d.style.removeProperty('--signal')}a();addEventListener('storage',function(e){if(e.key==='theme'||e.key==='accent')a()})})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-canvas font-sans text-base-200">{children}</body>
    </html>
  );
}
