import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err.message);
});


export const connectRedis = async () => {
  try {
    
    if (redisClient.isOpen) {
      console.log("Redis already connected.");
      return redisClient;
    }

    await redisClient.connect();

    console.log("Connected to Redis successfully!");
    return redisClient;
  } catch (error) {
    console.error("Failed to connect to Redis:", error.message);
    throw error;
  }
};