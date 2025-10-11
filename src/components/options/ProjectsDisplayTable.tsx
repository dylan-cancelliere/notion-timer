import {
  ActionIcon,
  Box,
  Button,
  CopyButton,
  Group,
  Menu,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import type { Session, UserProject } from "@server/src/models";
import { useLoginContext } from "@src/context/context";
import { notify } from "@src/utils";
import {
  IconCheck,
  IconCirclePlusFilled,
  IconDotsVertical,
  IconLink,
  IconSwitch2,
  IconTrash,
} from "@tabler/icons-react";
import {
  MRT_Table,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useState } from "react";

function sessionLengthToDurationTs(sessionLength: number) {
  const hours = Math.floor(sessionLength / 360000);
  const minutes = Math.floor((sessionLength / 6000) % 360);
  const seconds = Math.floor((sessionLength / 100) % 60);

  return `${hours > 0 ? `${hours}h ` : ""}${
    minutes > 0 ? `${minutes}m ` : ""
  }${seconds}s`;
}

function openCreateSessionModal() {
  const CreateSessionModal = () => {
    const [name, setName] = useState<string>();

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
          }}
        >
          Submit
        </Button>
      </Stack>
    );
  };

  const id = modals.open({
    title: "Create new session",
    children: <CreateSessionModal />,
  });
}

const columns: MRT_ColumnDef<UserProject & { total_time: number }>[] = [
  {
    accessorKey: "project_name",
    header: "Project Name",
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "total_time",
    header: "Total Time",
    Cell: ({ row }) => {
      return sessionLengthToDurationTs(row.original.total_time);
    },
  },
  {
    id: "rowActions",
    header: "Options",
    columnDefType: "display",
    Cell: () => {
      return (
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon aria-label="Project options menu" variant="transparent">
              <IconDotsVertical />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconCirclePlusFilled size={16} />}
              onClick={openCreateSessionModal}
            >
              New session
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      );
    },
  },
];

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
              console.log("timer is running", timerIsRunning);
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
  const { projects } = useLoginContext();

  const projectsWithTime = projects.map((it) => ({
    ...it,
    total_time: it.sessions.reduce(
      (acc, cur) => (acc += cur.session_length),
      0
    ),
  }));

  const table = useMantineReactTable({
    columns,
    data: projectsWithTime,
    renderDetailPanel: ({ row }) => (
      <Stack gap={0}>
        <Table.ScrollContainer minWidth={600}>
          <Table striped highlightOnHover tabularNums>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Session</Table.Th>
                <Table.Th>Length</Table.Th>
                <Table.Th>Last used</Table.Th>
                <Table.Th>Switch</Table.Th>
                <Table.Th>Options</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {row.original.sessions.map((it) => (
                <SessionRow key={it.session_id} session={it} />
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Stack>
    ),
    initialState: {
      expanded: true,
    },
    mantineTableProps: {
      striped: true,
    },
    displayColumnDefOptions: {
      "mrt-row-expand": {
        mantineTableHeadCellProps: {
          display: "none",
        },
        mantineTableBodyCellProps: {
          display: "none",
        },
      },
    },
    mantineDetailPanelProps: {
      style: { padding: 0 },
    },

    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableSorting: false,
  });

  return (
    <Stack>
      <Group>
        <Title order={3}>Projects</Title>
        <Tooltip label="Create project">
          <ActionIcon aria-label="Create project" variant="subtle">
            <IconCirclePlusFilled />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Box style={{ overflow: "auto" }}>
        <MRT_Table table={table} />
      </Box>
    </Stack>
  );
};
