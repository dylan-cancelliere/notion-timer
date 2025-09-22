/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { TextInput, Modal, Stack, Text, Button } from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";
import { UserContextProvider } from "@src/context/UserContextProvider";

import { notify } from "@src/utils";
import { UserContext } from "@src/context/context";
import { Timer } from "@src/components/timer/Timer";
import { ModalsProvider } from "@mantine/modals";

const LOCAL_STORAGE_KEY = "notion-timer-user-id";

const AuthWrapper = () => {
  const [userId, setUserId] = useState(
    new URLSearchParams(location.search).get("userId")
  );

  useEffect(() => {
    if (!userId) {
      // check local storage
      const maybeId = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (maybeId) setUserId(maybeId.replace(/['"]+/g, ""));
    }
  }, []);

  useEffect(() => {
    if (userId) localStorage.setItem(LOCAL_STORAGE_KEY, userId);
  }, [userId]);

  return (
    <UserContextProvider userId={userId}>
      <ModalsProvider modalProps={{ centered: true, xOffset: 0 }}>
        <App setUserId={setUserId} />
      </ModalsProvider>
    </UserContextProvider>
  );
};

const App = ({ setUserId }: { setUserId: (id: string) => void }) => {
  const [userInput, setUserInput] = useState<string>();
  const auth = useContext(UserContext);

  return (
    <Stack h="100%" w="100%" align="center">
      <Stack h="100%" justify="center">
        {auth?.currentSession ? (
          <Timer />
        ) : (
          <Modal
            centered
            opened
            withCloseButton={false}
            onClose={() => {}}
            title={<Text size="xl">Login</Text>}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!userInput) {
                  notify.error("Invalid user ID");
                  return;
                }
                setUserId(userInput);
              }}
            >
              <Stack>
                <TextInput
                  label="Enter user ID"
                  placeholder="Enter ID..."
                  onChange={(e) => setUserInput(e.currentTarget.value)}
                />
                <Button rightSection={<IconLogin />} type="submit">
                  Login
                </Button>
              </Stack>
            </form>
          </Modal>
        )}
      </Stack>
    </Stack>
  );
};

export default AuthWrapper;
