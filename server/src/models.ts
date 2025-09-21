import type { RowDataPacket } from "mysql2";

export type User = RowDataPacket & {
  user_id: string;
  name: string;
};
export type IUser = User & RowDataPacket;

export type ISession = Session & RowDataPacket;
export type Session = RowDataPacket & {
  user_id: string;
  session_id: string;
  session_label: string;
  session_length: number;
  last_updated: string;
  created_at: string;
};
