import {
  Accordion,
  ActionIcon,
  Box,
  Button,
  CopyButton,
  Group,
  Menu,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import type { Session } from "@server/src/models";
import { useLoginContext } from "@src/context/context";
import { notify, sessionLengthToDurationTs } from "@src/utils";
import {
  IconCheck,
  IconCirclePlusFilled,
  IconDotsVertical,
  IconEdit,
  IconLink,
  IconSwitch2,
  IconTrash,
} from "@tabler/icons-react";
import { postNewProject, postNewSession } from "@src/api";

const SessionRow = ({ session }: { session: Session }) => {
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

export const ProjectsDisplayTable = () => {
  const {
    projects,
    refetchUserContext,
    user: { user_id },
  } = useLoginContext();

  const projectsWithTime = projects.map((it) => ({
    ...it,
    total_time: it.sessions.reduce(
      (acc, cur) => (acc += cur.session_length),
      0,
    ),
  }));

  return (
    <Stack>
      <Group>
        <Title order={3}>Projects</Title>
        <Tooltip label="Create project">
          <ActionIcon
            aria-label="Create project"
            variant="subtle"
            onClick={() =>
              void postNewProject(user_id).then(refetchUserContext)
            }
          >
            <IconCirclePlusFilled />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Box style={{ overflow: "auto" }}>
        <Accordion variant="separated" defaultValue="0">
          {projectsWithTime.map((proj, idx) => {
            return (
              <Accordion.Item value={idx.toString()} key={proj.project_id}>
                <Accordion.Control aria-label={proj.project_name}>
                  <Group>
                    {proj.project_name}
                    <Group gap={0}>
                      <ActionIcon
                        variant="subtle"
                        onClick={(e) => {
                          e?.stopPropagation();
                        }}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red">
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack>
                    <Table.ScrollContainer minWidth={600}>
                      <Table striped highlightOnHover tabularNums>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Session</Table.Th>
                            <Table.Th>Length</Table.Th>
                            <Table.Th>Last updated</Table.Th>
                            <Table.Th>Switch</Table.Th>
                            <Table.Th>Options</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {proj.sessions.map((it) => (
                            <SessionRow key={it.session_id} session={it} />
                          ))}
                          <Table.Tr key="new">
                            <Table.Td colSpan={5}>
                              <Group justify="center">
                                <ActionIcon
                                  variant="subtle"
                                  onClick={() =>
                                    void postNewSession(
                                      user_id,
                                      proj.project_id,
                                    ).then(refetchUserContext)
                                  }
                                >
                                  <IconCirclePlusFilled />
                                </ActionIcon>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        </Table.Tbody>
                      </Table>
                    </Table.ScrollContainer>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Box>
    </Stack>
  );
};
