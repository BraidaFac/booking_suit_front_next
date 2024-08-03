import './globals.css';
import { useSideBarState } from '@/lib/utils/SideBarState';
import type { Metadata, Viewport } from 'next';
import LayoutContext from '@/lib/components/LayoutContext';

export const metadata: Metadata = {
  title: 'Casa Sonia',
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ padding: 0, width: '98vw' }}>
      <LayoutContext>{children}</LayoutContext>
    </html>
  );
}
