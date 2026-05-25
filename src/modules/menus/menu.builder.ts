import { BASE_URL } from "../../config/env";
import { getPdfConfig } from "../quotes/quote-config.service";
import { ViewConfig, MenuModuleItem } from "../../runtime/runtime";
import { findEnabledModulesByUserId } from "./user-modules.repository";

function buildModuleUrl(
  module: MenuModuleItem,
  userId: string,
  leadId: string
): string {
  const safeLeadId = String(leadId || "").replace(/\D/g, "");

  switch (module.code) {
    case "quote":
      return `${BASE_URL}/open/cotizador-dinamico/${userId}/${safeLeadId}`;
      
    case "appointments":
      return `${BASE_URL}/open/calendar/${userId}/${safeLeadId}`;

    default:
      return "#";
  }
}

export async function buildMenuConfig(
  userId: string,
  leadId: string
): Promise<ViewConfig> {
  const savedPdfConfig = await getPdfConfig(userId).catch(() => null);

  const brand = savedPdfConfig?.businessName || "Automatiza Fácil";

  const modules = await findEnabledModulesByUserId(userId);

  const modulesWithUrls = modules.map((module) => ({
    ...module,
    url: buildModuleUrl(module, userId, leadId),
  }));

  return {
    viewType: "menu",
    userId,
    leadId,
    recipientPhone: leadId,
    brand,
    title: "Menú de servicios",
    subtitle: "Selecciona el módulo que quieres utilizar.",
    successMessage: "Solicitud enviada correctamente.",
    modules: modulesWithUrls,
    components: [],
  };
}