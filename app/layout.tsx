import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SecureAuth SOC Lab",
  description:
    "Interactive SOC authentication monitoring lab with brute force detection and real-time alerts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          margin: 0,
          backgroundColor: "#000",
          color: "white",
          fontFamily: "var(--font-geist-sans)",
          minHeight: "100vh",
        }}
      >
        {children}

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#111827",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "10px",
              padding: "12px 16px",
            },
            success: {
              style: {
                border: "1px solid #16a34a",
              },
            },
            error: {
              style: {
                border: "1px solid #dc2626",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
