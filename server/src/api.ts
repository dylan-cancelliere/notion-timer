import { Pool } from "mysql2/promise";
import { IProject, ISession, IUser } from "./models";
import { v4 as uuidv4 } from "uuid";

export async function createNewSession(
  userId: string,
  projectId: string,
  pool: Pool,
) {
  const sessionId = uuidv4();
  await pool.query(
    `INSERT INTO \`project_sessions\` (user_id, project_id, session_id) VALUES (?, ?, ?)`,
    [userId, projectId, sessionId],
  );
  const [session] = await pool.query<ISession[]>(
    `select * from \`project_sessions\` where session_id = ?`,
    sessionId,
  );
  if (session.length == 0) throw new Error("Error creating session");
  return session[0];
}

export async function createNewProject(userId: string, pool: Pool) {
  const projectId = uuidv4();
  const sql = `INSERT INTO projects (user_id, project_id) VALUES (?, ?);`;

  await pool.query(sql, [userId, projectId]);
  const [project] = await pool.query<IProject[]>(
    `select * from projects where project_id = ?`,
    projectId,
  );

  if (project.length == 0) throw new Error("Error creating project");
  return project[0];
}

export async function getLastSession(userId: string, pool: Pool) {
  const sql = `select * from \`project_sessions\` where user_id = ? order by last_updated desc limit 1`;
  const [session] = await pool.query<ISession[]>(sql, userId);

  if (session.length == 0) {
    const projects = await getAllProjects(userId, pool);
    if (projects.length == 0) {
      const newProj = await createNewProject(userId, pool);
      return await createNewSession(userId, newProj.project_id, pool);
    }
    return await createNewSession(userId, projects[0].project_id, pool);
  }
  return session[0];
}

export async function getAllSessions(userId: string, pool: Pool) {
  const sql = `select * from \`project_sessions\` where user_id = ? order by last_updated`;
  const [sessions] = await pool.query<ISession[]>(sql, userId);

  return sessions;
}

export async function updateSessionLabel(
  sessionId: string,
  label: string,
  pool: Pool,
) {
  const sql = `UPDATE \`project_sessions\` SET last_updated = now(), session_label = ? WHERE session_id = ?;`;
  await pool.query(sql, [label, sessionId]);
}

export async function updateSessionTime(
  sessionId: string,
  time: number,
  pool: Pool,
) {
  const sql = `UPDATE \`project_sessions\` SET last_updated = now(), session_length = ? WHERE session_id = ?;`;
  await pool.query(sql, [time, sessionId]);
}

export async function getAllProjects(userId: string, pool: Pool) {
  const sql = `SELECT projects.*, users.name, users.default_color, project_sessions.session_id, project_sessions.session_label, project_sessions.session_length, project_sessions.last_updated, project_sessions.created_at
              FROM users
              join projects on projects.user_id = users.user_id
              LEFT JOIN project_sessions ON projects.project_id = project_sessions.project_id
              WHERE users.user_id = ?
              ORDER BY project_sessions.last_updated desc`;
  const [projects] = await pool.query<(IProject & ISession & IUser)[]>(
    sql,
    userId,
  );
  return projects;
}

export async function getUser(userId: string, pool: Pool) {
  const sql = `select * from users where user_id = ?`;
  const [user] = await pool.query<IUser[]>(sql, userId);

  if (user.length == 0) return null;
  return user[0];
}

export async function updateProjectName(
  userId: string,
  projectId: string,
  name: string,
  pool: Pool,
) {
  const sql = `UPDATE projects SET project_name = ? WHERE project_id = ? and user_id = ?;`;
  await pool.query(sql, [name, projectId, userId]);
}

export async function deleteProject(
  userId: string,
  projectId: string,
  pool: Pool,
) {
  const sql = `delete from projects WHERE project_id = ? and user_id = ?;`;
  await pool.query(sql, [projectId, userId]);
  const sql2 = `delete from project_sessions where project_id = ? and user_id = ?;`;
  await pool.query(sql2, [projectId, userId]);
}
