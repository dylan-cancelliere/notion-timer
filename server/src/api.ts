import { Pool } from "mysql2/promise";
import { Session } from "./models";

export async function createNewSession(userId: string, pool: Pool) {
  const sql = `set @sessionId = uuid();
            INSERT INTO \`notion-timer\`.user_sessions (user_id, session_id)
            VALUES (?, @sessionId);
            select * from \`notion-timer\`.user_sessions where session_id = @sessionId`;
  const [session] = await pool.query<Session[]>(sql, [userId]);
  if (session.length == 0) throw new Error("Error creating session");
  return session.at(0);
}

export async function getLastSession(userId: string, pool: Pool) {
  const [session] = await pool.query<Session[]>(
    `select * from \`notion-timer\`.user_sessions where user_id = ${userId} orderby last_updated limit 1`
  );

  if (session.length == 0) {
    return await createNewSession(userId, pool);
  }
  return session;
}
