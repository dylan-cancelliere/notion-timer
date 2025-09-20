/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Group, Stack } from "@mantine/core";
import classes from "./Timer.module.css";
import { useEffect, useRef, useState } from "react";

import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { TimerLabel } from "./TimerLabel";
import { updateSessionTime } from "./api";
import { useLoginContext } from "./context/context";
import { OptionsModal } from "./OptionsModal";

export const Timer = () => {
  const { currentSession } = useLoginContext();
  const [compareDate, setCompareDate] = useState(Date.now());
  const [prevTime, setPrevTime] = useState(currentSession.session_length);
  const [time, setTime] = useState(0);
  const calcTime = useRef(0);
  calcTime.current = prevTime + time;

  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId: number;
    if (isRunning) {
      intervalId = setInterval(
        () => setTime(Math.floor(Date.now() - compareDate) / 10),
        100
      );
    }
    return () => clearInterval(intervalId);
  }, [compareDate, isRunning]);

  // If the timer is running, auto-save every minute
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("AUTOSAVING", isRunning);
      if (isRunning)
        updateSessionTime(
          currentSession.session_id,
          Math.floor(calcTime.current)
        ).then(() => console.log("saved"));
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [isRunning]);

  const hours = Math.floor(calcTime.current / 360000);
  const minutes = Math.floor((calcTime.current % 360000) / 6000);
  const seconds = Math.floor((calcTime.current % 6000) / 100);

  return (
    <Stack w={350} maw={350}>
      <Group wrap="nowrap" gap="xs">
        <TimerLabel />
        <OptionsModal />
      </Group>
      <p className={classes.mainTimer}>
        {hours.toString().padStart(2, "0")}
        <span className={isRunning ? undefined : classes.blinkingDots}>:</span>
        {minutes.toString().padStart(2, "0")}
        <span className={isRunning ? undefined : classes.blinkingDots}>:</span>
        {seconds.toString().padStart(2, "0")}
      </p>
      <Group>
        <Button
          variant={isRunning ? "outline" : "filled"}
          leftSection={
            isRunning ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />
          }
          onClick={() => {
            if (isRunning) {
              // on pause
              setPrevTime(prevTime + time);
              setTime(0);
              updateSessionTime(
                currentSession.session_id,
                Math.floor(calcTime.current)
              );
            } else {
              // on play
              setCompareDate(Date.now());
            }
            setIsRunning(!isRunning);
          }}
          flex={2}
        >
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button
          variant="outline"
          color="red"
          onClick={() => {
            setIsRunning(false);
            setPrevTime(0);
            setTime(0);
          }}
        >
          Clear
        </Button>
      </Group>
    </Stack>
  );
};
