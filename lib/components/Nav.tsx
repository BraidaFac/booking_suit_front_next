"use client";
import Logo from "./Logo/Logo";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  NextUIProvider,
  Link,
} from "@nextui-org/react";
import CookiesUtils from "../utils/cookies";
import { useUserState } from "../utils/UserState";
import { useRouter } from "next/navigation";

const Nav = () => {
  const { user, setUser } = useUserState();
  const router = useRouter();
  return (
    <NextUIProvider navigate={router.push}>
      <nav className="mx-auto flex items-center justify-between  h-16  text-white mt-2 pr-5 gap-10">
        <Logo />
        {user && user?.role !== "LAUNDRY" ? (
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
                <DropdownItem key="reservas" href="/diario">
                  Calendario de Reservas
                </DropdownItem>
                <DropdownItem key="suits" href="/trajes">
                  Trajes
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        ) : (
          user && (
            <div>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered" className="text-white">
                    Menu
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem key="takeLoundry" href="/planillas/retirar">
                    Lavanderia
                  </DropdownItem>
                  <DropdownItem key="reservas" href="/diario">
                    Calendario de Reservas
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )
        )}
        {user && (
          <div>
            <Link
              href="/login"
              onClick={() => {
                CookiesUtils.removeItem("Authorization");
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
