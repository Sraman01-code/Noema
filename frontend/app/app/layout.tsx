import "./globals.css";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Noema — Premium Marketplace",
  description: "Discover and trade premium products on Noema",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Orbitron:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#09090b] text-[#f0f0f3] min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
