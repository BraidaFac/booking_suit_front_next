"use client";
import { Booking, BookingState } from "@/lib/utils/Booking";
import { SuitState } from "@/lib/utils/Suit";
import { useUserState } from "@/lib/utils/UserState";
import { getCookie, setCookie } from "cookies-next";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
  Button,
  Spinner,
} from "@nextui-org/react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BACKEND } from "@/lib/utils/constanst";
import toast from "react-hot-toast";

export default function Devolucion() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useUserState();
  const router = useRouter();
  const [bookingsToReturn, setBookingsToReturn] = useState<
    {
      key: number;
      client_name: string;
      client_phone: string;
      booking_date: string;
      actions: JSX.Element;
    }[]
  >([]);

  const fetchBookingsToReturn = async () => {
    const res = await fetch(`${API_BACKEND}/booking`);
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
    setBookingsToReturn(
      bookingstoReturn.map((booking: Booking) => {
        return {
          key: booking.id,
          client_name: booking.client_name,
          client_phone: booking.client_phone,
          booking_date: format(new Date(booking.booking_date), "dd-MM-yyyy"),
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
      })
    );
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
    { key: "client_name", label: "Nombre" },
    { key: "client_phone", label: "Telefono" },
    { key: "booking_date", label: "Fecha" },
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
                  items={bookingsToReturn}
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
