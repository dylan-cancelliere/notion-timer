import cors from "cors";
import express from "express";
import config from "./config";

const app = express();

const corsOptions = {
  origin: ["https://notion-timer-5v3.pages.dev/", "http://localhost:8007"],
  optionsSuccessStatus: 200,
};

app.use(cors());
app.use(express.json());
app.set("trust proxy", true);

app.get("/", cors(corsOptions), (_, res) => {
  res.send({ status: "ok" });
});

app.listen(config.port, () => {
  console.log(`App listening on port ${config.port}`);
});

export default app;
