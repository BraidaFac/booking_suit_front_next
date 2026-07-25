"use client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid/index.js";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameDay,
  isToday,
  parse,
  startOfToday,
} from "date-fns";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Booking, BookingState } from "../utils/Booking";
import { SuitState, getState } from "../utils/Suit";
import { API_BACKEND } from "../utils/constanst";
import { formatMonth } from "../utils/date_formatter";
import { useSuitContext } from "./SuitContext";
function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
} /*  */

function isFuture(day: any) {
  return isBefore(startOfToday(), day);
}

export default function Calendar() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [formError, setFormError] = useState(false);
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [selectedBookingToCancel, setSelectedBookingToCancel] =
    useState<Booking>();
  const [isEditing, setIsEditing] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Form state for editing
  const [formData, setFormData] = useState({
    client_dni: "",
    client_name: "",
    client_phone: "",
    account_related: "",
    suit_id: "",
    color: "",
    booking_date: "",
    l_manga: "",
    l_pierna: "",
    other_observations: "",
    tailor: false,
  });
  //Suit Data
  const { suit, setSuit } = useSuitContext();

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && editingBooking) {
      setFormData({
        client_dni: editingBooking.client_dni || "",
        client_name: editingBooking.client_name || "",
        client_phone: editingBooking.client_phone || "",
        account_related: editingBooking.account_related || "",
        suit_id: editingBooking.suit?.id || suit?.id || "",
        color: editingBooking.suit?.color || suit?.color || "",
        booking_date: editingBooking.booking_date
          ? format(new Date(editingBooking.booking_date), "yyyy-MM-dd")
          : "",
        l_manga: editingBooking.l_manga || "",
        l_pierna: editingBooking.l_pierna || "",
        other_observations: editingBooking.other_observations || "",
        tailor: editingBooking?.dressmaker || false,
      });
    } else if (!isEditing) {
      // Reset form for new booking
      setFormData({
        client_dni: "",
        client_name: "",
        client_phone: "",
        account_related: "",
        suit_id: suit?.id || "",
        color: suit?.color || "",
        booking_date: selectedDay ? format(selectedDay, "yyyy-MM-dd") : "",
        l_manga: "",
        l_pierna: "",
        other_observations: "",
        tailor: false,
      });
    }
  }, [isEditing, editingBooking, suit, selectedDay]);

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
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }
  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  //Booking functions
  const fetchBookingbySuit = async () => {
    const res = await fetch(`${API_BACKEND}/booking/suit/${suit.id}`, {
      method: "GET",
    });
    const data = await res.json();

    setBookings(data);
  };

  const getBusyDays = async (isDressmaker = false) => {
    const res = await fetch(
      `${API_BACKEND}/booking/suit/${suit.id}/fechas?dressmaker=${isDressmaker}`,
      { method: "GET" }
    );
    if (!res.ok) {
      toast.error("Error");
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
    if (suit) {
      try {
        fetchBookingbySuit();
        getBusyDays(formData.tailor);
      } catch (error) {
        console.log(error); //TODO
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suit]);

  useEffect(() => {
    if (suit) {
      getBusyDays(formData.tailor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.tailor]);

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
    <div className="p-4 h-full ">
      {!suit ? (
        <div className="w-full">
          <p className="text-4xl text-white text-center mt-28">
            Seleccione un traje
          </p>
        </div>
      ) : (
        <>
          <div className="">
            <h1 className="text-4xl text-white text-left mt-10">
              Traje {suit.id}
            </h1>
            <h2 className="text-2xl text-white text-left">
              Estado:{" "}
              <span className="text-red-700">{getState(suit.state)}</span>
            </h2>
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
                    "md:h-28 h-14 w-full border-solid border-2 border-white"
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
                      "text-white",
                      isToday(day) && "text-white",
                      !isToday(day) && "text-gray-900",
                      "font-semibold",
                      isFuture(day) && "bg-green-400",
                      bookings.filter((booking) =>
                        isSameDay(day, new Date(booking.booking_date))
                      ).length > 0 && "bg-red-400",
                      busyDaysDressmaker.filter((busyDay) =>
                        isSameDay(day, new Date(busyDay))
                      ).length > 0 && "bg-yellow-400",
                      busyDaysLaundry.filter((busyDay) =>
                        isSameDay(day, new Date(busyDay))
                      ).length > 0 && "bg-yellow-400",
                      busyDaysPreparation.filter((busyDay) =>
                        isSameDay(day, new Date(busyDay))
                      ).length > 0 && "bg-yellow-400",
                      "w-full  h-full flex flex-col justify-center",
                      isToday(day) && "bg-blue-400"
                    )}
                  >
                    <div className="self-center">
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        {format(day, "d")}
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
                            {" "}
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
                            {" "}
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
        className={`${
          selectedDay || isEditing ? "h-5/6 rounded-lg overflow-hidden" : ""
        } overflow-auto`}
        onClose={() => {
          setFormError(false);
          setSelectedDay(undefined);
          setEditingBooking(undefined);
          setIsEditing(false);
          setSelectedBookingToCancel(undefined);
        }}
      >
        <ModalContent className="rounded-lg overflow-auto">
          {(onClose) =>
            selectedDay || isEditing ? (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {isEditing ? "Modificar reserva" : "Reservar un traje"}
                </ModalHeader>
                <ModalBody>
                  <form id="booking-form" className="flex flex-col gap-3 ">
                    <Input
                      isRequired
                      label="DNI Cliente"
                      name="client_dni"
                      value={formData.client_dni}
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      isRequired
                      label="Nombre Cliente"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      isRequired
                      label="Telefono Cliente"
                      name="client_phone"
                      value={formData.client_phone}
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      isRequired
                      label="Cuenta asociada"
                      name="account_related"
                      value={formData.account_related}
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      isRequired
                      label="Traje"
                      name="suit_id"
                      value={formData.suit_id}
                      disabled
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      isRequired
                      label="Color"
                      name="color"
                      disabled
                      value={formData.color}
                      onChange={handleInputChange}
                      type="text"
                    ></Input>
                    <Input
                      isRequired
                      label="Fecha evento"
                      type="text"
                      name="booking_date"
                      disabled
                      value={formData.booking_date}
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      label="Largo Manga"
                      type="text"
                      name="l_manga"
                      value={formData.l_manga}
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      label="Largo Pierna"
                      type="text"
                      name="l_pierna"
                      value={formData.l_pierna}
                      onChange={handleInputChange}
                    ></Input>
                    <Textarea
                      label="Observaciones"
                      name="other_observations"
                      value={formData.other_observations}
                      onChange={handleInputChange}
                    ></Textarea>
                    <div className="flex flex-row gap-3 p-2">
                      <label className="text-black ">Modista</label>
                      <input
                        className="w-6 h-6"
                        type="checkbox"
                        name="tailor"
                        checked={formData.tailor}
                        onChange={handleInputChange}
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
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                    onClick={async (e) => {
                      e.preventDefault();
                      if (isSubmitting) return;

                      // Use formData state instead of FormData from DOM
                      const {
                        suit_id,
                        booking_date,
                        tailor,
                        client_dni,
                        client_name,
                        client_phone,
                        other_observations,
                        l_manga,
                        l_pierna,
                        account_related,
                      } = formData;

                      const observations = `${
                        l_manga ? "L.Manga: " + l_manga : ""
                      }\n ${
                        l_pierna ? "L.Pierna: " + l_pierna : ""
                      }\n Otros: ${other_observations}`;

                      if (
                        !client_dni ||
                        !client_name ||
                        !client_phone ||
                        !account_related
                      ) {
                        setFormError(true);
                        return;
                      }
                      setIsSubmitting(true);
                      try {
                        const response = await fetch(
                          `${API_BACKEND}/booking/${
                            isEditing ? editingBooking!.id : ""
                          }`,
                          {
                            method: isEditing ? "PATCH" : "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              suit: {
                                id: suit_id,
                              },
                              booking_date,
                              dressmaker: tailor,
                              client_dni,
                              client_name,
                              client_phone,
                              observations,
                              account_related,
                            }),
                          }
                        );
                        if (response.status === 201 || response.status === 200) {
                          if (isEditing) {
                            toast.success("Reserva modificada");
                            setIsEditing(false);
                            setEditingBooking(undefined);
                          } else {
                            toast.success("Reserva exitosa");
                          }
                          fetchBookingbySuit();
                          getBusyDays();
                          onOpenChange();
                        } else {
                          toast.error(
                            `Error al ${
                              isEditing ? "modificar" : "crear"
                            } la reserva`
                          );
                        }
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                  >
                    {isEditing ? "Modificar" : "Reservar"}
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
                    isDisabled={suit.state !== SuitState.LISTOENTREGA}
                    color="primary"
                    variant="light"
                    onPress={async () => {
                      const res = await fetch(
                        `${API_BACKEND}/booking/${selectedBookingToCancel?.id}/estados`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            booking_state: BookingState.INPROGRESS,
                            suit_state: SuitState.RETIRADO,
                            booking_retired_suit: new Date(),
                          }),
                        }
                      );
                      if (res.ok) {
                        toast.success("Traje retirado");

                        const suit = (await res.json()).suit;

                        setSuit(suit);
                        await fetchBookingbySuit();
                        onOpenChange();
                      } else {
                        toast.error("Error al retirar el traje");
                      }
                    }}
                  >
                    RETIRO
                  </Button>
                  <Button
                    isDisabled={suit.state !== SuitState.RETIRADO}
                    color="primary"
                    variant="light"
                    onPress={async () => {
                      const res = await fetch(
                        `${API_BACKEND}/booking/${selectedBookingToCancel?.id}/estados`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
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
                          toast.success("Recordar que fue con modista");
                        }
                        toast.success("Traje devuelto");

                        const suitUpdated = (await res.json()).suit;
                        setSuit(suitUpdated);
                        await fetchBookingbySuit();
                        onOpenChange();
                      } else {
                        toast.error("Error al devolver el traje");
                      }
                    }}
                  >
                    DEVOLVIO
                  </Button>
                  <Button
                    color="primary"
                    variant="light"
                    onPress={async () => {
                      setIsEditing(true);

                      setEditingBooking({
                        ...selectedBookingToCancel!,
                        l_manga: selectedBookingToCancel?.observations
                          ?.split("\n")[0]
                          .slice(9),
                        l_pierna: selectedBookingToCancel?.observations
                          ?.split("\n")[1]
                          .slice(11),
                        other_observations:
                          selectedBookingToCancel?.observations
                            ?.split("\n")[2]
                            .slice(8),
                      });
                    }}
                  >
                    EDITAR
                  </Button>
                  <Button
                    color="danger"
                    disabled={suit.status === SuitState.RETIRADO}
                    variant="light"
                    onPress={async (e) => {
                      const response = await fetch(
                        `${API_BACKEND}/booking/${selectedBookingToCancel?.id}`,
                        {
                          method: "DELETE",
                        }
                      );
                      console.log(await response.json());

                      if (response.status === 200) {
                        await fetchBookingbySuit();
                        await getBusyDays();
                        onOpenChange();
                        toast.success("Reserva cancelada");
                      } else {
                        toast.error("Error al cancelar la reserva");
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
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];
