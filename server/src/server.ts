import config from "./config";

import cors from "cors";
import express from "express";
import mysql from "mysql2/promise";
import { Connector } from "@google-cloud/cloud-sql-connector";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { User } from "./models";

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
  origin: ["https://notion-timer-5v3.pages.dev/", "http://localhost:8007"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.set("trust proxy", true);

const client = new SecretManagerServiceClient();

async function accessSecretVersion(secretName: string) {
  const [version] = await client.accessSecretVersion({ name: secretName });
  return version.payload?.data;
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
        `Unable to parse secret from Secret Manager. Make sure that the secret is JSON formatted: \n ${e} `
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

app.get("/", async (req, res) => {
  pool = pool || (await createPool());
  try {
    const [users] = await pool.query<User[]>(
      "SELECT * from `notion-timer`.users"
    );
    res.send(users);
  } catch (err) {
    console.log(err);
    res.send("Error processing query:\n" + err);
  }
});

app.listen(config.port, () => {
  console.log(`App listening on port ${config.port}`);
});

export default app;
