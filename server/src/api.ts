import { Pool } from "mysql2/promise";
import { IProject, ISession, IUser } from "./models";
import { v4 as uuidv4 } from "uuid";

export async function createNewSession(userId: string, pool: Pool) {
  const sessionId = uuidv4();
  await pool.query(
    `INSERT INTO \`user_sessions\` (user_id, session_id) VALUES (?, ?)`,
    [userId, sessionId]
  );
  const [session] = await pool.query<ISession[]>(
    `select * from \`user_sessions\` where session_id = ?`,
    sessionId
  );
  if (session.length == 0) throw new Error("Error creating session");
  return session[0];
}

export async function getLastSession(userId: string, pool: Pool) {
  const sql = `select * from \`user_sessions\` where user_id = ? order by last_updated desc limit 1`;
  const [session] = await pool.query<ISession[]>(sql, userId);

  if (session.length == 0) {
    return await createNewSession(userId, pool);
  }
  return session[0];
}

export async function getAllSessions(userId: string, pool: Pool) {
  const sql = `select * from \`user_sessions\` where user_id = ? order by last_updated`;
  const [sessions] = await pool.query<ISession[]>(sql, userId);

  return sessions;
}

export async function updateSessionLabel(
  sessionId: string,
  label: string,
  pool: Pool
) {
  const sql = `UPDATE \`user_sessions\` SET last_updated = now(), session_label = ? WHERE session_id = ?;`;
  await pool.query(sql, [label, sessionId]);
}

export async function updateSessionTime(
  sessionId: string,
  time: number,
  pool: Pool
) {
  const sql = `UPDATE \`user_sessions\` SET last_updated = now(), session_length = ? WHERE session_id = ?;`;
  await pool.query(sql, [time, sessionId]);
}

export async function getUserContext(userId: string, pool: Pool) {
  const ctx_sql = `select users.user_id, users.name, user_sessions.session_id, user_sessions.session_label, user_sessions.session_length, user_sessions.last_updated, user_sessions.created_at
    from users left join user_sessions on users.user_id = user_sessions.user_id
    where users.user_id = ? order by user_sessions.last_updated desc`;
  const [ctx] = await pool.query<(ISession & IUser)[]>(ctx_sql, userId);
  const projects = await getAllProjects(userId, pool);
  return { context: ctx, projects };
}

export async function getAllProjects(userId: string, pool: Pool) {
  const sql = `select project_sessions.project_id, project_sessions.session_id, projects.project_name, projects.color from projects
    left join project_sessions on projects.id = project_sessions.project_id
    where projects.user_id = ?
    order by projects.project_name desc`;
  const [projects] = await pool.query<(IProject & { session_id: string })[]>(
    sql,
    userId
  );
  return projects;
}
