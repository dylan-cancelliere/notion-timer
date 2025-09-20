import { ActionIcon, Group, Loader } from "@mantine/core";
import classes from "./TimerLabel.module.css";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useState } from "react";
import { updateSessionLabel } from "./api";
import { notify } from "./utils";
import { useLoginContext } from "./context/context";

export const TimerLabel = () => {
  const { currentSession } = useLoginContext();
  const [labelText, setLabelText] = useState(currentSession.session_label);
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!labelText) {
          notify.error("Label cannot be empty");
          return;
        }
        setLoading(true);
        updateSessionLabel(currentSession.session_id, labelText)
          .then(() => notify.success("Updated label"))
          .finally(() => setLoading(false));
      }}
    >
      <Group wrap="nowrap">
        <input
          type="text"
          name="Timer Label"
          placeholder="Enter label..."
          aria-label="Enter timer label"
          defaultValue={currentSession.session_label}
          className={classes.input}
          onChange={(e) => setLabelText(e.currentTarget.value)}
        />
        {loading ? (
          <Loader size="sm" />
        ) : (
          <ActionIcon variant="subtle" type="submit" aria-label="Save label">
            <IconDeviceFloppy />
          </ActionIcon>
        )}
      </Group>
    </form>
  );
};
