import { createContext, useContext } from "react";
import type { Session } from "../../server/src/models";

export type UserContextType = {
  //   user: User;
  //   sessions: Session[];
  currentSession: Session;
  refetchUserContext: () => void;
};

export const UserContext = createContext<UserContextType | null>(null);

// Asserts user is logged in
export const useLoginContext = () => {
  const data = useContext(UserContext);
  if (!data) throw new Error("Login context not found");
  return { ...data };
};
