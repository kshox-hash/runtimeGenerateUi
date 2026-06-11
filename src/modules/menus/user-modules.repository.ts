import DB from "../../db/db_configuration";
import { MenuModuleItem } from "../../runtime/runtime.types";

const DEFAULT_MODULES: MenuModuleItem[] = [
  {
    code: "cotizador",
    title: "Cotizador",
    description: "Selecciona productos o servicios y envía una solicitud de cotización.",
    icon: "🧾",
    enabled: true,
    sortOrder: 1,
  },
  {
    code: "reservas",
    title: "Reservas",
    description: "Agenda una hora seleccionando servicio, día y horario.",
    icon: "📅",
    enabled: true,
    sortOrder: 2,
  },
];

export async function findEnabledModulesByUserId(
  userId: string
): Promise<MenuModuleItem[]> {
  try {
    const res = await DB.getPool().query(
      `
      SELECT
        module_code,
        title,
        description,
        icon,
        enabled,
        sort_order
      FROM user_modules
      WHERE user_id = $1
        AND enabled = true
      ORDER BY sort_order ASC
      `,
      [userId]
    );

    if (!res.rowCount) {
      return DEFAULT_MODULES;
    }

    return res.rows.map((row) => ({
      code: row.module_code,
      title: row.title,
      description: row.description,
      icon: row.icon || "🔹",
      enabled: row.enabled,
      sortOrder: Number(row.sort_order || 0),
    }));
  } catch (error: any) {
    console.warn("No se pudo leer user_modules. Usando módulos por defecto.");
    return DEFAULT_MODULES;
  }
}