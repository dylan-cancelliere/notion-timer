import { type ReactNode, useState, useEffect, useCallback } from "react";
import { UserContext } from "@src/context/context";
import type { Project, Session, User } from "@server/src/models";
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
    projects: (Project & { sessions: Session[] })[];
  }>();
  const [currentSession, setCurrentSession] = useState<Session>();
  const [loading, setLoading] = useState(false);
  const [timerIsRunning, setTimerIsRunning] = useState(false);

  const fetchUserContext = useCallback(() => {
    if (!userId) return Promise.resolve();
    setLoading(true);
    return getUserContext(userId)
      .then(({ context }) => {
        setCtx({ ...context });
        if (!currentSession) {
          const maybeSesh = context.projects.find(
            (it) => it.sessions.length > 0
          )?.sessions[0];
          setCurrentSession(maybeSesh);
        }
      })
      .finally(() => setLoading(false))
      .catch(notify.error);
  }, [userId, currentSession]);

  useEffect(() => {
    fetchUserContext();
  }, [fetchUserContext]);

  return (
    <UserContext
      value={
        ctx && currentSession
          ? {
              user: ctx.user,
              projects: ctx.projects,
              currentSession,
              changeCurrentSession: setCurrentSession,
              refetchUserContext: fetchUserContext,
              timerIsRunning,
              setTimerIsRunning,
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
