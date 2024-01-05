"use client";
import { NextUIProvider, Spinner } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
} from "@nextui-org/react";
import { EditIcon } from "../../lib/components/EditIcon";
import { useCallback, useEffect, useState } from "react";
import { Booking } from "@/lib/utils/Booking";
import { format } from "date-fns/esm";

const statusColorMap: {} = {
  ACTIVED: "success",
  CANCELED: "danger",
  INPROGRESS: "warning",
  COMPLETED: "primary",
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
  {
    name: "Acciones",
    uid: "actions",
  },
];
export default function Planillas() {
  const [isLoading, setIsLoading] = useState(true);
  const fetchBooking = async () => {
    const response = await fetch("http://localhost:3001/booking");
    const data = await response.json();
    setBookings(data);
    setIsLoading(false);
  };
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => {
    fetchBooking();
  }, []);

  const renderCell = useCallback((booking, columnKey) => {
    const cellValue = booking[columnKey];

    switch (columnKey) {
      case "client_name":
        return <User name={cellValue}>{booking.client_name}</User>;
      case "booking_date":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {format(new Date(cellValue), "P")}
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
              {cellValue ? format(new Date(cellValue), "P") : "No retirado"}
            </p>
          </div>
        );
      case "booking_return_suit":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {cellValue ? format(new Date(cellValue), "P") : "No devuelto"}
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
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit user">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
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
            align={column.uid === "actions" ? "center" : "start"}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={bookings}
        isLoading={isLoading}
        emptyContent={isLoading ? null : "No hay reservas"}
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
  );
}
