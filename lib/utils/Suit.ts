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
  LAVANDERIALIMPIO = "LAVANDERIALIMPIO",
  LAVANDERIASUCIO = "LAVANDERIASUCIO",
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
    case SuitState.LAVANDERIALIMPIO:
      return "Lavanderia limpio";
    case SuitState.LAVANDERIASUCIO:
      return "Lavanderia sucio";
    case SuitState.MODISTA:
      return "Modista";
    case SuitState.LISTOENTREGA:
      return "Listo para entregar";
  }
}
