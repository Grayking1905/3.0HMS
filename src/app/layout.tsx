import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as Geist is not standard
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import { SOSButton } from '@/components/emergency/sos-button'; // Import SOSButton

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' }); // Use Inter

export const metadata: Metadata = {
  title: 'CureNova',
  description: 'Innovation and high-quality care by Firebase Studio',
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
          {/* Added animation class */}
          <main className="flex-grow p-4 md:p-8 animate-fadeIn">
              {children}
          </main>
          <SOSButton /> {/* Add SOS Button here, it will position itself */}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
