import { getPdfConfig } from "../services/pdf-config.service";
import { ViewConfig } from "../types/runtime";

export async function buildRuntimeConfigFromSavedPdf(
  userId: string,
  leadId: string
): Promise<ViewConfig> {
  const saved = await getPdfConfig(userId);

  if (!saved) {
    throw new Error("No existe configuración PDF para este usuario.");
  }

  return {
    brand: saved.businessName || "Automatiza Fácil",
    title: "Cotización Inteligente",
    subtitle:
      saved.businessSubtitle || "Selecciona productos y envía tu solicitud.",
    successMessage: "Solicitud enviada correctamente.",
    recipientPhone: leadId,
    components: [
      {
        type: "products",
        items: saved.products.map((p, index) => ({
          id: p.code || `p${index + 1}`,
          name: p.name,
          price: p.price,
          description: p.description || "",
        })),
      },
      {
        type: "form",
        fields: [
          {
            name: "name",
            label: "Nombre completo",
            inputType: "text",
            required: true,
            placeholder: "Ej: Juan Pérez",
          },
          {
            name: "email",
            label: "Correo electrónico",
            inputType: "email",
            required: true,
            placeholder: "Ej: juan@correo.com",
          },
          {
            name: "phone",
            label: "Teléfono",
            inputType: "tel",
            required: false,
            placeholder: "Ej: +56 9 1234 5678",
          },
          {
            name: "notes",
            label: "Mensaje (opcional)",
            inputType: "textarea",
            required: false,
            placeholder: `Lead: ${leadId}`,
          },
        ],
      },
      {
        type: "button",
        label: "Enviar Cotización",
        action: { type: "submit" },
      },
    ],
  };
}