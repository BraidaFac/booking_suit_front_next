"use client";
import { Booking, BookingState } from "@/lib/utils/Booking";
import { API_BACKEND } from "@/lib/utils/constanst";
import { SuitState } from "@/lib/utils/Suit";
import { useUserState } from "@/lib/utils/UserState";
import {
  Button,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Devolucion() {
  const [isLoading, setIsLoading] = useState(true);
  const [filteredBookings, setFilteredBookings] = useState<
    | {
        key: number;
        suit_id: string;
        client_name: string;
        client_phone: string;
        next_booking_date: string;
        booking_date: string;
        actions: JSX.Element;
      }[]
    | undefined
  >(undefined);
  const { user, setUser } = useUserState();
  const router = useRouter();
  const [bookingsToReturn, setBookingsToReturn] = useState<
    {
      key: number;
      suit_id: string;
      client_name: string;
      client_phone: string;
      next_booking_date: string;
      booking_date: string;
      actions: JSX.Element;
    }[]
  >([]);

  const fetchBookingsToReturn = async () => {
    const res = await fetch(`${API_BACKEND}/booking`);
    const bookings: Booking[] = await res.json();

    const bookingsToReturn: Booking[] = bookings.filter(
      (booking: Booking) => booking.booking_state === BookingState.INPROGRESS
    );

    const bookingToReturnWithSoonBookingDate = bookingsToReturn.map(
      (booking: Booking) => {
        const suitBookings: Booking[] = bookings.filter(
          (suitBooking: Booking) => suitBooking.suit.id === booking.suit.id
        );
        const soon_booking_date_string = suitBookings.reduce(
          (acc: Booking | undefined, booking) => {
            const date_booking = new Date(booking.booking_date).getTime();
            const acc_date = acc
              ? new Date(acc.booking_date).getTime()
              : Infinity;

            if (
              date_booking > new Date().getTime() &&
              date_booking < acc_date &&
              booking.booking_state === BookingState.ACTIVED
            ) {
              return booking;
            } else {
              return acc;
            }
          },
          undefined
        )?.booking_date;

        return {
          ...booking,
          soon_booking_date: soon_booking_date_string
            ? new Date(soon_booking_date_string)
            : undefined,
        };
      }
    );

    bookingToReturnWithSoonBookingDate.sort((a, b) => {
      if (
        a.soon_booking_date &&
        a.soon_booking_date < (b.soon_booking_date || Infinity)
      ) {
        return -1;
      }
      if (
        a.soon_booking_date &&
        a.soon_booking_date > (b.soon_booking_date || -Infinity)
      ) {
        return 1;
      }
      return 0;
    });

    setBookingsToReturn(
      bookingToReturnWithSoonBookingDate.map(
        (booking: Booking & { soon_booking_date: Date | undefined }) => {
          return {
            key: booking.id,
            suit_id: booking.suit.id,
            client_name: booking.client_name,
            client_phone: booking.client_phone,
            booking_date: format(new Date(booking.booking_date), "dd-MM-yyyy"),
            next_booking_date: booking.soon_booking_date
              ? format(new Date(booking.soon_booking_date), "dd-MM-yyyy")
              : "No tiene",
            actions: (
              <Button
                size="sm"
                className="w-8"
                color="primary"
                onClick={async () => {
                  const res = await fetch(
                    `${API_BACKEND}/booking/${booking.id}/estados`,
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
                    toast.success("Traje devuelto correctamente");
                    await fetchBookingsToReturn();
                  } else {
                    toast.error("Error al devolver traje");
                  }
                }}
              >
                Devuelto
              </Button>
            ),
          };
        }
      )
    );
  };

  const handleSearch = (value: string) => {
    if (value === "") {
      return setFilteredBookings(bookingsToReturn);
    }
    let searchTermLower = value.toLowerCase();
    const filtered = bookingsToReturn?.filter(
      (booking: {
        key: number;
        suit_id: string;
        client_name: string;
        client_phone: string;
        booking_date: string;
        next_booking_date: string;
        actions: JSX.Element;
      }) =>
        booking.suit_id.toLowerCase().includes(searchTermLower) ||
        booking.client_name.toLowerCase().includes(searchTermLower) ||
        booking.client_phone.toLowerCase().includes(searchTermLower)
    );
    setFilteredBookings(filtered);
  };

  const fetchUser = async (token: string) => {
    const res = await fetch(`${API_BACKEND}/auth/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (res.ok) {
      const user = await res.json();
      setUser({
        name: user.username,
        role: user.role,
      });
      if (user.role === "LOUNDRY") {
        router.push("/planillas/retirar");
      } else {
        (async () => {
          await fetchBookingsToReturn();
          setIsLoading(false);
        })();
      }
    } else {
      setUser(null);
      router.push("/login");
    }
  };
  useEffect(() => {
    const token_cookie = getCookie("Authorization");
    const token = token_cookie ? token_cookie.split(" ")[1] : "";
    if (!token) {
      router.push("/login");
    } else {
      if (!user) {
        (async () => {
          await fetchUser(token);
        })();
      } else {
        if (user.role === "LAUNDRY") {
          router.push("/planillas/retirar");
        } else {
          (async () => {
            await fetchBookingsToReturn();
            setIsLoading(false);
          })();
        }
      }
    }
  }, []);
  const columns = [
    { key: "suit_id", label: "Traje" },
    { key: "client_name", label: "Nombre" },
    { key: "client_phone", label: "Telefono" },
    { key: "next_booking_date", label: "Proxima reserva" },
    { key: "booking_date", label: "Fecha Reserva" },
    { key: "actions", label: "Acciones" },
  ];
  return (
    <>
      {isLoading ? (
        <div className="text-center">
          <Spinner color="danger"></Spinner>
        </div>
      ) : (
        <div>
          <div className="px-2">
            <div className="header">
              <p className="text-3xl text-red-800 text-center">
                Recordar devolucion
              </p>
              <Input
                placeholder="Filtrar por traje, nombre o teléfono"
                onValueChange={(value) => {
                  handleSearch(value);
                }}
                className="mb-4"
              />
            </div>
            <div>
              <Table
                aria-label="Example table with dynamic content"
                isHeaderSticky
                bottomContent={
                  isLoading ? (
                    <div className="flex w-full justify-center">
                      <Spinner color="danger" />
                    </div>
                  ) : null
                }
              >
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                  )}
                </TableHeader>
                <TableBody
                  items={filteredBookings || bookingsToReturn}
                  isLoading={isLoading}
                  emptyContent={
                    isLoading ? null : "No hay trajes para devolver"
                  }
                  loadingContent={<Spinner color="white" />}
                >
                  {(item) => (
                    <TableRow key={item.key}>
                      {(columnKey) => (
                        <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
