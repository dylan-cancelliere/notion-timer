import { type ReactNode, useState, useContext, useEffect } from "react";
import { UserContext, UserIdContext } from "./context";
import type { Session } from "../../server/src/models";
import { getLastSession } from "../api";
import { notify } from "../utils";

export const UserContextProvider = ({ children }: { children?: ReactNode }) => {
  const [data, setData] = useState<Session>();
  const { userId } = useContext(UserIdContext);
  useEffect(() => {
    if (!userId) return;
    getLastSession(userId)
      .then(({ session }) => setData(session))
      .catch(notify.error);
  }, [userId]);

  useEffect(() => {
    console.log("DATA UPDATE", data);
  }, [data]);

  return (
    <UserContext value={data ? { lastSession: data } : null}>
      {children}
    </UserContext>
  );
};
