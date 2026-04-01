import { ViewConfig } from "../types/runtime";

export function buildCotizadorConfig(leadId: string): ViewConfig {
  return {
    brand: "Automatiza Fácil",
    title: "Cotización Inteligente",
    subtitle: "Selecciona productos y envía tu solicitud.",
    successMessage: "Solicitud enviada correctamente.",
    recipientPhone: leadId,
    components: [
      {
        type: "products",
        items: [
          {
            id: "p1",
            name: "Bot de Cotización",
            price: 120000,
            description: "Automatiza cotizaciones por chat y genera propuestas.",
          },
          {
            id: "p2",
            name: "Generación de PDF",
            price: 60000,
            description: "Crea cotizaciones en PDF listas para enviar.",
          },
          {
            id: "p3",
            name: "Integración WhatsApp",
            price: 80000,
            description: "Conecta el flujo de cotización con WhatsApp.",
          },
        ],
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

export function buildReservasConfig(leadId: string): ViewConfig {
  return {
    brand: "Automatiza Fácil",
    title: "Toma de Horas",
    subtitle: "Prueba una experiencia de reservas por WhatsApp.",
    successMessage: "Solicitud enviada correctamente.",
    recipientPhone: leadId,
    components: [
      {
        type: "products",
        items: [
          {
            id: "r1",
            name: "Agenda Básica",
            price: 90000,
            description: "Sistema de reservas para tomar horas.",
          },
          {
            id: "r2",
            name: "Recordatorios",
            price: 40000,
            description: "Reduce inasistencias con recordatorios automáticos.",
          },
          {
            id: "r3",
            name: "Reservas por WhatsApp",
            price: 70000,
            description: "Tus clientes reservan directamente desde el chat.",
          },
        ],
      },
      {
        type: "form",
        fields: [
          {
            name: "name",
            label: "Nombre completo",
            inputType: "text",
            required: true,
            placeholder: "Ej: María González",
          },
          {
            name: "email",
            label: "Correo electrónico",
            inputType: "email",
            required: true,
            placeholder: "Ej: maria@correo.com",
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
        label: "Solicitar Demo",
        action: { type: "submit" },
      },
    ],
  };
}

export function buildChatbotConfig(leadId: string): ViewConfig {
  return {
    brand: "Automatiza Fácil",
    title: "Chatbot Inteligente",
    subtitle: "Descubre cómo automatizar respuestas y atención.",
    successMessage: "Solicitud enviada correctamente.",
    recipientPhone: leadId,
    components: [
      {
        type: "products",
        items: [
          {
            id: "c1",
            name: "Chatbot Base",
            price: 100000,
            description: "Responde consultas frecuentes automáticamente.",
          },
          {
            id: "c2",
            name: "Captura de Leads",
            price: 50000,
            description: "Recoge datos de clientes dentro del chat.",
          },
          {
            id: "c3",
            name: "Soporte Automatizado",
            price: 85000,
            description: "Ordena consultas y mejora la atención.",
          },
        ],
      },
      {
        type: "form",
        fields: [
          {
            name: "name",
            label: "Nombre completo",
            inputType: "text",
            required: true,
            placeholder: "Ej: Pedro Soto",
          },
          {
            name: "email",
            label: "Correo electrónico",
            inputType: "email",
            required: true,
            placeholder: "Ej: pedro@correo.com",
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
        label: "Solicitar Información",
        action: { type: "submit" },
      },
    ],
  };
}