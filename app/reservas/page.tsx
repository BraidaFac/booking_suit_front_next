'use client';
import { Spinner } from '@nextui-org/react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from '@nextui-org/react';
import { useCallback, useEffect, useState } from 'react';
import { Booking } from '@/lib/utils/Booking';
import { format } from 'date-fns/esm';
import { useRouter } from 'next/navigation';
import { useUserState } from '@/lib/utils/UserState';
import { getCookie } from 'cookies-next';
import { API_BACKEND } from '@/lib/utils/constanst';

const statusColorMap: {} = {
  ACTIVED: 'success',
  CANCELED: 'danger',
  INPROGRESS: 'warning',
  COMPLETED: 'primary',
};
const getStatusBooking = (status) => {
  switch (status) {
    case 'ACTIVED':
      return 'Activo';
    case 'CANCELED':
      return 'Cancelado';
    case 'INPROGRESS':
      return 'En progreso';
    case 'COMPLETED':
      return 'Completado';
    default:
      return 'Desconocido';
  }
};
const columns = [
  {
    name: 'Cliente',
    uid: 'client_name',
  },
  {
    name: 'Cuenta asociada',
    uid: 'account_related',
  },
  {
    name: 'Traje',
    uid: 'suit',
  },

  {
    name: 'Fecha de reserva',
    uid: 'booking_date',
  },
  {
    name: 'Fecha de retiro',
    uid: 'booking_retired_suit',
  },
  {
    name: 'Fecha de devolucion',
    uid: 'booking_return_suit',
  },
  {
    name: 'Estado',
    uid: 'booking_state',
  },
];
export default function Reservas() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useUserState();

  const router = useRouter();

  const fetchBooking = async () => {
    const response = await fetch(`${API_BACKEND}/booking`);
    const data = await response.json();
    setBookings(data);
  };
  const [bookings, setBookings] = useState<Booking[]>([]);

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
      if (user.role === 'LOUNDRY') {
        router.push('/planillas/retirar');
      } else {
        (async () => {
          await fetchBooking();
          setIsLoading(false);
        })();
      }
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
        if (user.role === 'LOUNDRY') {
          router.push('/planillas/retirar');
        } else {
          (async () => {
            await fetchBooking();
            setIsLoading(false);
          })();
        }
      }
    }
  }, []);

  const renderCell = useCallback((booking: Booking, columnKey: any) => {
    const cellValue = booking[columnKey];

    switch (columnKey) {
      case 'client_name':
        return <p>{booking.client_name}</p>;
      case 'booking_date':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {format(new Date(cellValue), 'P')}
            </p>
          </div>
        );
      case 'suit':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue.id}</p>
          </div>
        );
      case 'booking_retired_suit':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {cellValue
                ? format(new Date(cellValue), 'dd/MM/yyyy')
                : 'No retirado'}
            </p>
          </div>
        );
      case 'booking_return_suit':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {cellValue
                ? format(new Date(cellValue), 'dd/MM/yyyy')
                : 'No devuelto'}
            </p>
          </div>
        );

      case 'booking_state':
        return (
          <Chip
            className="capitalize"
            color={
              statusColorMap[
                booking.booking_state as keyof typeof statusColorMap
              ]
            }
            size="sm"
            variant="flat"
          >
            {getStatusBooking(cellValue)}
          </Chip>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <>
      {!isLoading ? (
        <div className="p-3">
          <p className="text-center text-3xl text-red-700">
            Historial reservas
          </p>
          <Table
            aria-label="Example table with custom cells"
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
                <TableColumn
                  key={column.uid}
                  align={column.uid === 'actions' ? 'center' : 'start'}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={bookings}
              isLoading={isLoading}
              emptyContent={isLoading ? null : 'No hay reservas'}
              loadingContent={<Spinner color="white" />}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center">
          <Spinner color="danger" />
        </div>
      )}
    </>
  );
}
