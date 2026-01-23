import { notifications } from "@mantine/notifications";
import { IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";

export const notify = {
  error: (message: string) =>
    notifications.show({
      color: "red",
      title: "Error",
      icon: <IconX size={20} />,
      message,
    }),
  info: (message: string) =>
    notifications.show({
      color: "blue",
      title: "Info",
      icon: <IconInfoCircle size={20} />,
      message,
    }),
  success: (message: string) =>
    notifications.show({
      color: "green",
      title: "Success",
      icon: <IconCheck size={20} />,
      message,
    }),
};

export function sessionLengthToDurationTs(sessionLength: number) {
  const hours = Math.floor(sessionLength / 360000);
  const minutes = Math.floor((sessionLength / 6000) % 360);
  const seconds = Math.floor((sessionLength / 100) % 60);

  return `${hours > 0 ? `${hours}h ` : ""}${
    minutes > 0 ? `${minutes}m ` : ""
  }${seconds}s`;
}
