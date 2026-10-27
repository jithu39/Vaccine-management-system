import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../Database/redisConnection.js";

const makeRedisStore = (prefix) =>
  new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix,
  });


export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore("rl:global:"),
  message: { success: false, message: "Too many requests. Please try again later." },
});


export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore("rl:login:"),
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
});


export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore("rl:register:"),
  message: { success: false, message: "Too many accounts created from this address. Please try again later." },
});


export const chatbotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore("rl:chatbot:"),
  keyGenerator: (req) => (req.user?._id ? String(req.user._id) : req.ip),
  message: { success: false, message: "Too many chatbot requests. Please slow down and try again shortly." },
});

export const residentWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore("rl:resident-write:"),
  keyGenerator: (req) => (req.user?._id ? String(req.user._id) : req.ip),
  message: { success: false, message: "Too many requests. Please try again shortly." },
});