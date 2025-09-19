import { Button, Group, Stack } from "@mantine/core";
import classes from "./Timer.module.css";
import { useEffect, useRef, useState } from "react";

import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { TimerLabel } from "./TimerLabel";

export const Timer = () => {
  const [compareDate, setCompareDate] = useState(Date.now());
  const [prevTime, setPrevTime] = useState(0);
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

  const hours = Math.floor(calcTime.current / 360000);
  const minutes = Math.floor((calcTime.current % 360000) / 6000);
  const seconds = Math.floor((calcTime.current % 6000) / 100);

  return (
    <Stack w={350} maw={350}>
      <TimerLabel />
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
