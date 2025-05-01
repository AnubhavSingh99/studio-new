import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter instead of Geist for wider compatibility
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgriTrace - Blockchain Agriculture Management',
  description: 'Trace your produce from farm to table with AgriTrace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
