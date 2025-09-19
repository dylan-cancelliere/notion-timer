import { ActionIcon, Group } from "@mantine/core";
import "./TimerLabel.module.css";
import { IconDeviceFloppy } from "@tabler/icons-react";

export const TimerLabel = () => {
  return (
    <Group>
      <input
        type="text"
        name="Timer Label"
        placeholder="Enter label..."
        aria-label="Enter timer label"
      />
      <ActionIcon variant="subtle">
        <IconDeviceFloppy />
      </ActionIcon>
    </Group>
  );
};
