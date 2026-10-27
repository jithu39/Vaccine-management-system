import { config } from "dotenv";
config({ path: "./config/config.env" });

import { dbConnection } from "./Database/dbConnection.js";
import { connectRedis } from "./Database/redisConnection.js";

const start = async () => {
  await dbConnection();
  await connectRedis();

  const { default: app } = await import("./app.js");

  app.listen(process.env.PORT, () => {
    console.log(`Server running at port ${process.env.PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});