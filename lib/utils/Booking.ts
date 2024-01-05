import { Suit } from "./Suit";

export interface Booking {
  id: number;
  booking_created: Date;
  end_at: Date;
  booking_date: Date;
  booking_state: BookingState;
  booking_return_suit: Date;
  booking_retired_suit: Date;
  suit: Suit;
  client_dni: string;
  client_name: string;
  client_phone: string;
  dressmaker: boolean;
}

export enum BookingState {
  ACTIVED = "ACTIVED",
  CANCELED = "CANCELED",
  COMPLETED = "COMPLETED",
  INPROGRESS = "INPROGRESS",
}
