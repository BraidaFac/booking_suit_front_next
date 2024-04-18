'use client';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid/index.js';
import { Textarea } from '@nextui-org/react';
import { formatMonth } from '../utils/date_formatter';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  parse,
  startOfToday,
  isBefore,
  isSameDay,
} from 'date-fns';
import { useEffect, useState } from 'react';
import { useSuitContext } from './SuitContext';
import { Booking, BookingState } from '../utils/Booking';
import { SuitState, getState } from '../utils/Suit';
import { API_BACKEND } from '../utils/constanst';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
} from '@nextui-org/react';
import toast from 'react-hot-toast';
function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
} /*  */

function isFuture(day: any) {
  return isBefore(startOfToday(), day);
}

export default function Calendar() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [formError, setFormError] = useState(false);
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [selectedBookingToCancel, setSelectedBookingToCancel] =
    useState<Booking>();

  //Suit Data
  const { suit, setSuit } = useSuitContext();

  //Booking Data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [busyDaysLaundry, setBusyDaysLaundry] = useState<Date[]>([]);
  const [busyDaysDressmaker, setBusyDaysDressmaker] = useState<Date[]>([]);
  const [busyDaysPreparation, setBusyDaysPreparation] = useState<Date[]>([]);

  //Calendar functions
  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });
  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }
  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  //Booking functions
  const fetchBookingbySuit = async () => {
    const res = await fetch(`${API_BACKEND}/booking/suit/${suit.id}`, {
      method: 'GET',
    });
    const data = await res.json();

    setBookings(data);
  };

  const getBusyDays = async () => {
    const res = await fetch(`${API_BACKEND}/booking/suit/${suit.id}/fechas`, {
      method: 'GET',
    });
    if (!res.ok) {
      toast.error('Error');
      return;
    }
    const data = await res.json();

    const busyDaysLaundry = data.laundry.map((day: any) => {
      return new Date(day);
    });
    setBusyDaysLaundry(busyDaysLaundry);
    const busyDaysDressmaker = data.dressmaker.map((day: any) => {
      return new Date(day);
    });
    setBusyDaysDressmaker(busyDaysDressmaker);
    const busyDaysPreparation = data.preparation.map((day: any) => {
      return new Date(day);
    });
    setBusyDaysPreparation(busyDaysPreparation);
  };

  useEffect(() => {
    console.log(suit);

    if (suit) {
      try {
        fetchBookingbySuit();
        getBusyDays();
      } catch (error) {
        console.log(error); //TODO
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suit]);

  //Verification of day
  const verifyDay = (day: Date) => {
    const index = bookings.findIndex((booking) =>
      isSameDay(day, new Date(booking.booking_date))
    );
    if (index !== -1) setSelectedBookingToCancel(bookings[index]);
    else {
      setSelectedDay(day);
    }
  };
  return (
    <div className="mx-auto p-3 h-full ">
      {!suit ? (
        <div className="w-full">
          <p className="text-4xl text-white text-center mt-28">
            Seleccione un traje
          </p>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-4xl text-white text-left mt-10">
              Traje {suit.id}
            </h1>
            <h2 className="text-2xl text-white text-left">
              Estado: {suit.state}
            </h2>
          </div>
          <div className="flex flex-col md:mx-auto md:w-1/2  text-center my-2">
            <h3 className="text-2xl px-2 text-white">Seleccione la fecha</h3>
          </div>
          <div className="">
            <div className="flex items-center text-center">
              <button
                type="button"
                onClick={previousMonth}
                className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400"
              >
                <ChevronLeftIcon className="w-8 h-8" aria-hidden="true" />
              </button>
              <h2 className="flex-auto font-semibold text-2xl text-white ">
                {formatMonth(firstDayCurrentMonth)}
              </h2>

              <button
                onClick={nextMonth}
                type="button"
                className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              >
                <ChevronRightIcon className="w-8 h-8" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-red-400 ">
              <div className="w-full ">D</div>
              <div className="w-full ">L</div>
              <div className="w-full ">M</div>
              <div className="w-full ">M</div>
              <div className="w-full ">J</div>
              <div className="w-full ">V</div>
              <div className="w-full ">S</div>
            </div>
            <div className="grid grid-cols-7 mt-2 text-sm gap-2 p-2">
              {days.map((day, dayIdx) => (
                <div
                  key={day.toString()}
                  className={classNames(
                    dayIdx === 0 && colStartClasses[getDay(day)],
                    'md:h-28 h-14 w-full border-solid border-2 border-white'
                  )}
                >
                  <button
                    onClick={() => {
                      //TODO VERIFICAR FECHAS DISPONIBLES
                      verifyDay(day);
                      onOpen();
                    }}
                    disabled={
                      busyDaysDressmaker.filter((busyDay) =>
                        isSameDay(day, busyDay)
                      ).length > 0 ||
                      busyDaysLaundry.filter((busyDay) =>
                        isSameDay(day, busyDay)
                      ).length > 0 ||
                      busyDaysPreparation.filter((busyDay) =>
                        isSameDay(day, busyDay)
                      ).length > 0 ||
                      (!isFuture(day) &&
                        !isToday(day) &&
                        bookings.filter((booking) =>
                          isSameDay(day, new Date(booking.booking_date))
                        ).length === 0)
                    }
                    type="button"
                    className={classNames(
                      'text-white',
                      isToday(day) && 'text-white',
                      !isToday(day) && 'text-gray-900',
                      'font-semibold',
                      isFuture(day) && 'bg-green-400',
                      bookings.filter((booking) =>
                        isSameDay(day, new Date(booking.booking_date))
                      ).length > 0 && 'bg-red-400',
                      busyDaysDressmaker.filter((busyDay) =>
                        isSameDay(day, new Date(busyDay))
                      ).length > 0 && 'bg-yellow-400',
                      busyDaysLaundry.filter((busyDay) =>
                        isSameDay(day, new Date(busyDay))
                      ).length > 0 && 'bg-yellow-400',
                      busyDaysPreparation.filter((busyDay) =>
                        isSameDay(day, new Date(busyDay))
                      ).length > 0 && 'bg-yellow-400',
                      'w-full  h-full flex flex-col justify-center',
                      isToday(day) && 'bg-blue-400'
                    )}
                  >
                    <div className="self-center">
                      <time dateTime={format(day, 'yyyy-MM-dd')}>
                        {format(day, 'd')}
                      </time>

                      {bookings
                        .filter((booking) =>
                          isSameDay(day, new Date(booking.booking_date))
                        )
                        .map((booking) => (
                          <div className="self-center hidden" key={booking.id}>
                            <p>{booking.client_name}</p>
                            <p>{booking.client_phone}</p>
                          </div>
                        ))}
                      {busyDaysDressmaker
                        .filter((busyDay) => isSameDay(day, busyDay))
                        .map((booking) => (
                          <div
                            className="self-center hidden"
                            key={day.toISOString()}
                          >
                            {' '}
                            MODISTA
                          </div>
                        ))}

                      {busyDaysLaundry
                        .filter((busyDay) => isSameDay(day, busyDay))
                        .map(() => (
                          <div
                            className="self-center hidden"
                            key={day.toISOString()}
                          >
                            LAVANDERIA
                          </div>
                        ))}
                      {busyDaysPreparation
                        .filter((busyDay) => isSameDay(day, busyDay))
                        .map(() => (
                          <div
                            className="self-center hidden"
                            key={day.toISOString()}
                          >
                            {' '}
                            EN LOCAL
                          </div>
                        ))}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        className=""
        onClose={() => {
          setFormError(false);
          setSelectedDay(undefined);
          setSelectedBookingToCancel(undefined);
        }}
      >
        <ModalContent>
          {(onClose) =>
            selectedDay ? (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Reservar un traje
                </ModalHeader>
                <ModalBody>
                  <form id="booking-form" className="flex flex-col gap-3 ">
                    <Input
                      isRequired
                      label="DNI Cliente"
                      name="client_dni"
                    ></Input>
                    <Input
                      isRequired
                      label="Nombre Cliente"
                      name="client_name"
                    ></Input>
                    <Input
                      isRequired
                      label="Telefono Cliente"
                      name="client_phone"
                    ></Input>
                    <Input
                      isRequired
                      label="Cuenta asociada"
                      name="account_related"
                    ></Input>
                    <Input
                      isRequired
                      label="Traje"
                      name="suit_id"
                      value={suit.id}
                    ></Input>
                    <Input
                      isRequired
                      label="Color"
                      value={suit.color}
                      type="text"
                    ></Input>
                    <Input
                      isRequired
                      label="Fecha evento"
                      value={format(selectedDay, 'yyyy-MM-dd')}
                      type="text"
                      name="booking_date"
                    ></Input>
                    <Textarea
                      isRequired
                      label="Observaciones"
                      labelPlacement="inside"
                      className="max-w-xs"
                      name="observations"
                    />
                    <div className="flex flex-row gap-3 p-2">
                      <label className="text-black ">Modista</label>
                      <input
                        className="w-6 h-6"
                        type="checkbox"
                        name="dressmaker"
                      />
                    </div>
                    {formError && (
                      <span className="text-red-500">
                        Todos los campos son obligatorios
                      </span>
                    )}
                  </form>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    color="primary"
                    onClick={async (e) => {
                      e.preventDefault();
                      const form = document.getElementById(
                        'booking-form'
                      ) as HTMLFormElement;
                      if (form) {
                        const formData = new FormData(form);
                        const suit_id = formData.get('suit_id');
                        const booking_date = formData.get('booking_date');
                        const dressmaker = formData.get('dressmaker')
                          ? true
                          : false;
                        const client_dni = formData.get('client_dni');
                        const client_name = formData.get('client_name');
                        const client_phone = formData.get('client_phone');
                        const observations = formData.get('observations');
                        const account_related = formData.get('account_related');

                        if (
                          !client_dni ||
                          !client_name ||
                          !client_phone ||
                          !account_related
                        ) {
                          setFormError(true);
                          return;
                        }
                        const response = await fetch(`${API_BACKEND}/booking`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            suit: {
                              id: suit_id,
                            },
                            booking_date,
                            dressmaker,
                            client_dni,
                            client_name,
                            client_phone,
                            observations,
                            account_related,
                          }),
                        });
                        if (response.status === 201) {
                          toast.success('Reserva exitosa');
                          fetchBookingbySuit();
                          getBusyDays();
                          onClose();
                        } else {
                          toast.error('Fechas solapadas');
                        }
                      }
                    }}
                  >
                    Reservar
                  </Button>
                </ModalFooter>
              </>
            ) : selectedBookingToCancel?.booking_state !==
              BookingState.COMPLETED ? (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Acciones
                </ModalHeader>
                <ModalBody>
                  <Button
                    isDisabled={
                      suit.state === SuitState.RETIRADO ||
                      suit.state === SuitState.ENLOCALSUCIO
                    }
                    color="primary"
                    variant="light"
                    onPress={async () => {
                      const res = await fetch(
                        `${API_BACKEND}/booking/${selectedBookingToCancel?.id}/estados`,
                        {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            booking_state: BookingState.INPROGRESS,
                            suit_state: SuitState.RETIRADO,
                            booking_retired_suit: new Date(),
                          }),
                        }
                      );
                      if (res.ok) {
                        toast.success('Traje retirado');

                        const suit = (await res.json()).suit;

                        setSuit(suit);
                        await fetchBookingbySuit();
                        onClose();
                      } else {
                        toast.error('Error al retirar el traje');
                      }
                    }}
                  >
                    RETIRO
                  </Button>
                  <Button
                    isDisabled={
                      suit.state === SuitState.ENLOCALLIMPIO ||
                      suit.state === SuitState.ENLOCALSUCIO
                    }
                    color="primary"
                    variant="light"
                    onPress={async () => {
                      const res = await fetch(
                        `${API_BACKEND}/booking/${selectedBookingToCancel?.id}/estados`,
                        {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            booking_state: BookingState.COMPLETED,
                            suit_state: SuitState.ENLOCALSUCIO,
                            booking_return_suit: new Date(),
                          }),
                        }
                      );

                      if (res.ok) {
                        if (selectedBookingToCancel?.dressmaker) {
                          toast.success('Recordar que fue con modista');
                        }
                        toast.success('Traje devuelto');

                        const suitUpdated = (await res.json()).suit;
                        setSuit(suitUpdated);
                        await fetchBookingbySuit();
                        onClose();
                      } else {
                        toast.error('Error al devolver el traje');
                      }
                    }}
                  >
                    DEVOLVIO
                  </Button>
                  <Button
                    color="danger"
                    disabled={suit.status === SuitState.RETIRADO}
                    variant="light"
                    onPress={async (e) => {
                      const response = await fetch(
                        `${API_BACKEND}/booking/${selectedBookingToCancel?.id}`,
                        {
                          method: 'DELETE',
                        }
                      );
                      console.log(await response.json());

                      if (response.status === 200) {
                        await fetchBookingbySuit();
                        await getBusyDays();
                        onClose();
                        toast.success('Reserva cancelada');
                      } else {
                        toast.error('Error al cancelar la reserva');
                      }
                    }}
                  >
                    CANCELAR
                  </Button>
                </ModalBody>
              </>
            ) : (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  La reserva ya se completo
                </ModalHeader>
              </>
            )
          }
        </ModalContent>
      </Modal>
    </div>
  );
}

let colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];
