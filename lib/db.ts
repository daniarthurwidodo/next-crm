import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/schema";
import { createLogger } from "./logger";

const logger = createLogger({ module: "database" });

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  logger.error("Missing DATABASE_URL environment variable");
  throw new Error("Missing DATABASE_URL environment variable");
}

logger.info(
  { isProduction: process.env.NODE_ENV === "production" },
  "Initializing PostgreSQL connection pool"
);

const pool = global.__pgPool ?? new Pool({ connectionString });

if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

pool.on("error", (err: Error) => {
  logger.error(
    { error: err.message, stack: err.stack },
    "Unexpected error on idle PostgreSQL client"
  );
});

pool.on("connect", () => {
  logger.debug("New PostgreSQL client connected");
});

export const db = drizzle(pool, { schema });

export { pool };
