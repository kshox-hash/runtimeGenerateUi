import DB from "../../db/db_configuration";

export class StatisticsRepository {
  private pool = DB.getPool();

  /**
   * Incrementa el contador TOTAL (acumulado de siempre, igual que antes)
   * Y ADEMÁS incrementa el contador del DÍA DE HOY (nuevo).
   *
   * Ambas escrituras se hacen dentro de una transacción:
   * - Si las dos funcionan -> COMMIT (se guardan ambas)
   * - Si alguna falla -> ROLLBACK (no se guarda ninguna)
   * Esto evita que el total y el historial diario queden
   * desincronizados.
   */
  async increment(
    userId: string,
    metric: string,
    moduleId?: string | null
  ): Promise<void> {
    // Sacamos una conexión dedicada del pool para poder usar
    // BEGIN / COMMIT / ROLLBACK (transacción)
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // 1) Igual que tu código original: suma 1 al total acumulado
      await client.query(
        `
        INSERT INTO statistics (user_id, module_id, metric, count, updated_at)
        VALUES ($1, $2, $3, 1, NOW())
        ON CONFLICT (user_id, module_id, metric)
        DO UPDATE SET count = statistics.count + 1, updated_at = NOW()
        `,
        [userId, moduleId ?? '', metric]
      );

      // 2) NUEVO: suma 1 al contador de HOY en statistics_daily
      //    COALESCE(module_id, '') convierte NULL en '' para que
      //    el índice único funcione (Postgres no compara NULL = NULL)
      await client.query(
        `
        INSERT INTO statistics_daily (user_id, module_id, metric, day, count, updated_at)
        VALUES ($1, $2, $3, CURRENT_DATE, 1, NOW())
        ON CONFLICT (user_id, metric, day, (COALESCE(module_id, '')))
        DO UPDATE SET count = statistics_daily.count + 1, updated_at = NOW()
        `,
        [userId, moduleId ?? null, metric]
      );

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      // SIEMPRE liberar la conexión, haya éxito o error
      client.release();
    }
  }

  /**
   * SIN CAMBIOS respecto a tu código original.
   * Devuelve los totales acumulados por métrica/módulo.
   */
  async getByUser(userId: string) {
    const result = await this.pool.query(
      `
      SELECT
        metric,
        module_id,
        count,
        updated_at
      FROM statistics
      WHERE user_id = $1
      ORDER BY count DESC
      `,
      [userId]
    );

    return result.rows;
  }

  /**
   * NUEVO: historial diario para graficar tendencias.
   *
   * @param days cuántos días hacia atrás (ej. 7, 30, 90).
   *             Se limita entre 1 y 365 para evitar consultas
   *             enormes por error.
   * @param moduleId pasar null para métricas globales (sin módulo)
   */
  async getDailyHistory(
    userId: string,
    metric: string,
    days: number = 30,
    moduleId: string | null = null
  ) {
    // Acota el rango permitido: mínimo 1 día, máximo 365 días
    const safeDays = Math.min(Math.max(days, 1), 365);

    const result = await this.pool.query(
      `
      SELECT day, module_id, count
      FROM statistics_daily
      WHERE user_id = $1
        AND metric = $2
        AND day >= CURRENT_DATE - $3::int
        AND module_id IS NOT DISTINCT FROM $4
      ORDER BY day ASC
      `,
      [userId, metric, safeDays, moduleId]
    );

    return result.rows;
  }

  /**
   * NUEVO: compara el total del periodo actual vs el periodo
   * inmediatamente anterior (mismo tamaño).
   *
   * Ej. con days=30:
   *  - current_period  = suma de los últimos 30 días
   *  - previous_period = suma de los 30 días antes de esos
   *
   * Sirve para mostrar algo como "+12% vs mes pasado"
   */
  async getPeriodComparison(
    userId: string,
    metric: string,
    days: number = 30,
    moduleId: string | null = null
  ) {
    const safeDays = Math.min(Math.max(days, 1), 365);

    const result = await this.pool.query(
      `
      SELECT
        SUM(CASE WHEN day >= CURRENT_DATE - $3::int THEN count ELSE 0 END) AS current_period,
        SUM(CASE WHEN day < CURRENT_DATE - $3::int
                  AND day >= CURRENT_DATE - ($3::int * 2) THEN count ELSE 0 END) AS previous_period
      FROM statistics_daily
      WHERE user_id = $1
        AND metric = $2
        AND module_id IS NOT DISTINCT FROM $4
      `,
      [userId, metric, safeDays, moduleId]
    );

    return result.rows[0];
  }

  /**
   * SIN CAMBIOS respecto a tu código original.
   */
  async resetMetric(
    userId: string,
    metric: string,
    moduleId?: string | null
  ) {
    await this.pool.query(
      `
      UPDATE statistics
      SET count = 0,
          updated_at = NOW()
      WHERE user_id = $1
        AND metric = $2
        AND module_id IS NOT DISTINCT FROM $3
      `,
      [userId, metric, moduleId ?? '']
    );
  }
}