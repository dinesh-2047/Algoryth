import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Algoryth",
  description: "Coding platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
