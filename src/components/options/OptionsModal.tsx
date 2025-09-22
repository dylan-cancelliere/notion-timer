import { ActionIcon, Card, Stack } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconDotsVertical } from "@tabler/icons-react";
import { useState } from "react";
import { SessionDisplayTable } from "@src/components/options/SessionDisplayTable";
import { useLoginContext } from "@src/context/context";
import { ShowUserId } from "./ShowUserId";

const OptionsList = () => {
  const options = [
    { key: "showId", component: <ShowUserId /> },
    { key: "sessionDisplay", component: <SessionDisplayTable /> },
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
              title: "Options",
              children: <OptionsList />,
              centered: true,
              size: "xl",
            })
          );
      }}
    >
      <IconDotsVertical />
    </ActionIcon>
  );
};
