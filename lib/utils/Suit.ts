import { Booking } from "./Booking";
export interface Suit {
  id: string;
  color: string;
  category: string;
  state: string;
  size: number;
  brand: string;
  bookings: Booking[];
}
export enum SuitState {
  ENLOCALSUCIO = "ENLOCALSUCIO",
  ENLOCALLIMPIO = "ENLOCALLIMPIO",
  LISTOENTREGA = "LISTOENTREGA",
  RETIRADO = "RETIRADO",
  LAVANDERIALUCECITALIMPIO = "LAVANDERIALUCECITALIMPIO",
  LAVANDERIALUCECITASUCIO = "LAVANDERIALUCECITASUCIO",
  LAVANDERIACELIALIMPIO = "LAVANDERIACELIALIMPIO",
  LAVANDERIACELIASUCIO = "LAVANDERIACELIASUCIO",
  LAVANDERIACENTROLIMPIO = "LAVANDERIACENTROLIMPIO",
  LAVANDERIACENTROSUCIO = "LAVANDERIACENTROSUCIO",
  MODISTA = "MODISTA",
}

export function getState(state: SuitState) {
  switch (state) {
    case SuitState.ENLOCALSUCIO:
      return "En local sucio";
    case SuitState.ENLOCALLIMPIO:
      return "En local limpio";
    case SuitState.RETIRADO:
      return "Retirado";
    case SuitState.LAVANDERIALUCECITALIMPIO:
      return "Lavanderia Lucecita limpio";
    case SuitState.LAVANDERIALUCECITASUCIO:
      return "Lavanderia Lucecita sucio";
    case SuitState.LAVANDERIACELIALIMPIO:
      return "Lavanderia Celia limpio";
    case SuitState.LAVANDERIACELIASUCIO:
      return "Lavanderia Celia sucio";
    case SuitState.LAVANDERIACENTROLIMPIO:
      return "Lavanderia Centro limpio";
    case SuitState.LAVANDERIACENTROSUCIO:
      return "Lavanderia Centro sucio";
    case SuitState.MODISTA:
      return "Modista";
    case SuitState.LISTOENTREGA:
      return "Listo para entregar";
  }
}
