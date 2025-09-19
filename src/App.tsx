import { Timer } from "./Timer";
import { Button, Stack } from "@mantine/core";

function App() {
  return (
    <Stack h="100%" w="100%" align="center">
      <Stack h="100%" justify="center">
        <Timer />
        <Button onClick={() => {}}>Test</Button>
      </Stack>
    </Stack>
  );
}

export default App;
