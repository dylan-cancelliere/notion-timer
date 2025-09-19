import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ModalsProvider } from "@mantine/modals";
import "./index.css";
import App from "./App.tsx";
import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <ModalsProvider modalProps={{ centered: true, xOffset: 0 }}>
        <App />
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>
);
