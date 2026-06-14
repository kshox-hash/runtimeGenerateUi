import DB from "../../db/db_configuration";
import { KnowledgeChunk, KnowledgeSource } from "./chat.types";

export async function createSource(
  userId: string,
  filename: string
): Promise<KnowledgeSource> {
  const result = await DB.getPool().query(
    `INSERT INTO chat_knowledge_sources (user_id, filename, chunk_count)
     VALUES ($1, $2, 0)
     RETURNING *`,
    [userId, filename]
  );
  return result.rows[0];
}

export async function updateSourceChunkCount(
  sourceId: string,
  count: number
): Promise<void> {
  await DB.getPool().query(
    `UPDATE chat_knowledge_sources SET chunk_count = $1 WHERE id = $2`,
    [count, sourceId]
  );
}

export async function insertChunks(
  userId: string,
  sourceId: string,
  chunks: string[]
): Promise<void> {
  if (chunks.length === 0) return;

  const pool = DB.getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < chunks.length; i++) {
      await client.query(
        `INSERT INTO chat_knowledge_chunks (user_id, source_id, chunk_text, chunk_index)
         VALUES ($1, $2, $3, $4)`,
        [userId, sourceId, chunks[i], i]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getChunksByUserId(
  userId: string
): Promise<KnowledgeChunk[]> {
  const result = await DB.getPool().query(
    `SELECT id, user_id, source_id, chunk_text, chunk_index
     FROM chat_knowledge_chunks
     WHERE user_id = $1
     ORDER BY source_id, chunk_index`,
    [userId]
  );
  return result.rows;
}

export async function getSourcesByUserId(
  userId: string
): Promise<KnowledgeSource[]> {
  const result = await DB.getPool().query(
    `SELECT id, user_id, filename, chunk_count, created_at
     FROM chat_knowledge_sources
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function deleteSource(
  sourceId: string,
  userId: string
): Promise<boolean> {
  const result = await DB.getPool().query(
    `DELETE FROM chat_knowledge_sources WHERE id = $1 AND user_id = $2 RETURNING id`,
    [sourceId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}
