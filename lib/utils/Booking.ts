import { Suit } from "./Suit";

export interface Booking {
  id: number;
  booking_created: Date;
  end_at: Date;
  booking_date: Date;
  booking_state: "ACTIVED" | "CANCELED" | "COMPLETED";
  suit: Suit;
  client_dni: string;
  client_name: string;
  client_phone: string;
  dressmaker: boolean;
}