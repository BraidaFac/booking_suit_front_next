'use client';
import Logo from './Logo/Logo';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  NextUIProvider,
  Link,
} from '@nextui-org/react';
import CookiesUtils from '../utils/cookies';
import { useUserState } from '../utils/UserState';
import { useRouter } from 'next/navigation';

const Nav = () => {
  const { user, setUser } = useUserState();
  const router = useRouter();
  return (
    <NextUIProvider navigate={router.push}>
      <nav className="flex items-center justify-between w-full h-16  text-white mt-2 pr-2">
        <Logo />
        {user && user?.role !== 'LOUNDRY' && (
          <div>
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="text-white">
                  Menu
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem key="carryLoundry" href="/planillas/llevar">
                  Llevar lavanderia
                </DropdownItem>
                <DropdownItem key="takeLoundry" href="/planillas/retirar">
                  Retirar lavanderia
                </DropdownItem>
                <DropdownItem key="soonBookings" href="/planillas/retiros">
                  Proximos retiros
                </DropdownItem>
                <DropdownItem
                  key="rememberReturns"
                  href="/planillas/devolucion"
                >
                  Proximas devoluciones
                </DropdownItem>
                <DropdownItem key="history" href="/reservas">
                  Historial
                </DropdownItem>
                <DropdownItem key="suits" href="/trajes">
                  Trajes
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
        {user && (
          <div>
            <Link
              href="/login"
              onClick={() => {
                CookiesUtils.removeItem('Authorization');
                setUser(null);
              }}
            >
              Log Out
            </Link>
          </div>
        )}
      </nav>
    </NextUIProvider>
  );
};

export default Nav;
