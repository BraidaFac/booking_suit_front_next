"use client";
import { NextUIProvider } from "@nextui-org/react";
import Logo from "./Logo/Logo";
import Menu from "./Menu";

const Nav = () => {
  return (
    <NextUIProvider>
      <Menu></Menu>
    </NextUIProvider>
  );
};

export default Nav;
