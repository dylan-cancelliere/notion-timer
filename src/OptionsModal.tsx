import {
  ActionIcon,
  Button,
  Card,
  Code,
  CopyButton,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCheck, IconCopy, IconDotsVertical } from "@tabler/icons-react";
import { useState } from "react";

const ShowUserId = () => {
  const [show, setShow] = useState(false);
  return (
    <span>
      {show ? (
        <Group wrap="nowrap">
          <Group wrap="nowrap" gap="xs">
            <span style={{ textOverflow: "ellipsis", flexShrink: 1 }}>
              <Code>b74b952e-9512-11f0-86bc-42010a400002</Code>
            </span>
            <CopyButton value="my-user-id">
              {({ copied, copy }) => (
                <ActionIcon
                  color={copied ? "teal" : "blue"}
                  onClick={copy}
                  variant="transparent"
                  size="sm"
                >
                  {copied ? <IconCheck size="sm" /> : <IconCopy size="sm" />}
                </ActionIcon>
              )}
            </CopyButton>
          </Group>
          <Button variant="transparent" onClick={() => setShow(false)} p={0}>
            <Text td="underline">Hide</Text>
          </Button>
        </Group>
      ) : (
        <Button onClick={() => setShow(true)}>Show User ID</Button>
      )}
    </span>
  );
};

const ChangeTaskList = () => {
  //   const {} = useLoginContext();
  return <Stack></Stack>;
};

const OptionsList = () => {
  const options = [<ShowUserId />, <ChangeTaskList />];
  return (
    <Stack>
      {options.map((it) => (
        <Card shadow="md">{it}</Card>
      ))}
    </Stack>
  );
};

export const OptionsModal = () => {
  return (
    <ActionIcon
      variant="subtle"
      aria-label="Show options"
      onClick={() =>
        modals.open({
          title: "Options",
          children: <OptionsList />,
          centered: true,
        })
      }
    >
      <IconDotsVertical />
    </ActionIcon>
  );
};
