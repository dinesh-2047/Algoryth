import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Algoryth",
  description: "Practice coding problems and prepare for contests.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-[#f8f3e6] dark:bg-[#18131f]">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#f8f3e6] text-[#2b2116] antialiased transition-colors duration-300 dark:bg-[#18131f] dark:text-[#f6ede0]`}
      >
        <AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const storedTheme = localStorage.getItem('theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        <Navbar />
        <nav>
          <Link href="/">Home</Link>
          <Link href="/heatmap">Heatmap</Link>
        </nav>
        <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>

        <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
