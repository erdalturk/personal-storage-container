import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kişisel Depo — Kişisel Dijital Arşiv Sistemi",
  description: "Tüm anılarınızı, notlarınızı, filmlerinizi ve projelerinizi tek merkezde düzenleyin.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kişisel Depo",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-slate-50 dark:bg-slate-950`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('personal_container_theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);var root=document.documentElement;if(d){root.classList.add('dark');root.setAttribute('data-theme','dark');root.style.colorScheme='dark';}else{root.classList.remove('dark');root.setAttribute('data-theme','light');root.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          {children}
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}

