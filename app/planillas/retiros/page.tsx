"use client";
import ConfirmationModal from "@/lib/components/ConfirmModal";
import { Booking, BookingState } from "@/lib/utils/Booking";
import { API_BACKEND } from "@/lib/utils/constanst";
import { getState, SuitState } from "@/lib/utils/Suit";
import { useUserState } from "@/lib/utils/UserState";
import {
  Button,
  Chip,
  getKeyValue,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// Define un tipo para los colores válidos
type StatusColor = "success" | "danger" | "warning" | "primary";

// Define el objeto mapeado con claves de SuitState y valores de StatusColor
const statusColorMap: { [key in SuitState]: StatusColor } = {
  [SuitState.ENLOCALLIMPIO]: "warning",
  [SuitState.ENLOCALSUCIO]: "danger",
  [SuitState.LAVANDERIACELIALIMPIO]: "danger",
  [SuitState.LAVANDERIACELIASUCIO]: "danger",
  [SuitState.LAVANDERIALUCECITALIMPIO]: "danger",
  [SuitState.LAVANDERIALUCECITASUCIO]: "danger",
  [SuitState.MODISTA]: "primary",
  [SuitState.RETIRADO]: "primary",
  [SuitState.LISTOENTREGA]: "success",
};
type ActionType = () => Promise<void>;
// Define el tipo de referencia para el modal
type ConfirmationModalRef = {
  openModal: () => Promise<boolean>;
};
export default function Retiros() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useUserState();
  const [filteredBookings, setFilteredBookings] = useState<
    | {
        key: number;
        client_name: string;
        client_phone: string;
        suit: string;
        suit_state: SuitState;
        dress_maker: string;
        observations: string;
        booking_date: string;
        actions: JSX.Element;
      }[]
    | undefined
  >(undefined);

  const router = useRouter();

  const modalRef = useRef<ConfirmationModalRef>(null); // Referencia para el modal

  const handleActionWithConfirmation = async (action: ActionType) => {
    const confirmed = await modalRef.current!.openModal(); // Abre el modal y espera la confirmación
    if (confirmed) {
      await action(); // Ejecuta la acción si el usuario confirma
    }
  };
  const [nearBookings, setNearBookings] = useState<
    {
      key: number;
      client_name: string;
      client_phone: string;
      suit: string;
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
        ((diffDays >= 0 && diffDays <= 8) || diffDays < 0) &&
        booking.booking_state === BookingState.ACTIVED &&
        booking.suit.state !== SuitState.LISTOENTREGA
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
          actions:
            booking.suit.state === SuitState.LAVANDERIACELIASUCIO ||
            booking.suit.state === SuitState.LAVANDERIALUCECITASUCIO ||
            booking.suit.state === SuitState.LAVANDERIALUCECITALIMPIO ||
            booking.suit.state === SuitState.LAVANDERIACELIALIMPIO ||
            booking.suit.state === SuitState.RETIRADO ||
            booking.suit.state === SuitState.ENLOCALSUCIO ? (
              <div></div>
            ) : booking.suit.state === SuitState.LISTOENTREGA ? (
              <div className="flex flex-row justify-center">
                <Button
                  size="sm"
                  className="p-2 min-w-6"
                  color="primary"
                  onClick={async () =>
                    handleActionWithConfirmation(async () => {
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
                    })
                  }
                >
                  Retiró
                </Button>
              </div>
            ) : booking.suit.state === SuitState.MODISTA ? (
              <div className="flex flex-row gap-1 justify-center">
                <Button
                  size="sm"
                  className="p-1 min-w-6"
                  color="success"
                  onClick={async () =>
                    handleActionWithConfirmation(async () => {
                      const res = await fetch(
                        `${API_BACKEND}/booking/${booking.id}/estados`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            suit_state: SuitState.LISTOENTREGA,
                          }),
                        }
                      );
                      if (res.ok) {
                        toast.success("Traje listo para entregar");
                        await fetchNearBookings();
                      } else {
                        toast.error("Error intente nuevamente");
                      }
                    })
                  }
                >
                  Traje Listo
                </Button>
              </div>
            ) : (
              <div className="flex flex-row gap-1 justify-center">
                <Button
                  size="sm"
                  className="p-2 min-w-6"
                  color="warning"
                  onClick={async () =>
                    handleActionWithConfirmation(async () => {
                      const res = await fetch(
                        `${API_BACKEND}/booking/${booking.id}/estados`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            suit_state: SuitState.MODISTA,
                          }),
                        }
                      );
                      if (res.ok) {
                        toast.success("Traje en Modista");
                        await fetchNearBookings();
                      } else {
                        toast.error("Error intente nuevamente");
                      }
                    })
                  }
                >
                  Modista
                </Button>
                <Button
                  size="sm"
                  className="p-1 min-w-6"
                  color="success"
                  onClick={async () =>
                    handleActionWithConfirmation(async () => {
                      const res = await fetch(
                        `${API_BACKEND}/booking/${booking.id}/estados`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            suit_state: SuitState.LISTOENTREGA,
                          }),
                        }
                      );
                      if (res.ok) {
                        toast.success("Traje listo para entregar");
                        await fetchNearBookings();
                      } else {
                        toast.error("Error intente nuevamente");
                      }
                    })
                  }
                >
                  Traje Listo
                </Button>
              </div>
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

  const handleSearch = (value: string) => {
    if (!value) {
      setFilteredBookings(nearBookings);
    }
    let searchTermLower = value.toLowerCase();
    const filtered = nearBookings?.filter(
      (booking: {
        key: number;
        client_name: string;
        client_phone: string;
        suit: string;
        suit_state: SuitState;
        dress_maker: string;
        observations: string;
        booking_date: string;
        actions: JSX.Element;
      }) =>
        booking.suit.toLowerCase().includes(searchTermLower) ||
        booking.client_name.toLowerCase().includes(searchTermLower) ||
        booking.client_phone.toLowerCase().includes(searchTermLower)
    );
    setFilteredBookings(filtered);
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
      <ConfirmationModal
        ref={modalRef}
        message="¿Está seguro de realizar esta acción?"
      />
      {!isLoading ? (
        <div className="ml-3">
          <div className="header">
            <p className="text-3xl text-red-800 text-center">
              Proximos retiros
            </p>
            <Input
              placeholder="Filtrar por traje, nombre o teléfono"
              onValueChange={(value) => {
                handleSearch(value);
              }}
              className="mb-4"
            />
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
                <TableColumn className="p-2" key={column.key}>
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={filteredBookings || nearBookings}
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
