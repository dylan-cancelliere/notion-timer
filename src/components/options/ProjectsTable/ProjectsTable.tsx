import {
  Accordion,
  ActionIcon,
  Box,
  Group,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useLoginContext } from "@src/context/context";
import { IconCirclePlusFilled, IconEdit, IconTrash } from "@tabler/icons-react";
import { deleteProject, postNewProject, postNewSession } from "@src/api";
import { SessionRow } from "./SessionRow";
import { openEditProjectNameModal } from "./modals";
import { modals } from "@mantine/modals";

export const ProjectsTable = () => {
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
                          openEditProjectNameModal(proj.project_id, user_id);
                        }}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={(e) => {
                          e?.stopPropagation();
                          modals.openConfirmModal({
                            title: "Delete project",
                            children: (
                              <Text size="sm">
                                Are you sure you would like to delete this
                                project? All sessions will be destroyed and this
                                action cannot be undone
                              </Text>
                            ),
                            labels: { confirm: "Confirm", cancel: "Cancel" },
                            onConfirm: () =>
                              void deleteProject(user_id, proj.project_id).then(
                                refetchUserContext,
                              ),
                          });
                        }}
                      >
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
