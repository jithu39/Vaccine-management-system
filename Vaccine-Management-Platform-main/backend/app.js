import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "./Middlewares/error.js";
import { globalLimiter } from "./Middlewares/rateLimiters.js";

import userRoutes from "./Routes/userRoutes.js";  
import adminRoutes from "./Routes/adminRoutes.js"; 
import residentRoutes from "./Routes/residentRoutes.js"; 
import chatbotRoutes from "./Routes/chatbotRoutes.js";  

const app = express();

const PORT = process.env.PORT || 5000;


app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(globalLimiter);

app.use("/api/users", userRoutes);  
app.use("/api/admin", adminRoutes);  
app.use("/api/resident", residentRoutes);  
app.use("/api/chatbot", chatbotRoutes);  


app.use(errorMiddleware);

export default app;