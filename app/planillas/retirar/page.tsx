"use client";
import { Booking, BookingState } from "@/lib/utils/Booking";
import { API_BACKEND } from "@/lib/utils/constanst";
import { Suit, SuitState } from "@/lib/utils/Suit";
import { useUserState } from "@/lib/utils/UserState";
import {
  Button,
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

export default function RetirarLavanderia() {
  const { user, setUser } = useUserState();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [suitsToTakeLoundry, setSuitToTakeLoundry] = useState<
    {
      key: number;
      suit_name: string;
      suit_color: SuitState;
      soon_booking: Booking | undefined;
      actions: JSX.Element;
    }[]
  >([]);
  const [suitsInLoundry, setSuitInLoundry] = useState<
    {
      key: number;
      suit_name: string;
      suit_color: SuitState;
      soon_booking: Booking | undefined;
      actions: JSX.Element;
    }[]
  >([]);

  const fetchSuitsLoundry = async () => {
    const resEnLavIn = await fetch(`${API_BACKEND}/suit/laundry/in`);
    const resEnLavToTake = await fetch(`${API_BACKEND}/suit/laundry/take`);

    const suitsToTakeLoundry = await resEnLavToTake.json();
    const suitsInLoundry = await resEnLavIn.json();

    setSuitInLoundry(
      suitsInLoundry
        .map((suit: Suit) => {
          const soon_booking_date_string = suit.bookings.reduce(
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
          const soon_booking_date = soon_booking_date_string
            ? new Date(soon_booking_date_string)
            : undefined;
          return {
            key: suit.id,
            suit_name: suit.id,
            lavanderia: (
              <div
                className={
                  suit.state === SuitState.LAVANDERIALUCECITASUCIO
                    ? "bg-green-500 p-1 rounded-md w-fit"
                    : "bg-blue-500 p-1 rounded-md"
                }
              >
                {suit.state === SuitState.LAVANDERIALUCECITASUCIO
                  ? "Lucecita"
                  : "Celia"}
              </div>
            ),
            soon_booking: soon_booking_date
              ? format(
                  new Date(
                    soon_booking_date.getFullYear(),
                    soon_booking_date.getMonth(),
                    soon_booking_date.getDate() - 1
                  ),
                  "dd/MM/yyyy"
                )
              : "No tiene",
            actions: (
              <Button
                size="sm"
                color="primary"
                onClick={async () => {
                  const res = await fetch(`${API_BACKEND}/suit/${suit.id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      state:
                        suit.state === SuitState.LAVANDERIALUCECITASUCIO
                          ? SuitState.LAVANDERIALUCECITALIMPIO
                          : SuitState.LAVANDERIACELIALIMPIO,
                    }),
                  });
                  if (res.ok) {
                    toast.success("Traje limpio");
                    await fetchSuitsLoundry();
                  } else {
                    toast.error("Error intente nuevamente");
                  }
                }}
              >
                Limpio
              </Button>
            ),
          };
        })
        .sort((a: any, b: any) => {
          const date_splited_a = a.soon_booking.split("/");
          const date_splited_b = b.soon_booking.split("/");
          if (date_splited_a.length !== 3 && date_splited_b.length !== 3)
            return 0;
          else if (date_splited_a.length !== 3) return 1;
          else if (date_splited_b.length !== 3) return -1;
          const date_a = new Date(
            date_splited_a[2],
            +date_splited_a[1] - 1,
            date_splited_a[0]
          );
          const date_b = new Date(
            date_splited_b[2],
            +date_splited_b[1] - 1,
            date_splited_b[0]
          );

          return date_a.getTime() < date_b.getTime() ? -1 : 1;
        })
    );
    setSuitToTakeLoundry(
      suitsToTakeLoundry
        .map((suit: Suit) => {
          const soon_booking_date_string = suit.bookings.reduce(
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
          const soon_booking_date = soon_booking_date_string
            ? new Date(soon_booking_date_string)
            : undefined;
          return {
            key: suit.id,
            suit_name: suit.id,
            soon_booking: soon_booking_date
              ? format(
                  new Date(
                    soon_booking_date.getFullYear(),
                    soon_booking_date.getMonth(),
                    soon_booking_date.getDate() - 1
                  ),
                  "dd/MM/yyyy"
                )
              : "No tiene",
            lavanderia: (
              <div
                className={
                  suit.state === SuitState.LAVANDERIALUCECITALIMPIO
                    ? "bg-green-500 p-1 rounded-md w-fit"
                    : "bg-blue-500 p-1 rounded-md"
                }
              >
                {suit.state === SuitState.LAVANDERIALUCECITALIMPIO
                  ? "Lucecita"
                  : "Celia"}
              </div>
            ),
            actions: (
              <Button
                size="sm"
                color="primary"
                onClick={async () => {
                  const res = await fetch(`${API_BACKEND}/suit/${suit.id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      state: SuitState.ENLOCALLIMPIO,
                    }),
                  });
                  if (res.ok) {
                    toast.success("Traje retirado");
                    await fetchSuitsLoundry();
                  } else {
                    toast.error("Error al entregar el traje");
                  }
                }}
              >
                Entregado
              </Button>
            ),
          };
        })
        .sort((a: any, b: any) => {
          const date_splited_a = a.soon_booking.split("/");
          const date_splited_b = b.soon_booking.split("/");
          if (date_splited_a.length !== 3 && date_splited_b.length !== 3)
            return 0;
          else if (date_splited_a.length !== 3) return 1;
          else if (date_splited_b.length !== 3) return -1;
          const date_a = new Date(
            date_splited_a[2],
            +date_splited_a[1] - 1,
            date_splited_a[0]
          );
          const date_b = new Date(
            date_splited_b[2],
            +date_splited_b[1] - 1,
            date_splited_b[0]
          );

          return date_a.getTime() < date_b.getTime() ? -1 : 1;
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
      (async () => {
        await fetchSuitsLoundry();
        setIsLoading(false);
      })();
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
        (async () => {
          await fetchSuitsLoundry();
          console.log(suitsInLoundry);

          setIsLoading(false);
        })();
      }
    }
  }, []);

  const columns = [
    {
      key: "suit_name",
      label: "Traje",
    },
    {
      key: "lavanderia",
      label: "Lavanderia",
    },
    { key: "soon_booking", label: "Proxima reserva" },
    { key: "actions", label: "Acciones" },
  ];
  return (
    <>
      {isLoading ? (
        <div className="text-center">
          <Spinner color="danger"></Spinner>
        </div>
      ) : (
        <main className="flex flex-col w-full">
          <div className="w-full px-2">
            <div className="header">
              <p className="text-3xl text-red-800 text-center">
                Retirar Lavanderia
              </p>
            </div>
            <div className="">
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
                  items={suitsToTakeLoundry}
                  isLoading={isLoading}
                  emptyContent={
                    isLoading
                      ? null
                      : "No hay trajes para retirar de lavanderia"
                  }
                  loadingContent={<Spinner color="white" />}
                >
                  {(item) => (
                    <TableRow key={item.suit_name}>
                      {(columnKey) => (
                        <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="w-full p-2">
            <div className="header">
              <p className="text-3xl text-red-800 text-center">
                Trajes en lavanderia
              </p>
            </div>
            <div className="">
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
                  items={suitsInLoundry}
                  isLoading={isLoading}
                  emptyContent={
                    isLoading ? null : "No hay trajes  en lavanderia"
                  }
                  loadingContent={<Spinner color="white" />}
                >
                  {(item) => (
                    <TableRow key={item.suit_name}>
                      {(columnKey) => (
                        <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
