"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue,
  Button,
  Spinner,
  Chip,
} from "@nextui-org/react";
import { Booking, BookingState } from "@/lib/utils/Booking";
import { getState, SuitState } from "@/lib/utils/Suit";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useUserState } from "@/lib/utils/UserState";
import { getCookie } from "cookies-next";
import { API_BACKEND } from "@/lib/utils/constanst";
import toast from "react-hot-toast";

// Define un tipo para los colores válidos
type StatusColor = "success" | "danger" | "warning" | "primary";

// Define el objeto mapeado con claves de SuitState y valores de StatusColor
const statusColorMap: { [key in SuitState]: StatusColor } = {
  [SuitState.ENLOCALLIMPIO]: "success",
  [SuitState.ENLOCALSUCIO]: "danger",
  [SuitState.LAVANDERIALIMPIO]: "warning",
  [SuitState.LAVANDERIASUCIO]: "warning",
  [SuitState.MODISTA]: "success",
  [SuitState.RETIRADO]: "primary",
};
export default function Retiros() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useUserState();
  const router = useRouter();
  const [nearBookings, setNearBookings] = useState<
    {
      key: number;
      client_name: string;
      client_phone: string;
      suit: number;
      suit_state: SuitState;
      dress_maker: string;
      observations: string;
      booking_date: string;
      actions: JSX.Element;
    }[]
  >([]);
  const fetchNearBookings = async () => {
    const res = await fetch(`${API_BACKEND}/booking`);
    const bookings = await res.json();

    const nearBookings = bookings.filter((booking: Booking) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const bookingDate = new Date(booking.booking_date);

      const diffTime = bookingDate.getTime() - today.getTime();

      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return (
        diffDays >= 0 &&
        diffDays <= 8 &&
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

    setNearBookings(
      nearBookings.map((booking: Booking) => {
        return {
          key: booking.id,
          client_name: booking.client_name,
          client_phone: booking.client_phone,
          suit: booking.suit.id,
          suit_state: booking.suit.state,
          dress_maker: booking.dressmaker ? "Si" : "No",
          observation: booking.observations,
          booking_date: format(new Date(booking.booking_date), "dd/MM/yyyy"),
          actions: (
            <Button
              size="sm"
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
                      booking_state: BookingState.INPROGRESS,
                      suit_state: SuitState.RETIRADO,
                      booking_retired_suit: new Date(),
                    }),
                  }
                );
                if (res.ok) {
                  toast.success("Traje retirado");
                  await fetchNearBookings();
                } else {
                  toast.error("Error al retirar el traje");
                }
              }}
            >
              Retirado
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
      if (user.role === "LAUNDRY") {
        router.push("/planillas/retirar");
      } else {
        (async () => {
          await fetchNearBookings();
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
        if (user.role === "LOUNDRY") {
          router.push("/planillas/retirar");
        } else {
          (async () => {
            await fetchNearBookings();
            setIsLoading(false);
          })();
        }
      }
    }
  }, []);

  const columns = [
    {
      key: "client_name",
      label: "Cliente",
    },
    {
      key: "client_phone",
      label: "Telefono",
    },
    {
      key: "suit",
      label: "Traje",
    },
    {
      key: "suit_state",
      label: "Estado del traje",
    },
    {
      key: "booking_date",
      label: "Fecha de reserva",
    },
    {
      key: "dress_maker",
      label: "Modista",
    },
    { key: "observation", label: "Observaciones" },
    {
      key: "actions",
      label: "Acciones",
    },
  ];
  return (
    <>
      {!isLoading ? (
        <div>
          <div className="header">
            <p className="text-3xl text-red-800 text-center">
              Proximos retiros
            </p>
          </div>
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
              items={nearBookings}
              isLoading={isLoading}
              emptyContent={isLoading ? null : "No hay reservas proximas"}
              loadingContent={<Spinner color="white" />}
            >
              {(item) => (
                <TableRow key={item.key}>
                  {(columnKey) => (
                    <TableCell className="p-1">
                      {columnKey === "suit_state" ? (
                        <Chip
                          className="p-0"
                          color={statusColorMap[item.suit_state]}
                        >
                          {getState(item.suit_state)}
                        </Chip>
                      ) : (
                        getKeyValue(item, columnKey)
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center">
          <Spinner color="danger"></Spinner>
        </div>
      )}
    </>
  );
}
