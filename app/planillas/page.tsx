"use client";
import { NextUIProvider } from "@nextui-org/react";
import { Booking, BookingState } from "@/lib/utils/Booking";
import { SuitState } from "@/lib/utils/Suit";
import { useEffect, useState } from "react";
export default function Planillas() {
  const [bookingsToReturn, setBookingsToReturn] = useState<Booking[]>([]);
  const [nearBookings, setNearBookings] = useState<Booking[]>([]);

  const fetchBookingsToReturn = async () => {
    const res = await fetch("http://localhost:3001/booking");
    const bookings = await res.json();

    const bookingstoReturn = bookings.filter(
      (booking: Booking) => booking.booking_state === BookingState.INPROGRESS
    );
    bookingsToReturn.sort((a, b) => {
      if (a.booking_date < b.booking_date) {
        return -1;
      }
      if (a.booking_date > b.booking_date) {
        return 1;
      }
      return 0;
    });
    setBookingsToReturn(bookingstoReturn);
  };
  const fetchNearBookings = async () => {
    const res = await fetch("http://localhost:3001/booking");
    const bookings = await res.json();

    const nearBookings = bookings.filter((booking: Booking) => {
      const today = new Date();
      const bookingDate = new Date(booking.booking_date);

      bookingDate.setDate(bookingDate.getDate() - 1);
      const diffTime = bookingDate.getTime() - today.getTime();

      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return (
        (diffDays === 3 || diffDays === 2 || diffDays === 1) &&
        booking.booking_state === BookingState.ACTIVED
      );
    });
    nearBookings.sort((a: Booking, b: Booking) => {
      if (a.booking_date < b.booking_date) {
        return -1;
      }
      if (a.booking_date > b.booking_date) {
        return 1;
      }
      return 0;
    });
    setNearBookings(nearBookings);
  };
  useEffect(() => {
    fetchBookingsToReturn();
    fetchNearBookings();
  }, []);

  return (
    <NextUIProvider>
      <main className="grid grid-cols-4 gap-5">
        <div className="border-small h-48 ">
          <div className="header">
            <p className="text-3xl text-red-800 text-center">
              Recordar devolucion
            </p>
          </div>
          <div>
            {bookingsToReturn.map((booking) => (
              <div key={booking.id}>
                <p className=" text-white">
                  Cliente: {booking.client_name} Telefono:{" "}
                  {booking.client_phone}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-small h-48">
          <div className="header">
            <p className="text-3xl text-red-800 text-center">
              Proximos retiros
            </p>
          </div>
          <div>
            {nearBookings.map((booking) => (
              <div key={booking.id}>
                <p className=" text-white font-semibold">
                  {booking.suit.id} {booking.client_name} {booking.client_phone}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-small h-48">
          <div className="header">
            <p className="text-3xl text-red-800 text-center">
              Llevar Lavanderia
            </p>
          </div>
        </div>
        <div className="border-small h-48">
          <div className="header">
            <p className="text-3xl text-red-800 text-center">
              Retirar Lavanderia
            </p>
          </div>
        </div>
      </main>
    </NextUIProvider>
  );
}
