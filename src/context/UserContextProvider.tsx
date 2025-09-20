import { type ReactNode, useState, useEffect, useCallback } from "react";
import { UserContext } from "./context";
import type { Session } from "../../server/src/models";
import { getLastSession } from "../api";
import { notify } from "../utils";
import { Box, LoadingOverlay } from "@mantine/core";

export const UserContextProvider = ({
  children,
  userId,
}: {
  children?: ReactNode;
  userId: string | null;
}) => {
  const [data, setData] = useState<Session>();
  const [loading, setLoading] = useState(false);

  const fetchUserContext = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    getLastSession(userId)
      .then(({ session }) => setData(session))
      .finally(() => setLoading(false))
      .catch(notify.error);
  }, [userId]);

  useEffect(() => {
    fetchUserContext();
  }, [fetchUserContext]);

  return (
    <UserContext
      value={
        data
          ? { currentSession: data, refetchUserContext: fetchUserContext }
          : null
      }
    >
      <Box pos="relative">
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        {children}
      </Box>
    </UserContext>
  );
};
