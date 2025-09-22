import {
  Group,
  Code,
  CopyButton,
  ActionIcon,
  Button,
  Text,
} from "@mantine/core";
import { useLoginContext } from "@src/context/context";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useState } from "react";

export const ShowUserId = () => {
  const {
    user: { user_id },
  } = useLoginContext();
  const [show, setShow] = useState(false);
  return (
    <span>
      {show ? (
        <Group wrap="nowrap">
          <Group wrap="nowrap" gap="xs">
            <span style={{ textOverflow: "ellipsis", flexShrink: 1 }}>
              <Code>{user_id}</Code>
            </span>
            <CopyButton value={user_id}>
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
