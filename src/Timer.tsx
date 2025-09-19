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
    <Stack>
      <Group>
        <p className={classes.mainTimer}>
          {hours.toString().padStart(2, "0")}
          <span className={classes.blinkingDots}>:</span>
          {minutes.toString().padStart(2, "0")}
          <span className={classes.blinkingDots}>:</span>
          {seconds.toString().padStart(2, "0")}
        </p>
        {isRunning ? (
          <Button
            variant="outline"
            leftSection={<IconPlayerPauseFilled />}
            onClick={() => setIsRunning(!isRunning)}
          >
            Stop
          </Button>
        ) : (
          <Button
            variant="filled"
            leftSection={<IconPlayerPlayFilled />}
            onClick={() => {
              setIsRunning(!isRunning);
              setInitDate(Date.now());
            }}
          >
            Start
          </Button>
        )}
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
