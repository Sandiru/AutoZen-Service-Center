
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as a common sans-serif font
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnnouncementProvider } from "@/contexts/AnnouncementContext"; // Import AnnouncementProvider
import { AnnouncementBar } from "@/components/layout/AnnouncementBar"; // Import AnnouncementBar
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider"; // Import ThemeProvider

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AutoZen Services",
  description: "Comprehensive Automobile Service Center System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="light" // Explicitly set default to light
            // Remove enableSystem to disable system preference
            disableTransitionOnChange
        >
          {/* Rainbow Background Elements */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={`rainbow-${i + 1}`} className={`rainbow rainbow-${i + 1}`}></div>
          ))}
          <div className="h-fade"></div>
          <div className="v-fade"></div>

          <AuthProvider>
            <AnnouncementProvider> {/* Wrap with AnnouncementProvider */}
              <div className="flex flex-col min-h-screen relative z-10"> {/* Ensure content is above background */}
                <Header />
                <AnnouncementBar /> {/* Render AnnouncementBar here */}
                <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </AnnouncementProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
