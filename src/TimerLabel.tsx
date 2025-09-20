import { ActionIcon, Group } from "@mantine/core";
import classes from "./TimerLabel.module.css";
import { IconDeviceFloppy } from "@tabler/icons-react";

export const TimerLabel = () => {
  return (
    <Group wrap="nowrap">
      <input
        type="text"
        name="Timer Label"
        placeholder="Enter label..."
        aria-label="Enter timer label"
        className={classes.input}
      />
      <ActionIcon variant="subtle">
        <IconDeviceFloppy />
      </ActionIcon>
    </Group>
  );
};
