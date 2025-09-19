import { Button, Group, Stack } from "@mantine/core";
import classes from "./Timer.module.css";
import { useEffect, useState } from "react";

import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";

export const Timer = () => {
  const [initDate, setInitDate] = useState(Date.now());
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    console.log("INIT DATE", initDate);
    let intervalId: number;
    if (isRunning) {
      intervalId = setInterval(
        () => setTime(Math.floor(Date.now() - initDate) / 10),
        100
      );
    }
    return () => clearInterval(intervalId);
  }, [initDate, isRunning]);

  const hours = Math.floor(time / 360000);
  const minutes = Math.floor((time % 360000) / 6000);
  const seconds = Math.floor((time % 6000) / 100);

  return (
    <Stack w={350} maw={350}>
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
            if (!isRunning) setInitDate(Date.now());
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
            setTime(0);
          }}
        >
          Clear
        </Button>
      </Group>
    </Stack>
  );
};
