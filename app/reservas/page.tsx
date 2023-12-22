"use client";
import { NextUIProvider } from "@nextui-org/react";
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
  getKeyValue,
} from "@nextui-org/react";
import { EditIcon } from "../../lib/components/EditIcon";
import { useCallback, useEffect, useState } from "react";
import { Booking } from "@/lib/utils/Booking";

const statusColorMap = {
  ACTIVED: "success",
  CANCELED: "danger",
  INPROGRESS: "warning",
  COMPLETED: "success",
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
    name: "Fecha",
    uid: "booking_date",
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
  const fetchBooking = async () => {
    const response = await fetch("http://localhost:3001/booking");
    const data = await response.json();

    setBookings(data);
  };
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => {
    fetchBooking();
  }, []);

  const renderCell = useCallback((booking, columnKey) => {
    const cellValue = booking[columnKey];

    switch (columnKey) {
      case "client_name":
        return (
          <User description={booking.client_name} name={cellValue}>
            {booking.client_name}
          </User>
        );
      case "booking_date":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );
      case "booking_state":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[booking.booking_state]}
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
    <Table aria-label="Example table with custom cells">
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
      <TableBody items={bookings}>
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
