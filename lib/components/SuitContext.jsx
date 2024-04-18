'use client';
import { createContext, useContext, useState } from 'react';
const Context = createContext();

export function SuitContext({ children }) {
  const [user, setUser] = useState();
  const [suit, setSuit] = useState();
  const contextValue = { user, setUser, suit, setSuit };
  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

export function useSuitContext() {
  return useContext(Context);
}
