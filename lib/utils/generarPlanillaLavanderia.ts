import { format } from "date-fns";

export interface ItemPlanillaLavanderia {
  codigo: string;
  proxReserva: string;
  fechaSugeridaEntrega: string;
  prioridad: string;
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9À-ÿ]/g, "_");
}

export async function generarPlanillaLavanderia(
  items: ItemPlanillaLavanderia[],
  entityName: string,
  fecha: string // ISO YYYY-MM-DD
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const marginLeft = 14;
  let cursorY = 10;

  // Logo — styled text block simulating a logo
  const logoW = 60;
  const logoH = 12;
  doc.setFillColor(28, 28, 60);
  doc.roundedRect(marginLeft, cursorY, logoW, logoH, 2, 2, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Casa Sonia", marginLeft + logoW / 2, cursorY + logoH / 2 + 2, {
    align: "center",
  });
  doc.setTextColor(0, 0, 0);
  cursorY += logoH + 6;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Planilla de envío a lavandería", marginLeft, cursorY);
  cursorY += 8;

  // Subtitle lines
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const fechaFormatted = format(new Date(fecha + "T12:00:00"), "dd/MM/yyyy");

  doc.text(`Lavandería: ${entityName}`, marginLeft, cursorY);
  cursorY += 6;
  doc.text(`Fecha: ${fechaFormatted}`, marginLeft, cursorY);
  cursorY += 6;
  doc.text(`Cantidad de prendas: ${items.length}`, marginLeft, cursorY);
  cursorY += 8;

  // Table
  autoTable(doc, {
    startY: cursorY,
    head: [["Código", "Próx. Reserva", "F. Sug. Entrega", "Prioridad"]],
    body: items.map((item) => [
      item.codigo,
      item.proxReserva,
      item.fechaSugeridaEntrega,
      item.prioridad,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [40, 40, 80] },
    alternateRowStyles: { fillColor: [245, 245, 250] },
  });

  // Save
  const dateNoHyphens = fecha.replace(/-/g, "");
  const sanitized = sanitizeName(entityName);
  doc.save(`${sanitized}_${dateNoHyphens}.pdf`);
}
