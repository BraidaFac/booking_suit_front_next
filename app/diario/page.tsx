"use client";
import { Button, getKeyValue, Spinner, useDisclosure } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { Booking, BookingState, mapBookingState } from "@/lib/utils/Booking";
import { format, isSameDay } from "date-fns/esm";
import { useRouter } from "next/navigation";
import { useAuth } from "../login/hooks/useAuth";
import { API_BACKEND } from "@/lib/utils/constanst";
import useSWR from "swr";
import CalendarReservas from "@/lib/components/CalendarReservas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatMonth } from "@/lib/utils/date_formatter";
import { getState, SuitState } from "@/lib/utils/Suit";

// Función para obtener las reservas
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Error recuperando reservas");
  }
  return response.json();
};

export default function Diario() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null); // Estado para la reserva seleccionada
  const [selectedViewCal, setSelectedViewCal] = useState<boolean>(true); // si selected ViewEsta en true es vista calendario

  const router = useRouter();

  // Usar SWR para obtener las reservas
  const {
    data: bookings,
    error,
    mutate,
    isLoading: isBookingsLoading = true,
  } = useSWR<Booking[]>(`${API_BACKEND}/booking`, fetcher);

  // Función para agrupar las reservas por día
  const groupBookingsByDate = (bookings: Booking[]) => {
    return bookings.reduce((acc, booking) => {
      const bookingDate = format(new Date(booking.booking_date), "dd/MM/yyyy");
      if (!acc[bookingDate]) {
        acc[bookingDate] = [];
      }
      acc[bookingDate].push(booking);
      return acc;
    }, {} as Record<string, Booking[]>); // Crear un objeto donde las claves son las fechas
  };

  // Función para renderizar las filas de la tabla por día
  const renderCell = useCallback((booking: Booking, columnKey: any) => {
    const cellValue = (booking as any)[columnKey];

    switch (columnKey) {
      case "suit":
        return <p>{booking.suit?.id}</p>; // Mostrar el ID del traje
      case "observations":
        return <p>{booking.observations || "-"}</p>; // Mostrar las observaciones
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
      <div className="text-center ">
        <Spinner color="danger" />
      </div>
    );
  }

  // Agrupar reservas por día
  const groupedBookings = groupBookingsByDate(
    bookings?.filter((booking: Booking) => {
      const bookingDate = new Date(booking.booking_date);
      const today = new Date();

      // Comparar si la reserva está activa y es del mismo día o después
      return (
        (booking.booking_state === BookingState.ACTIVED ||
          booking.booking_state === BookingState.INPROGRESS) &&
        (isSameDay(bookingDate, today) ||
          bookingDate.getTime() >= today.getTime())
      );
    }) || []
  );

  // Obtener las fechas de reserva y ordenarlas
  const sortedDates = Object.keys(groupedBookings).sort((a: any, b: any) => {
    const date_splited_a = a.split("/");
    const date_splited_b = b.split("/");
    if (date_splited_a.length !== 3 && date_splited_b.length !== 3) return 0;
    else if (date_splited_a.length !== 3) return 1;
    else if (date_splited_b.length !== 3) return -1;
    const date_a = new Date(
      +date_splited_a[2],
      +date_splited_a[1] - 1,
      +date_splited_a[0]
    );
    const date_b = new Date(
      +date_splited_b[2],
      +date_splited_b[1] - 1,
      +date_splited_b[0]
    );

    return date_a.getTime() < date_b.getTime() ? -1 : 1;
  });
  // Si no hay reservas, mostrar un mensaje
  if (sortedDates.length === 0) {
    return (
      <div className="text-center">
        <p className="text-xl text-red-600">No hay reservas disponibles</p>
      </div>
    );
  }

  const groupBookingsByMonth = (bookings: Booking[]) => {
    const bookingsByMonth: { [key: string]: Booking[] } = bookings.reduce(
      (acc, booking) => {
        const bookingMonth = format(
          new Date(booking.booking_date),
          "MMMM yyyy"
        );
        if (!acc[bookingMonth]) {
          acc[bookingMonth] = [];
        }
        acc[bookingMonth].push(booking);
        return acc;
      },
      {} as Record<string, Booking[]>
    ); // Crear un objeto donde las claves son los meses

    // Obtener los meses ordenados cronológicamente
    const sortedMonths = Object.keys(bookingsByMonth).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
    return { bookingsByMonth, sortedMonths };
  };
  // Función para generar el PDF
  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    const { bookingsByMonth, sortedMonths } = groupBookingsByMonth(
      bookings || []
    );
    const pageWidth = doc.internal.pageSize.getWidth();
    sortedMonths.forEach((month, index) => {
      if (index !== 0) {
        doc.addPage(); // Agregar una nueva página para cada mes excepto el primero
      }

      // Título del mes
      doc.setFontSize(18);
      const textWidth = doc.getTextWidth(
        `Reservas ${formatMonth(new Date(month))}`
      );
      const xPos = (pageWidth - textWidth) / 2;
      doc.text(`Reservas ${formatMonth(new Date(month))}`, xPos, 10);
      // Posición X centrada
      // Preparamos los datos para la tabla
      const tableData = bookingsByMonth[month]
        .sort((a: Booking, b: Booking) => {
          return (
            new Date(a.booking_date).getTime() -
            new Date(b.booking_date).getTime()
          );
        })
        .map((booking: Booking) => [
          format(new Date(booking.booking_date), "dd/MM/yyyy"), // Fecha de la reserva
          booking.client_name, // Nombre del cliente
          booking.client_phone, // Teléfono del cliente
          booking.suit.id, // ID del traje
          booking.observations || "-", // Observaciones
          mapBookingState(booking.booking_state), // Estado de la reserva
        ]);

      // Crear la tabla con autoTable
      autoTable(doc, {
        head: [
          [
            "Fecha",
            "Cliente",
            "Teléfono",
            "Traje",
            "Observaciones",
            "Estado de la reserva",
          ],
        ],
        body: tableData,
        startY: 20, // A partir de qué altura empieza la tabla
        margin: { top: 5, bottom: 5 },
      });
    });

    // Descargar el archivo PDF
    doc.save(`reservas.pdf`);
  };

  return (
    <>
      <Modal
        onClose={() => setSelectedBooking(null)}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
      >
        <ModalContent className="w-2/3 md:max-w-3xl">
          {selectedBooking ? (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Informacion de reserva{" "}
                {format(new Date(selectedBooking?.booking_date), "dd/MM/yyyy")}
              </ModalHeader>
              <ModalBody className="flex md:flex-row md:gap-10 flex-col gap-5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">
                    Información del Cliente
                  </h3>
                  <p>
                    <strong>Nombre:</strong> {selectedBooking?.client_name}
                  </p>
                  <p>
                    <strong>DNI:</strong> {selectedBooking?.client_dni}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {selectedBooking?.client_phone}
                  </p>
                </div>
                {/* Detalles de la Reserva */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">
                    Detalles de la Reserva
                  </h3>
                  <p>
                    <strong>Fecha de Reserva:</strong>{" "}
                    {format(
                      new Date(selectedBooking?.booking_date),
                      "dd/MM/yyyyy"
                    )}
                  </p>
                  <p>
                    <strong>Estado de la Reserva:</strong>{" "}
                    {selectedBooking?.booking_state}
                  </p>
                  <p>
                    <strong>Observaciones:</strong>{" "}
                    {selectedBooking.observations || "-"}
                  </p>
                  <p>
                    <strong>Modista:</strong>{" "}
                    {selectedBooking.dressmaker ? "Sí" : "No"}
                  </p>
                </div>

                {/* Detalles del Traje */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">
                    Detalles del Traje
                  </h3>
                  <p>
                    <strong>ID del Traje:</strong> {selectedBooking.suit.id}
                  </p>
                  <p>
                    <strong>Marca:</strong> {selectedBooking.suit.brand}
                  </p>
                  <p>
                    <strong>Categoría:</strong> {selectedBooking.suit.category}
                  </p>
                  <p>
                    <strong>Talla:</strong> {selectedBooking.suit.size}
                  </p>
                  <p>
                    <strong>Color:</strong> {selectedBooking.suit.color}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    {getState(selectedBooking.suit.state as SuitState)}
                  </p>
                </div>
              </ModalBody>
            </>
          ) : (
            <div className="text-center p-4">
              <p className="text-red-500">
                No hay datos de la reserva disponibles.
              </p>
            </div>
          )}
        </ModalContent>
      </Modal>

      {/* Botón para descargar PDF */}
      <div className="absolute right-4 ">
        <Button
          color="secondary"
          onClick={handleDownloadPDF} // Función que genera y descarga el PDF
        >
          Descargar PDF
        </Button>
      </div>
      <div className="p-3">
        <p className="text-3xl text-red-700">Calendario de reservas</p>
        <div className="flex flex-row w-1/2 mx-auto justify-center gap-3">
          <Button
            className={`transition-all duration-300 ease-in-out px-4 py-2 rounded-xl ${
              selectedViewCal
                ? "bg-blue-500 text-white border-blue-700 shadow-lg"
                : "bg-gray-200 text-gray-800 border-gray-300"
            } hover:bg-blue-400 hover:text-white`}
            onClick={() => setSelectedViewCal(true)}
          >
            Vista Calendario
          </Button>
          <Button
            className={`transition-all duration-300 ease-in-out px-4 py-2 rounded-xl ${
              !selectedViewCal
                ? "bg-blue-500 text-white border-blue-700 shadow-lg"
                : "bg-gray-200 text-gray-800 border-gray-300"
            } hover:bg-blue-400 hover:text-white`}
            onClick={() => setSelectedViewCal(false)}
          >
            Vista Diaria
          </Button>
        </div>
        {!selectedViewCal ? (
          <div className="md:grid md:grid-cols-3 gap-3 flex flex-col px-2">
            {/* Recorrer las fechas ordenadas para generar una tabla por día */}
            {sortedDates.map((date) => (
              <div key={date} className="mb-2 w-full  mx-auto">
                <div className="bg-gray-200 p-2 mt-3 rounded-lg shadow-lg">
                  <h3 className="text-2xl mb-4 text-center text-black">
                    {`Fecha ${date}`}
                  </h3>
                  <Table
                    color="secondary"
                    classNames={{
                      wrapper: ["max-h-[382px]", "max-w-3xl", "bg-gray-200"],
                      th: ["bg-gray-300"], // Color fijo para el header
                      tr: ["border-2", "min-h-[12px]"], // Estilos comunes para tr
                      td: ["bg-transparent"],
                    }}
                    selectionBehavior="toggle"
                    bottomContent={
                      isBookingsLoading ? (
                        <div className="flex w-full justify-center">
                          <Spinner color="danger" />
                        </div>
                      ) : null
                    }
                    aria-label={`Reservas del día ${date},
              )}`}
                    isHeaderSticky
                  >
                    <TableHeader>
                      <TableColumn>Traje</TableColumn>
                      <TableColumn>Observaciones</TableColumn>
                    </TableHeader>
                    <TableBody
                      emptyContent={
                        isBookingsLoading ? null : "No hay reservas"
                      }
                    >
                      {groupedBookings[date].map((booking) => (
                        <TableRow
                          className="hover:bg-gray-400" // Estilo on especificidad alta
                          style={{
                            borderRadius: "10rem !important", // Forzar los bordes redondeados
                          }}
                          onClick={() => {
                            setSelectedBooking(booking);
                            onOpenChange();
                          }}
                          key={booking.id}
                        >
                          <TableCell>{renderCell(booking, "suit")}</TableCell>
                          <TableCell>
                            {renderCell(booking, "observations")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <CalendarReservas />
        )}
      </div>
    </>
  );
}
