import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { cn } from "@/lib/utils";
import { AdBanner } from "@/components/ad-banner";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameTap - A Fun and Engaging Game Hub",
  description:
    "Discover and play a wide variety of games on GameTap, your ultimate game hub for endless entertainment and fun!",
  keywords: "games, online games, game hub, GameTap",
  openGraph: {
    title: "GameTap - Your Ultimate Game Hub",
    description:
      "Discover and play a wide variety of games on GameTap, your ultimate game hub for endless entertainment and fun!",
    type: "website",
    url: "https://gametap.app",
    images: [
      {
        url: "https://gametap.app/og-image.webp",
        width: 1200,
        height: 630,
        alt: "GameTap - Your Ultimate Game Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GameTap - Your Ultimate Game Hub",
    description:
      "Discover and play a wide variety of games on GameTap, your ultimate game hub for endless entertainment and fun!",
    images: ["https://gametap.app/twitter-image.webp"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="u0KlgPw9q41vHMaQZWHa_FZAizIQWzd003LqHLKaf4k"
        />
      </head>
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background text-foreground antialiased"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <AdBanner />
            <Header />
            <div className="flex-1">
              <div className="container mx-auto p-4">{children}</div>
            </div>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <link rel="canonical" href="https://gametap.app" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "GameTap",
            url: "https://gametap.app",
            description: "A fun and engaging game hub for all!",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://gametap.app/search?q={search_term_string}", // Replace with your actual search URL
              "query-input": "required name=search_term_string",
            },
          })}
        </script>
      </body>
    </html>
  );
}
