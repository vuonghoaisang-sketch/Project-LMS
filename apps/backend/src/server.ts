import "dotenv/config";

import app from "./app";
import db from "./config/database";

const port = Number(process.env.PORT ?? 5000);

async function startServer() {
  let connection: Awaited<ReturnType<typeof db.getConnection>> | undefined;

  try {
    connection = await db.getConnection();
    connection.release();
    connection = undefined;

    const server = app.listen(port, () => {
      console.log(`API listening on port ${port}`);
    });

    const shutdown = () => {
      server.close(() => {
        void db.end().finally(() => process.exit(0));
      });
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    connection?.release();
    console.error("Could not start the API because MySQL is unavailable.", error);
    process.exitCode = 1;
  }
}

void startServer();
