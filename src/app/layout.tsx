import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { cn } from "@/lib/utils";
import { AdBanner } from "@/components/ad-banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameHub",
  description: "A fun and engaging game hub for all!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 text-foreground antialiased"
        )}
      >
        <AdBanner />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">
              <div className="container mx-auto p-4">{children}</div>
            </div>
            <Footer />
          </div>
          <Toaster />
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
