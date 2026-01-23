import {
  Table,
  ActionIcon,
  Stack,
  Button,
  Menu,
  CopyButton,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import type { Session } from "@server/src/models";
import { useLoginContext } from "@src/context/context";
import { sessionLengthToDurationTs, notify } from "@src/utils";
import {
  IconSwitch2,
  IconDotsVertical,
  IconCheck,
  IconLink,
  IconTrash,
} from "@tabler/icons-react";

export const SessionRow = ({ session }: { session: Session }) => {
  const {
    currentSession,
    changeCurrentSession,
    timerIsRunning,
    user: { user_id },
  } = useLoginContext();

  return (
    <Table.Tr key={session.session_id}>
      <Table.Td>{session.session_label}</Table.Td>
      <Table.Td>{sessionLengthToDurationTs(session.session_length)}</Table.Td>
      <Table.Td>{new Date(session.last_updated).toLocaleString()}</Table.Td>
      <Table.Td>
        {session.session_id != currentSession.session_id && (
          <ActionIcon
            variant="transparent"
            mx="auto"
            onClick={() => {
              if (timerIsRunning) {
                modals.open({
                  withCloseButton: false,
                  children: (
                    <Stack>
                      <Text>
                        Your timer is currently running! Please pause it to log
                        your time before changing to a new session.
                      </Text>
                      <Button onClick={modals.closeAll}>Ok</Button>
                    </Stack>
                  ),
                });
                return;
              }
              changeCurrentSession(session);
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
            <CopyButton
              value={`https://notion-timer-5v3.pages.dev?userId=${user_id}&sessionId=${session.session_id}`}
            >
              {({ copied, copy }) => (
                <Menu.Item
                  leftSection={
                    copied ? <IconCheck size={16} /> : <IconLink size={16} />
                  }
                  onClick={() => {
                    copy();
                    notify.success("Copied to clipboard");
                  }}
                >
                  {copied ? "Copied" : "Get embed link"}
                </Menu.Item>
              )}
            </CopyButton>
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() =>
                modals.openConfirmModal({
                  title: "Delete session",
                  children: (
                    <Text>
                      Are you sure you want to delete session "
                      <strong>{session.session_label}</strong>"?
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
};
