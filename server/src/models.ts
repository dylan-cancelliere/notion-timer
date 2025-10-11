import type { RowDataPacket } from "mysql2";

export type User = {
  user_id: string;
  name: string;
};
export type IUser = User & RowDataPacket;

export type Session = {
  session_id: string;
  session_label: string;
  session_length: number;
  last_updated: string;
  created_at: string;
};
export type ISession = Session & RowDataPacket & { user_id: string };

export type Project = {
  project_id: string;
  project_name: string;
  color: string;
};
export type UserProject = Project & { sessions: Session[] };
export type IProject = Project & RowDataPacket;
