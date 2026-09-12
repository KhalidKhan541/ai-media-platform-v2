import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "AI Media Platform",
    template: "%s | AI Media Platform",
  },
  description:
    "AI-powered media processing and management platform. Create, enhance, and distribute content with cutting-edge AI tools.",
  keywords: [
    "AI media",
    "video platform",
    "content creation",
    "AI editing",
    "media management",
    "live streaming",
    "podcast",
  ],
  authors: [{ name: "AI Media Platform" }],
  creator: "AI Media Platform",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AI Media Platform",
    title: "AI Media Platform",
    description:
      "AI-powered media processing and management platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Media Platform",
    description:
      "AI-powered media processing and management platform",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-950 text-white antialiased">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
