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
