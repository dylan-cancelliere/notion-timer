import { RowDataPacket } from "mysql2";

export type User = RowDataPacket & {
  user_id: string;
  name: string;
};

export type Session = RowDataPacket & {
  user_id: string;
  session_id: string;
  session_label: string;
  session_length: number;
  session_ts: string;
};
