export interface Suit {
  id: string;
  color: string;
  category: string;
  state: string;
}
export enum SuitState {
  ENLOCAL = "ENLOCAL",
  RETIRADO = "RETIRADO",
  LAVANDERIA = "LAVANDERIA",
  MODISTA = "MODISTA",
}
