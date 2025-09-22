import {
  ActionIcon,
  Button,
  Menu,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useLoginContext } from "@src/context/context";
import { notify } from "@src/utils";
import {
  IconDotsVertical,
  IconLink,
  IconSwitch2,
  IconTrash,
} from "@tabler/icons-react";

export const SessionDisplayTable = () => {
  const { sessions, currentSession, changeCurrentSession, timerIsRunning } =
    useLoginContext();

  const rows = sessions.map((it) => {
    const hours = Math.floor(it.session_length / 360000);
    const minutes = Math.floor((it.session_length / 6000) % 360);
    const seconds = Math.floor((it.session_length / 100) % 60);

    const sessionLengthTs = `${hours > 0 ? `${hours}h ` : ""}${
      minutes > 0 ? `${minutes}m ` : ""
    }${seconds}s`;

    return (
      <Table.Tr key={it.session_id}>
        <Table.Td>{it.session_label}</Table.Td>
        <Table.Td>{sessionLengthTs}</Table.Td>
        <Table.Td>{new Date(it.last_updated).toLocaleString()}</Table.Td>
        <Table.Td>
          {it.session_id != currentSession.session_id && (
            <ActionIcon
              variant="transparent"
              mx="auto"
              onClick={() => {
                console.log("timer is running", timerIsRunning);
                if (timerIsRunning) {
                  modals.open({
                    withCloseButton: false,
                    children: (
                      <Stack>
                        <Text>
                          Your timer is currently running! Please pause it to
                          log your time before changing to a new session.
                        </Text>
                        <Button onClick={modals.closeAll}>Ok</Button>
                      </Stack>
                    ),
                  });
                  return;
                }
                changeCurrentSession(it);
                modals.closeAll();
              }}
            >
              <IconSwitch2 />
            </ActionIcon>
          )}
        </Table.Td>
        <Table.Td>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="transparent" aria-label="Show options">
                <IconDotsVertical />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item leftSection={<IconLink size={16} />}>
                Get embed link
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() =>
                  modals.openConfirmModal({
                    title: "Delete session",
                    children: (
                      <Text>
                        Are you sure you want to delete session "
                        <strong>{it.session_label}</strong>"?
                      </Text>
                    ),
                    labels: { confirm: "Delete", cancel: "Cancel" },
                    onConfirm: () => {
                      notify.info("Todo!");
                      modals.closeAll();
                    },
                    confirmProps: { color: "red", leftSection: <IconTrash /> },
                  })
                }
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack>
      <Title order={3}>Sessions</Title>
      <Table.ScrollContainer minWidth={600}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Session Length</Table.Th>
              <Table.Th>Last used</Table.Th>
              <Table.Th>Switch</Table.Th>
              <Table.Th>Options</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
};
