"use client";
import { createContext, useContext, useState } from "react";
const Context = createContext();

export function SuitContext({ children }) {
  const [suit, setSuit] = useState();
  return (
    <Context.Provider value={[suit, setSuit]}>{children}</Context.Provider>
  );
}

export function useSuitContext() {
  return useContext(Context);
}
