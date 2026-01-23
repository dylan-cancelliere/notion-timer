import { ActionIcon, Card, Stack, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { ProjectsTable } from "@src/components/options/ProjectsTable/ProjectsTable";
import { useLoginContext } from "@src/context/context";
import { ShowUserId } from "./ShowUserId";

const OptionsList = () => {
  const options = [
    { key: "sessionDisplay", component: <ProjectsTable /> },
    { key: "showId", component: <ShowUserId /> },
  ];
  return (
    <Stack>
      {options.map((it) => (
        <Card shadow="md" key={it.key}>
          {it.component}
        </Card>
      ))}
    </Stack>
  );
};

export const OptionsModal = () => {
  const { refetchUserContext } = useLoginContext();
  const [loading, setLoading] = useState(false);

  return (
    <ActionIcon
      variant="subtle"
      aria-label="Show options"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        refetchUserContext()
          .then(() => setLoading(false))
          .then(() =>
            modals.open({
              title: <Title order={2}>Settings</Title>,
              children: <OptionsList />,
              centered: true,
              size: "xl",
            }),
          );
      }}
    >
      <IconSettings />
    </ActionIcon>
  );
};
