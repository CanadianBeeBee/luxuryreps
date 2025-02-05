import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"

const geistSans = localFont({
  src: "./fonts/GeistSans.woff2",
  variable: "--font-geist-sans",
})

const geistMono = localFont({
  src: "./fonts/GeistMono.woff2",
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "X-Rep - Premium Clothing Store",
  description: "Discover exclusive deals on top brands at X-Rep",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={geistSans.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

