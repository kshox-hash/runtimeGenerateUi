import { getPdfConfig } from "../services/pdf-config.service";
import { ViewConfig } from "../types/runtime";

export async function buildRuntimeConfigFromSavedPdf(
  userId: string,
  leadId: string
): Promise<ViewConfig> {
  console.log("🔵 buildRuntimeConfigFromSavedPdf()");
  console.log("userId:", userId);
  console.log("leadId:", leadId);

  const saved = await getPdfConfig(userId);

  console.log("🟡 resultado getPdfConfig:", JSON.stringify(saved, null, 2));

  if (!saved) {
    console.log("🔴 NO existe config en DB para este userId");
    throw new Error("No existe configuración PDF para este usuario.");
  }

  if (!saved.products || saved.products.length === 0) {
    console.log("⚠️ config existe pero SIN productos");
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
            label: "Mensaje",
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