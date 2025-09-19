import { getLastSession } from "./api";
import { Timer } from "./Timer";
import { Button, Stack } from "@mantine/core";

function App() {
  return (
    <Stack h="100%" w="100%" align="center">
      <Stack h="100%" justify="center">
        <Timer />
        <Button
          onClick={() => {
            void getLastSession("b74b952e-9512-11f0-86bc-42010a400002");
          }}
        >
          Test
        </Button>
      </Stack>
    </Stack>
  );
}

export default App;
