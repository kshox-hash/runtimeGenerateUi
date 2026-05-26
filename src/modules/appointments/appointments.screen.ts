import { RuntimeLinkRecord } from "../../runtime/runtime";
import { escapeHtml } from "../../utils/html";

import { renderBookingHtmlShell } from "../../runtime/booking/bookingHtmlShell";
import { renderBookingStyles } from "../../runtime/booking/bookingStyles";
import { renderBookingScript } from "../../runtime/booking/scripts/bookingScript";


export function renderBookingHtml(record: RuntimeLinkRecord): string {
  const viewModel = {
    token: record.token,
    title: escapeHtml(record.config.title || "Reservar hora"),
    brand: escapeHtml(record.config.brand || "amaru electric"),
    subtitle: escapeHtml(
      record.config.subtitle ||
        "Elige el día y la hora que mejor se adapte a ti."
    ),
    successMessage: escapeHtml(
      record.config.successMessage || "¡Hora reservada correctamente!"
    ),
    expiresAtFormatted: escapeHtml(
      new Date(record.expiresAt).toLocaleString("es-CL")
    ),
  };

  return renderBookingHtmlShell({
    ...viewModel,
    styles: renderBookingStyles(),
    script: renderBookingScript({
      token: viewModel.token,
      successMessage: viewModel.successMessage,
    }),
  });
}