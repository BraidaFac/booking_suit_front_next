import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from "@nextui-org/react";
import Logo from "./Logo/Logo";
import { usePathname } from "next/navigation";

export default function Menu() {
  const menuItems = ["Calendario", "Planillas"];
  const path = usePathname();
  return (
    <Navbar disableAnimation isBordered className="bg-black navigation">
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <Logo />
          <p className="font-bold text-inherit text-white">Casa Sonia</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        <NavbarBrand>
          <Logo />
          <p className="font-bold text-inherit text-white">Casa Sonia</p>
        </NavbarBrand>
        <NavbarItem isActive={path === "/"}>
          <Link href="/" aria-current="page" className="text-white">
            Calendario
          </Link>
        </NavbarItem>
        <NavbarItem isActive={path === "/planillas"}>
          <Link className="text-white" href="/planillas" aria-current="page">
            Planillas
          </Link>
        </NavbarItem>
        <NavbarItem isActive={path === "/reservas"}>
          <Link className="text-white" href="/reservas" aria-current="page">
            Reservas
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="warning" href="#" variant="flat">
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 2
                  ? "warning"
                  : index === menuItems.length - 1
                  ? "danger"
                  : "foreground"
              }
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
