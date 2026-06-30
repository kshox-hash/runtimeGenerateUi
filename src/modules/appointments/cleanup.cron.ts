import cron from "node-cron";
import DB from "../../db/db_configuration";

async function runCleanupJob(): Promise<void> {
  const pool = DB.getPool();
  const result = await pool.query<{ id: string }>(`
    WITH expired_bookings AS (
      SELECT id FROM calendar_bookings
      WHERE status = 'pending_payment' AND expires_at <= NOW()
    ),
    deleted_payments AS (
      DELETE FROM payments
      WHERE booking_id IN (SELECT id FROM expired_bookings) AND status <> 'paid'
      RETURNING id
    )
    DELETE FROM calendar_bookings
    WHERE id IN (SELECT id FROM expired_bookings)
    RETURNING id
  `);
  if (result.rowCount && result.rowCount > 0) {
    console.log(`[cleanup] ${result.rowCount} reserva(s) vencidas eliminadas (con sus pagos huérfanos)`);
  }
}

export function startCleanupCron(): void {
  // Cada 15 minutos: limpia reservas cuyo window de pago (45 min) ya venció
  cron.schedule("*/15 * * * *", () => {
    runCleanupJob().catch((err) =>
      console.error("[cleanup] Error inesperado:", err)
    );
  });
  console.log("[cleanup] Cron de limpieza de reservas iniciado (cada 15 min)");
}
