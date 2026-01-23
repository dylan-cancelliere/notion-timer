import type { RowDataPacket } from "mysql2";

export type User = {
  user_id: string;
  name: string;
  default_color?: string;
};
export type IUser = User & RowDataPacket;

export type Session = {
  project_id: string;
  session_id: string;
  session_label: string;
  session_length: number;
  last_updated: string;
  created_at: string;
  user_id: string;
};
export type ISession = Session & RowDataPacket;

export type Project = {
  project_id: string;
  project_name: string;
  color?: string;
  user_id: string;
};
export type UserProject = Project & { sessions: Session[] };
export type IProject = Project & RowDataPacket;
