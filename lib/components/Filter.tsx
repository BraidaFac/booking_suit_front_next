'use client';
import { NextUIProvider } from '@nextui-org/react';
import { ChangeEventHandler } from 'react';

const Nav = ({ handleChange }: { handleChange: ChangeEventHandler }) => {
  return (
    <NextUIProvider>
      <div>
        <input
          type="text"
          placeholder="Buscar"
          id="input_sidebar"
          className="text-black p-1 w-full pl-3 border-small input rounded-lg"
          onChange={handleChange}
        />
      </div>
    </NextUIProvider>
  );
};

export default Nav;
