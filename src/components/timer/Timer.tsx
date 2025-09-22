/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Group, Stack } from "@mantine/core";
import classes from "./Timer.module.css";
import { useEffect, useRef, useState } from "react";

import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { TimerLabel } from "@src/components/timer/TimerLabel";
import { updateSessionTime } from "@src/api";
import { useLoginContext } from "@src/context/context";
import { OptionsModal } from "@src/components/options/OptionsModal";

export const Timer = () => {
  const { currentSession, timerIsRunning, setTimerIsRunning } =
    useLoginContext();
  const [compareDate, setCompareDate] = useState(Date.now());
  const [prevTime, setPrevTime] = useState(currentSession.session_length);
  const [time, setTime] = useState(0);
  const calcTime = useRef(0);
  calcTime.current = prevTime + time;

  useEffect(() => {
    setPrevTime(currentSession.session_length);
  }, [currentSession.session_id]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (timerIsRunning) {
      intervalId = setInterval(
        () => setTime(Math.floor(Date.now() - compareDate) / 10),
        100
      );
    }
    return () => clearInterval(intervalId);
  }, [compareDate, timerIsRunning]);

  // If the timer is running, auto-save every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (timerIsRunning)
        updateSessionTime(
          currentSession.session_id,
          Math.floor(calcTime.current)
        ).then(() => console.log("saved"));
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [timerIsRunning]);

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
        <span className={timerIsRunning ? undefined : classes.blinkingDots}>
          :
        </span>
        {minutes.toString().padStart(2, "0")}
        <span className={timerIsRunning ? undefined : classes.blinkingDots}>
          :
        </span>
        {seconds.toString().padStart(2, "0")}
      </p>
      <Group>
        <Button
          variant={timerIsRunning ? "outline" : "filled"}
          leftSection={
            timerIsRunning ? (
              <IconPlayerPauseFilled />
            ) : (
              <IconPlayerPlayFilled />
            )
          }
          onClick={() => {
            if (timerIsRunning) {
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
            setTimerIsRunning(!timerIsRunning);
          }}
          flex={2}
        >
          {timerIsRunning ? "Pause" : "Start"}
        </Button>
        <Button
          variant="outline"
          color="red"
          onClick={() => {
            setTimerIsRunning(false);
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
