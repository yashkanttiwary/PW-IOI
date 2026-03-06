import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'ION by PW IOI',
  description: 'Marketing Command Center',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="font-sans bg-[#050505] text-white">{children}</body>
    </html>
  );
}
