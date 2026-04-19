import { Bricolage_Grotesque, Space_Mono } from "next/font/google";
import LayoutWrapper from "../components/LayoutWrapper";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Algoryth",
  description: "Practice coding problems and prepare for contests.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-[#f3f6fb] dark:bg-[#090f1b]">
      <body
        suppressHydrationWarning
        className={`${bricolage.variable} ${spaceMono.variable} min-h-screen bg-[#f3f6fb] text-[#0f172a] antialiased transition-colors duration-300 dark:bg-[#090f1b] dark:text-[#edf2ff]`}
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
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
