import classes from "./TimerLabel.module.css";
import { useEffect, useState } from "react";
import { updateSessionLabel } from "@src/api";
import { notify } from "@src/utils";
import { useDebouncedValue } from "@mantine/hooks";
import { useLoginContext } from "@src/context/context";

//

export const TimerLabel = () => {
  const { currentSession, refetchUserContext } = useLoginContext();
  const [labelText, setLabelText] = useState(currentSession.session_label);
  const [debouncedLabelText] = useDebouncedValue(labelText, 1000);

  useEffect(() => {
    setLabelText(currentSession.session_label);
  }, [currentSession.session_id, currentSession.session_label]);

  useEffect(() => {
    if (
      !debouncedLabelText ||
      debouncedLabelText == currentSession.session_label
    )
      return;
    updateSessionLabel(currentSession.session_id, debouncedLabelText)
      .then(refetchUserContext)
      .then(() => notify.success("Updated label"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLabelText]);

  return (
    <input
      type="text"
      name="Timer Label"
      placeholder="Enter label..."
      aria-label="Enter timer label"
      value={labelText}
      className={classes.input}
      onChange={(e) => {
        setLabelText(e.currentTarget.value);
      }}
    />
  );
};
