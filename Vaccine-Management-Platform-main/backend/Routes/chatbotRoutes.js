import express from "express";
import { isAuthenticated } from "../Middlewares/auth.js";
import { chatbotLimiter } from "../Middlewares/rateLimiters.js";
import { getChatbotContext, processQuestion } from "../Controllers/Chatbot.js";

const router = express.Router();

router.use(isAuthenticated);

// Get chatbot context (diseases and vaccines data)
router.get("/context", getChatbotContext);

// Process user question —
router.post("/ask", chatbotLimiter, processQuestion);

export default router;