import classes from "./TimerLabel.module.css";
import { useEffect } from "react";
import { updateSessionLabel } from "./api";
import { notify } from "./utils";
import { useDebouncedState } from "@mantine/hooks";
import { useLoginContext } from "./context/context";

export const TimerLabel = () => {
  const { currentSession, refetchUserContext } = useLoginContext();
  const [labelText, setLabelText] = useDebouncedState(
    currentSession.session_label,
    1000
  );

  useEffect(() => {
    if (labelText == currentSession.session_label) return;
    if (!labelText) return;
    updateSessionLabel(currentSession.session_id, labelText)
      .then(refetchUserContext)
      .then(() => notify.success("Updated label"));
  }, [
    labelText,
    currentSession.session_label,
    currentSession.session_id,
    refetchUserContext,
  ]);

  return (
    <input
      type="text"
      name="Timer Label"
      placeholder="Enter label..."
      aria-label="Enter timer label"
      defaultValue={currentSession.session_label}
      className={classes.input}
      onChange={(e) => setLabelText(e.currentTarget.value)}
    />
  );
};
