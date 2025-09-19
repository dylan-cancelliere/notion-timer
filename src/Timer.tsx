import { Stack, Group, TextInput, Button } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import "./index.css";

export const Timer = ({ clientKey }: { clientKey: string }) => {
  const [label, setLabel] = useState("");

  useEffect(() => {
    window.console.log("CLIENT KEY", clientKey);
  }, [clientKey]);

  return (
    <Stack>
      <Group>
        <TextInput
          variant="filled"
          placeholder="Enter label..."
          onChange={(e) => setLabel(e.currentTarget.value)}
        />
        <Button
          leftSection={<IconDeviceFloppy />}
          onClick={() => {
            window.console.log("LABEL:", label);
            localStorage.setItem("TEST", label);
          }}
        >
          Save
        </Button>
      </Group>
      <Button
        onClick={() => {
          window.console.log("LOCAL STORAGE:", localStorage.getItem("TEST"));
        }}
      >
        LOAD FROM LOCAL STORAGE
      </Button>
    </Stack>
  );
};
