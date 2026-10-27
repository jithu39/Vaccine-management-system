import { redisClient } from "../Database/redisConnection.js";

const KEY_PREFIX = "blacklist:token:";


export const blacklistToken = async (token, decodedExp) => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const ttlSeconds = decodedExp - nowInSeconds;

  if (ttlSeconds <= 0) return; 

  await redisClient.set(`${KEY_PREFIX}${token}`, "1", { EX: ttlSeconds });
};

export const isTokenBlacklisted = async (token) => {
  const result = await redisClient.get(`${KEY_PREFIX}${token}`);
  return result !== null;
};