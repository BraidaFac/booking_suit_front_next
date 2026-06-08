"use client";
import { Booking, BookingState } from "@/lib/utils/Booking";
import { API_BACKEND } from "@/lib/utils/constanst";
import { generarPlanillaLavanderia } from "@/lib/utils/generarPlanillaLavanderia";
import { Suit, SuitState } from "@/lib/utils/Suit";
import { useUserState } from "@/lib/utils/UserState";
import {
  Button,
  Select,
  SelectItem,
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
import { differenceInDays, format, subWeeks } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const LAVANDERIAS = [
  { key: "Lucecita", label: "Lucecita" },
  { key: "Celia", label: "Celia" },
  { key: "Centro", label: "Centro" },
];

const LAUNDRY_STATES: Record<string, SuitState[]> = {
  Lucecita: [
    SuitState.LAVANDERIALUCECITASUCIO,
    SuitState.LAVANDERIALUCECITALIMPIO,
  ],
  Celia: [SuitState.LAVANDERIACELIASUCIO, SuitState.LAVANDERIACELIALIMPIO],
  Centro: [SuitState.LAVANDERIACENTROSUCIO, SuitState.LAVANDERIACENTROLIMPIO],
};

function getProxReserva(suit: Suit): Date | null {
  if (!suit.bookings?.length) return null;
  const now = new Date();
  const upcoming = suit.bookings
    .filter(
      (b) =>
        new Date(b.booking_date) > now &&
        b.booking_state === BookingState.ACTIVED,
    )
    .sort(
      (a, b) =>
        new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime(),
    );
  return upcoming.length ? new Date(upcoming[0].booking_date) : null;
}

function calcPrioridad(proxReserva: Date | null): string {
  if (!proxReserva) return "-";
  const dias = differenceInDays(proxReserva, new Date());
  if (dias < 15) return "Alta";
  if (dias <= 30) return "Media";
  return "Baja";
}

export default function RetirarLavanderia() {
  const { user, setUser } = useUserState();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedLavanderia, setSelectedLavanderia] = useState<string>("");
  const [rawSuits, setRawSuits] = useState<Suit[]>([]);

  const [suitsToTakeLoundry, setSuitToTakeLoundry] = useState<
    {
      key: string;
      suit_name: string;
      lavanderia: JSX.Element;
      soon_booking: string;
      actions: JSX.Element;
    }[]
  >([]);
  const [suitsInLoundry, setSuitInLoundry] = useState<
    {
      key: string;
      suit_name: string;
      lavanderia: JSX.Element;
      soon_booking: string;
      actions: JSX.Element;
    }[]
  >([]);

  const fetchSuitsLoundry = async () => {
    const resEnLavIn = await fetch(`${API_BACKEND}/suit/laundry/in`);
    const resEnLavToTake = await fetch(`${API_BACKEND}/suit/laundry/take`);

    const suitsToTake: Suit[] = await resEnLavToTake.json();
    const suitsIn: Suit[] = await resEnLavIn.json();

    setRawSuits([...suitsIn, ...suitsToTake]);

    const calcSoonBookingStr = (suit: Suit): string => {
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
        undefined,
      )?.booking_date;
      if (!soon_booking_date_string) return "No tiene";
      const d = new Date(soon_booking_date_string);
      return format(
        new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1),
        "dd/MM/yyyy",
      );
    };

    const lavanderiaTag = (suit: Suit, dirtyState: SuitState) => (
      <div
        className={
          suit.state === dirtyState ||
          suit.state ===
            (dirtyState === SuitState.LAVANDERIALUCECITASUCIO
              ? SuitState.LAVANDERIALUCECITALIMPIO
              : dirtyState === SuitState.LAVANDERIACELIASUCIO
                ? SuitState.LAVANDERIACELIALIMPIO
                : SuitState.LAVANDERIACENTROLIMPIO)
            ? dirtyState === SuitState.LAVANDERIALUCECITASUCIO
              ? "bg-green-500 p-1 rounded-md w-fit"
              : dirtyState === SuitState.LAVANDERIACELIASUCIO
                ? "bg-blue-500 p-1 rounded-md w-fit"
                : "bg-orange-500 p-1 rounded-md w-fit"
            : "bg-gray-400 p-1 rounded-md w-fit"
        }
      >
        {suit.state === SuitState.LAVANDERIALUCECITASUCIO ||
        suit.state === SuitState.LAVANDERIALUCECITALIMPIO
          ? "Lucecita"
          : suit.state === SuitState.LAVANDERIACELIASUCIO ||
              suit.state === SuitState.LAVANDERIACELIALIMPIO
            ? "Celia"
            : "Centro"}
      </div>
    );

    const sortBySoonBooking = (
      a: { soon_booking: string },
      b: { soon_booking: string },
    ) => {
      const pa = a.soon_booking.split("/");
      const pb = b.soon_booking.split("/");
      if (pa.length !== 3 && pb.length !== 3) return 0;
      if (pa.length !== 3) return 1;
      if (pb.length !== 3) return -1;
      const da = new Date(+pa[2], +pa[1] - 1, +pa[0]);
      const db = new Date(+pb[2], +pb[1] - 1, +pb[0]);
      return da.getTime() - db.getTime();
    };

    setSuitInLoundry(
      suitsIn
        .map((suit) => ({
          key: suit.id,
          suit_name: suit.id,
          lavanderia: lavanderiaTag(
            suit,
            suit.state === SuitState.LAVANDERIALUCECITASUCIO
              ? SuitState.LAVANDERIALUCECITASUCIO
              : suit.state === SuitState.LAVANDERIACELIASUCIO
                ? SuitState.LAVANDERIACELIASUCIO
                : SuitState.LAVANDERIACENTROSUCIO,
          ),
          soon_booking: calcSoonBookingStr(suit),
          actions: (
            <Button
              size="sm"
              color="primary"
              onClick={async () => {
                const res = await fetch(`${API_BACKEND}/suit/${suit.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    state:
                      suit.state === SuitState.LAVANDERIALUCECITASUCIO
                        ? SuitState.LAVANDERIALUCECITALIMPIO
                        : suit.state === SuitState.LAVANDERIACELIASUCIO
                          ? SuitState.LAVANDERIACELIALIMPIO
                          : SuitState.LAVANDERIACENTROLIMPIO,
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
        }))
        .sort(sortBySoonBooking),
    );

    setSuitToTakeLoundry(
      suitsToTake
        .map((suit) => ({
          key: suit.id,
          suit_name: suit.id,
          lavanderia: lavanderiaTag(
            suit,
            suit.state === SuitState.LAVANDERIALUCECITALIMPIO
              ? SuitState.LAVANDERIALUCECITASUCIO
              : suit.state === SuitState.LAVANDERIACELIALIMPIO
                ? SuitState.LAVANDERIACELIASUCIO
                : SuitState.LAVANDERIACENTROSUCIO,
          ),
          soon_booking: calcSoonBookingStr(suit),
          actions: (
            <Button
              size="sm"
              color="primary"
              onClick={async () => {
                const res = await fetch(`${API_BACKEND}/suit/${suit.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ state: SuitState.ENLOCALLIMPIO }),
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
        }))
        .sort(sortBySoonBooking),
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
      setUser({ name: user.username, role: user.role });
      await fetchSuitsLoundry();
      setIsLoading(false);
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
          setIsLoading(false);
        })();
      }
    }
  }, []);

  const handleGenerarPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const allowedStates = LAUNDRY_STATES[selectedLavanderia] ?? [];
      const filtered = rawSuits.filter((s) =>
        allowedStates.includes(s.state as SuitState),
      );
      const items = filtered.map((suit) => {
        const proxReserva = getProxReserva(suit);
        return {
          codigo: String(suit.id),
          proxReserva: proxReserva
            ? format(proxReserva, "dd/MM/yyyy")
            : "Sin reserva",
          fechaSugeridaEntrega: proxReserva
            ? format(subWeeks(proxReserva, 1), "dd/MM/yyyy")
            : "-",
          prioridad: calcPrioridad(proxReserva),
        };
      });
      await generarPlanillaLavanderia(
        items,
        selectedLavanderia,
        format(new Date(), "yyyy-MM-dd"),
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const columns = [
    { key: "suit_name", label: "Traje" },
    { key: "lavanderia", label: "Lavanderia" },
    { key: "soon_booking", label: "Proxima reserva" },
    { key: "actions", label: "Acciones" },
  ];

  return (
    <>
      {isLoading ? (
        <div className="text-center">
          <Spinner color="danger" />
        </div>
      ) : (
        <main className="flex flex-col w-full">
          <div className="flex items-center justify-end gap-2 px-2 mb-3">
            <Select
              size="sm"
              placeholder="Lavandería..."
              className="max-w-44"
              variant="bordered"
              classNames={{
                trigger: "border-2 border-danger-400 hover:border-danger-300",
              }}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as string;
                setSelectedLavanderia(val ?? "");
              }}
            >
              {LAVANDERIAS.map((lav) => (
                <SelectItem key={lav.key}>{lav.label}</SelectItem>
              ))}
            </Select>
            <Button
              color="danger"
              size="sm"
              isLoading={isGeneratingPdf}
              isDisabled={!selectedLavanderia || rawSuits.length === 0}
              onClick={handleGenerarPdf}
              className="font-semibold"
            >
              Generar PDF
            </Button>
          </div>
          <div className="w-full px-2">
            <div className="header">
              <p className="text-3xl text-red-800 text-center">
                Retirar Lavanderia
              </p>
            </div>

            <div className="">
              <Table
                aria-label="Trajes para retirar de lavanderia"
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
                aria-label="Trajes en lavanderia"
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
                    isLoading ? null : "No hay trajes en lavanderia"
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
