import { Button, Stack, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { updateProjectName } from "@src/api";
import { useLoginContext } from "@src/context/context";
import { useState } from "react";

export function openEditProjectNameModal(projectId: string, userId: string) {
  const EditProjectNameModal = () => {
    const [name, setName] = useState("");
    const { refetchUserContext } = useLoginContext();

    return (
      <Stack>
        <TextInput
          label="Name"
          placeholder="Enter name..."
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Button
          disabled={!name}
          onClick={() => {
            modals.close(id);
            void updateProjectName(userId, projectId, name).then(
              refetchUserContext,
            );
          }}
        >
          Submit
        </Button>
      </Stack>
    );
  };

  const id = modals.open({
    title: "Create new session",
    children: <EditProjectNameModal />,
  });
}
