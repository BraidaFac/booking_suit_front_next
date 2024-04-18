'use client';
import { useState } from 'react';
import Logo from './Logo/Logo';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
} from '@nextui-org/react';
import CookiesUtils from '../utils/cookies';
import Link from 'next/link';
import { useUserState } from '../utils/UserState';

const Nav = () => {
  const { user, setUser } = useUserState();
  return (
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
              <DropdownItem key="carryLoundry">
                <Link href="/planillas/llevar">Llevar lavanderia</Link>
              </DropdownItem>
              <DropdownItem key="takeLoundry">
                <Link href="/planillas/retirar">Retirar lavanderia</Link>
              </DropdownItem>
              <DropdownItem key="soonBookings">
                <Link href="/planillas/retiros">Proximos retiros</Link>
              </DropdownItem>
              <DropdownItem key="rememberReturns">
                <Link href="/planillas/devolucion">Recordar devolucion</Link>
              </DropdownItem>
              <DropdownItem key="history">
                <Link href="/reservas">Historial</Link>
              </DropdownItem>
              <DropdownItem key="suits">
                <Link href="/trajes">Trajes</Link>
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
  );
};

export default Nav;
