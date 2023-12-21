"use client";
import { NextUIProvider } from "@nextui-org/react";

const Nav = () => {
  return (
    <NextUIProvider>
      <nav className="w-full h-20 bg-white">
        <h1 className="text-black text-center text-3xl">Casa Sonia Trajes</h1>
      </nav>
    </NextUIProvider>
  );
};

export default Nav;
