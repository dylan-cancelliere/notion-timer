import { Pool } from "mysql2/promise";
import { ISession } from "./models";
import { v4 as uuidv4 } from "uuid";

export async function createNewSession(userId: string, pool: Pool) {
  const sessionId = uuidv4();
  await pool.query(
    `INSERT INTO \`notion-timer\`.\`user_sessions\` (user_id, session_id) VALUES (?, ?)`,
    [userId, sessionId]
  );
  const [session] = await pool.query<ISession[]>(
    `select * from \`notion-timer\`.\`user_sessions\` where session_id = ?`,
    sessionId
  );
  if (session.length == 0) throw new Error("Error creating session");
  return session[0];
}

export async function getLastSession(userId: string, pool: Pool) {
  const sql = `select * from \`notion-timer\`.\`user_sessions\` where user_id = "${userId}" order by last_updated limit 1`;
  const [session] = await pool.query<ISession[]>(sql);

  if (session.length == 0) {
    return await createNewSession(userId, pool);
  }
  return session[0];
}
