import { createContext } from "react";
import type { Session } from "server/models";

export const UserIdContext = createContext<{ userId: string | null }>({
  userId: null,
});

export type UserContextType = {
  //   user: User;
  //   sessions: Session[];
  lastSession: Session;
};

export const UserContext = createContext<UserContextType | null>(null);
