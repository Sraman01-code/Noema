import "./globals.css";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Product Listing",
  description: "Automated product listing system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white min-h-screen flex flex-col">
        <AuthProvider>
          <NavBar />
          {/* Pages control their own layout */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
