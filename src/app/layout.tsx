import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tasteful UI — Premium React components and blocks",
  description: "Crafted React, Tailwind CSS and Motion components and landing blocks. Preview live and copy into any app.",
};

// Runs before paint so there is no flash of the wrong theme. Also keeps
// block iframes in sync: they hear the `storage` event when the parent toggles.
const themeScript = `(function(){var d=document.documentElement;function a(){var t=null;try{t=localStorage.getItem('theme')}catch(e){}d.classList.toggle('dark',t!=='light')}a();addEventListener('storage',function(e){if(e.key==='theme')a()})})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-canvas font-sans text-base-200">{children}</body>
    </html>
  );
}
