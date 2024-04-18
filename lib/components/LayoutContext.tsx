'use client';
import { NextUIProvider } from '@nextui-org/react';
import { Toaster } from 'react-hot-toast';
import { SuitContext } from './SuitContext';
import Nav from './Nav';
import { useSideBarState } from '../utils/SideBarState';

function LayoutContext({ children }: any) {
  const { setIsOpen } = useSideBarState();

  return (
    <body
      suppressHydrationWarning={true}
      className="h-full w-full overflow-auto "
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
  );
}
export default LayoutContext;
