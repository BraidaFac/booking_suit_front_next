"use client";
import { Button, Spinner } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { Booking } from "@/lib/utils/Booking";
import { format } from "date-fns/esm";
import { useRouter } from "next/navigation";
import { useAuth } from "../login/hooks/useAuth";
import { API_BACKEND } from "@/lib/utils/constanst";
import useSWR, { mutate } from "swr";

const statusColorMap: {} = {
  ACTIVED: "success",
  CANCELED: "danger",
  INPROGRESS: "warning",
  COMPLETED: "primary",
};
const getStatusBooking = (
  status: "ACTIVED" | "CANCELED" | "INPROGRESS" | "COMPLETED"
) => {
  switch (status) {
    case "ACTIVED":
      return "Activo";
    case "CANCELED":
      return "Cancelado";
    case "INPROGRESS":
      return "En progreso";
    case "COMPLETED":
      return "Completado";
    default:
      return "Desconocido";
  }
};
const columns = [
  {
    name: "Cliente",
    uid: "client_name",
  },
  {
    name: "Cuenta asociada",
    uid: "account_related",
  },
  {
    name: "Traje",
    uid: "suit",
  },

  {
    name: "Fecha de reserva",
    uid: "booking_date",
  },
  {
    name: "Fecha de retiro",
    uid: "booking_retired_suit",
  },
  {
    name: "Fecha de devolucion",
    uid: "booking_return_suit",
  },
  {
    name: "Estado",
    uid: "booking_state",
  },
];

// Función para obtener las reservas
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Error recuperando reservas");
  }
  return response.json();
};

export default function Reservas() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Usar SWR para obtener las reservas
  const {
    data: bookings,
    error,
    mutate,
    isLoading: isBookingsLoading = true,
  } = useSWR<Booking[]>(
    user && user.role !== "LOUNDRY" ? `${API_BACKEND}/booking` : null, // Hacer fetch sólo si el usuario no es LOUNDRY
    fetcher,
    {
      onSuccess: (data) => {
        // Ordenar los bookings por fecha aquí
        const sortedBookings = data.sort(
          (a, b) =>
            new Date(b.booking_date).getTime() -
            new Date(a.booking_date).getTime()
        );
        // Actualizar los datos ordenados
        mutate(sortedBookings, false);
      },
    }
  );

  // Redirigir si el usuario es LOUNDRY
  useEffect(() => {
    if (!isAuthLoading && user?.role === "LAUNDRY") {
      router.push("/planillas/retirar");
    }
  }, [isAuthLoading, user, router]);

  const renderCell = useCallback((booking: Booking, columnKey: any) => {
    const cellValue = (booking as any)[columnKey];

    switch (columnKey) {
      case "client_name":
        return <p>{booking.client_name}</p>;
      case "booking_date":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {format(new Date(cellValue), "dd/MM/yyyy")}
            </p>
          </div>
        );
      case "suit":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue.id}</p>
          </div>
        );
      case "booking_retired_suit":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {cellValue
                ? format(new Date(cellValue), "dd/MM/yyyy")
                : "No retirado"}
            </p>
          </div>
        );
      case "booking_return_suit":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {cellValue
                ? format(new Date(cellValue), "dd/MM/yyyy")
                : "No devuelto"}
            </p>
          </div>
        );

      case "booking_state":
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

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600 text-xl">Error al cargar las reservas</p>
        <p>Por favor, intenta nuevamente más tarde o revisa tu conexión.</p>
        <Button color="primary" onClick={() => mutate()}>
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  // Si la autenticación o la carga de reservas está en curso, mostrar un spinner
  if (isAuthLoading || isBookingsLoading) {
    return (
      <div className="text-center">
        <Spinner color="danger" />
      </div>
    );
  }

  return (
    <div className="p-3">
      <p className="text-center text-3xl text-red-700">Historial reservas</p>
      <Table
        isHeaderSticky
        bottomContent={
          isBookingsLoading ? (
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
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={bookings || []}
          isLoading={isBookingsLoading}
          emptyContent={isBookingsLoading ? null : "No hay reservas"}
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
  );
}
