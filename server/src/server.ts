import config from "./config";

import cors from "cors";
import express from "express";
import mysql from "mysql2/promise";
import { Connector } from "@google-cloud/cloud-sql-connector";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import {
  createNewProject,
  createNewSession,
  deleteProject,
  getAllProjects,
  getLastSession,
  updateProjectName,
  updateSessionLabel,
  updateSessionTime,
} from "./api";
import { Project, Session, User } from "./models";

const INSTANCE_CONNECTION_NAME = "notion-timer:us-central1:notion-timer-db";

const connectWithConnector = async (config: mysql.PoolOptions) => {
  // Note: Saving credentials in environment variables is convenient, but not
  // secure - consider a more secure solution such as
  // Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
  // keep secrets safe.
  const connector = new Connector();
  const clientOpts = await connector.getOptions({
    instanceConnectionName:
      process.env.INSTANCE_CONNECTION_NAME || INSTANCE_CONNECTION_NAME,
  });
  const dbConfig = {
    ...clientOpts,
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    ...config,
  };
  // Establish a connection to the database.
  return mysql.createPool(dbConfig);
};

const app = express();

const corsOptions = {
  origin: [
    "https://notion-timer-5v3.pages.dev",
    /\.notion-timer-5v3\.pages\.dev/,
    /\.notion-timer-5v3\.pages\.dev\//,
    "http://localhost:5173",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);

const client = new SecretManagerServiceClient();

async function accessSecretVersion(secretName: string) {
  try {
    const [version] = await client.accessSecretVersion({ name: secretName });
    return version.payload?.data;
  } catch (err) {
    console.error(err);
  }
}

const createPool = async () => {
  const config = {
    connectionLimit: 5,
    connectTimeout: 10000, // 10 seconds
    // 'waitForConnections' determines the pool's action when no connections are
    // free. If true, the request will queued and a connection will be presented
    // when ready. If false, the pool will call back with an error.
    waitForConnections: true, // Default: true
    // 'queueLimit' is the maximum number of requests for connections the pool
    // will queue at once before returning an error. If 0, there is no limit.
    queueLimit: 0, // Default: 0
  };

  // Check if a Secret Manager secret version is defined
  // If a version is defined, retrieve the secret from Secret Manager and set as the DB_PASS
  const { CLOUD_SQL_CREDENTIALS_SECRET } = process.env;
  if (CLOUD_SQL_CREDENTIALS_SECRET) {
    const secrets = await accessSecretVersion(CLOUD_SQL_CREDENTIALS_SECRET);
    try {
      process.env.DB_PASS = secrets?.toString();
    } catch (e) {
      throw new Error(
        `Unable to parse secret from Secret Manager. Make sure that the secret is JSON formatted: \n ${e} `,
      );
    }
  }

  return connectWithConnector(config);
};

// Set up a variable to hold our connection pool. It would be safe to
// initialize this right away, but we defer its instantiation to ease
// testing different configurations.
let pool: mysql.Pool;

app.use(async (req, res, next) => {
  if (pool) {
    return next();
  }
  try {
    pool = await createPool();
    next();
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

app.get("/user/:userId/context", async (req, res) => {
  pool = pool || (await createPool());
  try {
    const userId = req.params.userId;

    // ensures user has at least one project & session
    await getLastSession(userId, pool);

    const raw = await getAllProjects(userId, pool);

    if (raw.length == 0)
      throw new Error("Couldn't find user with ID: " + req.params.userId);

    // build FE model

    const sessionMap = new Map<string, (Project & Session & User)[]>();
    raw.forEach((proj) => {
      const current = sessionMap.get(proj.project_id) ?? [];
      sessionMap.set(proj.project_id, current.concat(proj));
    });

    const userCtx = {
      user: {
        user_id: raw[0].user_id,
        name: raw[0].name,
        default_color: raw[0].default_color,
      } as User,
      projects: Array.from(sessionMap.values()).map((sessions) => {
        const sesh = sessions[0];
        return {
          project_id: sesh.project_id,
          project_name: sesh.project_name,
          color: sesh.color,
          sessions: sessions.filter((s) => s.session_id != null),
        };
      }),
    };

    res.send({ context: userCtx });
  } catch (e) {
    console.log(e);
    res.send("Error retrieving user context" + e);
  }
});

app.get("/user/:userId/lastSession", async (req, res) => {
  pool = pool || (await createPool());
  try {
    const session = await getLastSession(req.params.userId, pool);
    res.send({ session });
  } catch (e) {
    console.log(e);
    res.send("Error retrieving last session" + e);
  }
});

app.post("/session/:sessionId/label", async (req, res) => {
  pool = pool || (await createPool());
  try {
    const maybeLabel = req.body?.label;
    if (typeof maybeLabel != "string") {
      res.status(422).send("Invalid request body");
      return;
    }
    await updateSessionLabel(req.params.sessionId, maybeLabel, pool);

    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.send("Error updating label" + e);
  }
});

app.post("/session/:sessionId/time", async (req, res) => {
  pool = pool || (await createPool());
  try {
    const maybeTime = parseInt(req.body?.time);
    if (!maybeTime) {
      res.status(422).send("Invalid request body");
      return;
    }
    await updateSessionTime(req.params.sessionId, maybeTime, pool);
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.send("Error updating session time" + e);
  }
});

app.post("/project/new", async (req, res) => {
  pool = pool || (await createPool());
  try {
    const maybeUserId = req.body?.userId;
    if (!maybeUserId) {
      res.status(422).send("Invalid request body, userId not found");
      return;
    }
    await createNewProject(maybeUserId, pool);
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.send("Error creating project" + e);
  }
});

app.post("/project/:projectId/newsession", async (req, res) => {
  pool = pool || (await createPool());
  try {
    const maybeUserId = req.body?.userId;
    if (!maybeUserId) {
      res.status(422).send("Invalid request body, userId not found");
      return;
    }
    await createNewSession(maybeUserId, req.params.projectId, pool);
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.send("Error creating session" + e);
  }
});

app.post("/project/:projectId/name", async (req, res) => {
  pool = pool || (await createPool());
  try {
    const maybeUserId = req.body?.userId;
    const maybeName = req.body?.name;
    console.log("BODY", req.body);
    if (!maybeUserId) {
      res.status(422).send("Invalid request body, userId not found");
      return;
    }
    if (!maybeName) {
      res.status(422).send("Invalid request body, name not found");
      return;
    }
    await updateProjectName(maybeUserId, req.params.projectId, maybeName, pool);
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.send("Error updating project name" + e);
  }
});

app.post("/project/:projectId/delete", async (req, res) => {
  pool = pool || (await createPool());
  try {
    const maybeUserId = req.body?.userId;
    if (!maybeUserId) {
      res.status(422).send("Invalid request body, userId not found");
      return;
    }
    await deleteProject(maybeUserId, req.params.projectId, pool);
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.send("Error updating project name" + e);
  }
});

app.listen(config.port, () => {
  console.log(`App listening on port ${config.port}`);
});

export default app;
