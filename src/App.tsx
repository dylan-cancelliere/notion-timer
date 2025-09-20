/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Timer } from "./Timer";
import { TextInput, Modal, Stack, Text, Button } from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";
import { UserContextProvider } from "./context/UserContextProvider";
import { UserIdContext } from "./context/context";
import { notify } from "./utils";

const LOCAL_STORAGE_KEY = "notion-timer-user-id";

function App() {
  const [userId, setUserId] = useState(
    new URLSearchParams(location.search).get("userId")
  );

  const [userInput, setUserInput] = useState<string>();

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
    <Stack h="100%" w="100%" align="center">
      <Stack h="100%" justify="center">
        <UserIdContext value={{ userId }}>
          {userId ? (
            <UserContextProvider>
              <Timer />
            </UserContextProvider>
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
        </UserIdContext>
      </Stack>
    </Stack>
  );
}

export default App;
