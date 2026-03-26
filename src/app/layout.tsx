// app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from '@/providers/QueryProvider';
import { Toaster } from "sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | Admin Dashboard',
    default: 'Admin Dashboard',
  },
  description: "Your Gateway to Seamless Payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
        </QueryProvider>
        
        {/* Sonner Toaster - Global untuk semua pages */}
        <Toaster 
          position="top-right"
          theme="dark"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
          }}
        />
      </body>
    </html>
  );
}