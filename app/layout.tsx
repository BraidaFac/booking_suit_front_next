'use client';
import './globals.css';
import { SuitContext } from '@/lib/components/SuitContext';
import Nav from '@/lib/components/Nav';
import { NextUIProvider } from '@nextui-org/react';
import { useSideBarState } from '@/lib/utils/SideBarState';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setIsOpen } = useSideBarState();
  return (
    <html lang="en" className="h-full">
      <body
        suppressHydrationWarning={true}
        className="h-full w-full overflow-hidden "
        onClick={(event) => {
          const sideBar = document.getElementById('sidebar');
          const input_sidebar = document.getElementById('input_sidebar');
          const htmlElement = event.target;
          if (htmlElement !== sideBar && htmlElement !== input_sidebar) {
            setIsOpen(false);
          }
        }}
      >
        <NextUIProvider>
          <SuitContext>
            <>
              <Toaster position="top-center" />
              <Nav></Nav>
              {children}
            </>
          </SuitContext>
        </NextUIProvider>
      </body>
    </html>
  );
}
