"use client";

import { useState } from "react";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  startOfToday,
  parse,
} from "date-fns";
import useSWR from "swr";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@nextui-org/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { API_BACKEND } from "../utils/constanst";
import { Booking, BookingState } from "../utils/Booking";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

// Helper to fetch data
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CalendarReservas() {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const CANTIDAD: string = "cantidad";
  const RESERVAS = "reservas";
  // Using SWR to fetch booking data
  const {
    data: bookings,
    error: bookingError,
    isLoading,
    mutate,
  } = useSWR(`${API_BACKEND}/booking`, fetcher);

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  // Handle next and previous month
  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  // Loading and error handling
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner color="danger" />
      </div>
    );
  }

  if (bookingError) {
    return (
      <div className="text-center">
        <p className="text-red-600">Error al cargar las reservas</p>
        <Button color="primary" onClick={() => mutate()}>
          Reintentar
        </Button>
      </div>
    );
  }

  // Group bookings by day
  const bookingsByDay: {
    [key: string]: { cantidad: number; reservas: Booking[] };
  } = bookings?.reduce(
    (
      acc: { [key: string]: { cantidad: number; reservas: Booking[] } },
      booking: Booking
    ) => {
      const bookingDate = format(new Date(booking.booking_date), "dd/MM/yyyy");
      // Si aún no existe la fecha en el acumulador, inicialízala
      if (!acc[bookingDate]) {
        acc[bookingDate] = {
          cantidad: 0,
          reservas: [],
        };
      }

      // Incrementar la cantidad de reservas para esa fecha
      if (
        booking.booking_state === BookingState.INPROGRESS ||
        booking.booking_state === BookingState.ACTIVED
      ) {
        acc[bookingDate].cantidad += 1;
        acc[bookingDate].reservas.push(booking);
      }

      return acc;
    },
    {}
  );

  return (
    <div className="p-4 h-full">
      <div className="flex items-center text-center">
        <button
          type="button"
          onClick={previousMonth}
          className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400"
        >
          <ChevronLeftIcon className="w-8 h-8" aria-hidden="true" />
        </button>
        <h2 className="flex-auto font-semibold text-2xl text-white">
          {format(firstDayCurrentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={nextMonth}
          type="button"
          className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
        >
          <ChevronRightIcon className="w-8 h-8" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-red-400">
        <div>D</div>
        <div>L</div>
        <div>M</div>
        <div>M</div>
        <div>J</div>
        <div>V</div>
        <div>S</div>
      </div>

      <div className="grid grid-cols-7 mt-2 text-sm gap-2 p-2">
        {days.map((day, dayIdx) => (
          <div
            key={day.toString()}
            className={classNames(
              dayIdx === 0 && colStartClasses[getDay(day)],
              "md:h-28 h-14 w-full border-solid border-2 border-white relative"
            )}
          >
            <button
              onClick={() => {
                setSelectedDay(format(new Date(day), "dd/MM/yyyy"));
              }}
              type="button"
              className={classNames(
                "text-white font-semibold",
                isToday(day) && "bg-blue-400",
                !isToday(day) && "bg-gray-500",
                "w-full h-full flex flex-col justify-center items-start p-1"
              )}
            >
              <span className="text-xs md:text-sm absolute top-0 md:top-1 left-1 text-white">
                {format(day, "d")}
              </span>
              <span
                className={`text-lg font-bold text-center self-center ${
                  bookingsByDay?.[format(day, "dd/MM/yyyy")]?.cantidad
                    ? "text-red-500"
                    : "text-black"
                } `}
              >
                {bookingsByDay?.[format(day, "dd/MM/yyyy")]?.cantidad || 0}
              </span>
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        placement="center"
        backdrop="blur"
        className="h-5/6 my-5 overflow-auto"
      >
        <ModalContent>
          <ModalHeader>
            Reservas del día {selectedDay && selectedDay}
          </ModalHeader>
          <ModalBody>
            {selectedDay && bookingsByDay?.[selectedDay] ? (
              bookingsByDay?.[selectedDay].reservas.map((booking: Booking) => (
                <>
                  <div className="bg-gray-300 shadow-lg rounded-md p-2">
                    <h1 className="text-xl text-black font-bold text-center">
                      Reserva numero: {booking.id}
                    </h1>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">
                        Información del Cliente
                      </h3>
                      <p>
                        <strong>Nombre: </strong> {booking.client_name}
                      </p>
                      <p>
                        <strong>Celular: </strong>
                        {booking.client_phone}
                      </p>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">
                        Información del Traje
                      </h3>
                      <p>
                        <strong>Codigo Traje: </strong>
                        {booking.suit.id}
                      </p>

                      <p>
                        <strong>Color: </strong>
                        {booking.suit.color}
                      </p>
                      <p>
                        <strong>Talle: </strong>
                        {booking.suit.size}
                      </p>
                    </div>
                  </div>
                </>
              ))
            ) : (
              <p className="text-center text-red-800 text-xl">
                No hay información disponible para este día.
              </p>
            )}
          </ModalBody>

          <ModalFooter>
            <Button color="primary" onPress={() => setSelectedDay(null)}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];
