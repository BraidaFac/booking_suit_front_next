"use client";
import { NextUIProvider } from "@nextui-org/react";
import { ChangeEventHandler } from "react";

const Nav = ({ handleChange }: { handleChange: ChangeEventHandler }) => {
  return (
    <NextUIProvider>
      <div>
        <input
          type="text"
          placeholder="Search"
          className="text-black text-center w-full border-small"
          onChange={handleChange}
        />
      </div>
    </NextUIProvider>
  );
};

export default Nav;
