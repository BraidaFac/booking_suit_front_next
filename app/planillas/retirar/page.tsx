'use client';
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
  useUser,
} from '@nextui-org/react';
import { Suit, SuitState } from '@/lib/utils/Suit';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSuitContext } from '@/lib/components/SuitContext';
import { useUserState } from '@/lib/utils/UserState';
import { getCookie } from 'cookies-next';
import { Booking, BookingState } from '@/lib/utils/Booking';
import { API_BACKEND } from '@/lib/utils/constanst';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

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
    const res = await fetch(`${API_BACKEND}/suit`);
    const suits = await res.json();

    const suitsToTakeLoundry = suits.filter((suit: Suit) => {
      return suit.state === SuitState.LAVANDERIALIMPIO;
    });
    const suitsInLoundry = suits.filter((suit: Suit) => {
      return suit.state === SuitState.LAVANDERIASUCIO;
    });

    setSuitInLoundry(
      suitsInLoundry.map((suit: Suit) => {
        const soon_booking_date = suit.bookings.reduce(
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
          key: suit.id,
          suit_name: suit.id,
          suit_color: suit.color,
          soon_booking: soon_booking_date
            ? format(new Date(soon_booking_date), 'dd/MM/yyyy')
            : 'No tiene',
          actions: (
            <Button
              size="sm"
              color="primary"
              onClick={async () => {
                const res = await fetch(`${API_BACKEND}/suit/${suit.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    state: SuitState.LAVANDERIALIMPIO,
                  }),
                });
                if (res.ok) {
                  toast.success('Traje limpio');
                  await fetchSuitsLoundry();
                } else {
                  toast.error('Error intente nuevamente');
                }
              }}
            >
              Limpio
            </Button>
          ),
        };
      })
    );
    setSuitToTakeLoundry(
      suitsToTakeLoundry.map((suit: Suit) => {
        const soon_booking_date = suit.bookings.reduce(
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
          key: suit.id,
          suit_name: suit.id,
          soon_booking: soon_booking_date
            ? format(new Date(soon_booking_date), 'dd/MM/yyyy')
            : 'No tiene',
          suit_color: suit.color,
          actions: (
            <Button
              size="sm"
              color="primary"
              onClick={async () => {
                const res = await fetch(`${API_BACKEND}/suit/${suit.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    state: SuitState.ENLOCALLIMPIO,
                  }),
                });
                if (res.ok) {
                  toast.success('Traje retirado');
                  await fetchSuitsLoundry();
                } else {
                  toast.error('Error al entregar el traje');
                }
              }}
            >
              Entregado
            </Button>
          ),
        };
      })
    );
  };
  const fetchUser = async (token: string) => {
    const res = await fetch(`${API_BACKEND}/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      router.push('/login');
    }
  };
  useEffect(() => {
    const token_cookie = getCookie('Authorization');
    const token = token_cookie ? token_cookie.split(' ')[1] : '';
    if (!token) {
      router.push('/login');
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

  const columns = [
    {
      key: 'suit_name',
      label: 'Traje',
    },
    {
      key: 'suit_color',
      label: 'Color',
    },
    { key: 'soon_booking', label: 'Proxima reserva' },
    { key: 'actions', label: 'Acciones' },
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
                      : 'No hay trajes para retirar de lavanderia'
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
                    isLoading ? null : 'No hay trajes  en lavanderia'
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
