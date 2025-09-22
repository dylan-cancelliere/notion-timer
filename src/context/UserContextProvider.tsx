import { type ReactNode, useState, useEffect, useCallback } from "react";
import { UserContext } from "@src/context/context";
import type { Session, User } from "@server/src/models";
import { getUserContext } from "@src/api";
import { notify } from "@src/utils";
import { Box, LoadingOverlay } from "@mantine/core";

export const UserContextProvider = ({
  children,
  userId,
}: {
  children?: ReactNode;
  userId: string | null;
}) => {
  const [ctx, setCtx] = useState<{
    user: User;
    sessions: Session[];
  }>();
  const [currentSession, setCurrentSession] = useState<Session>();
  const [loading, setLoading] = useState(false);

  const fetchUserContext = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    getUserContext(userId)
      .then(({ context }) => {
        setCtx({ ...context });
        setCurrentSession(
          context.sessions.length > 0 ? context.sessions[0] : undefined
        );
      })
      .finally(() => setLoading(false))
      .catch(notify.error);
  }, [userId]);

  useEffect(() => {
    fetchUserContext();
  }, [fetchUserContext]);

  return (
    <UserContext
      value={
        ctx && currentSession
          ? {
              user: ctx.user,
              sessions: ctx.sessions,
              currentSession,
              changeCurrentSession: setCurrentSession,
              refetchUserContext: fetchUserContext,
            }
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
