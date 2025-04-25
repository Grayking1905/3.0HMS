import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as Geist is not standard
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' }); // Use Inter

export const metadata: Metadata = {
  title: 'HealthChain',
  description: 'A comprehensive healthcare solution by Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <AuthProvider> {/* Wrap with AuthProvider */}
          <Header />
          <main className="flex-grow p-4 md:p-8">{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
