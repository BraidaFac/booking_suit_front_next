'use client';
import { NextUIProvider } from '@nextui-org/react';
import { Toaster } from 'react-hot-toast';
import { SuitContext } from './SuitContext';
import Nav from './Nav';
import { useSideBarState } from '../utils/SideBarState';
import { useRouter } from 'next/navigation';

function LayoutContext({ children }: any) {
  const { setIsOpen } = useSideBarState();
  const router = useRouter();
  return (
    <body
      suppressHydrationWarning={true}
      className="h-full w-full overflow-auto "
      /*  onClick={(event) => {
        const sideBar = document.getElementById('sidebar');
        const input_sidebar = document.getElementById('input_sidebar');
        const input_date_sidebar =
          document.getElementById('input_date_sidebar');
        const filter_div = document.getElementById('filter_div');
        const htmlElement = event.target;
        if (
          htmlElement !== sideBar &&
          htmlElement !== input_sidebar &&
          htmlElement !== input_date_sidebar &&
          htmlElement !== filter_div
        ) {
          setIsOpen(false);
        }
      }} */
    >
      <NextUIProvider navigate={router.push}>
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
