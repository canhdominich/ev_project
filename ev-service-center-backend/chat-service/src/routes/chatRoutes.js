import express from "express";
import { sendMessage, getChatHistory } from '../controllers/chatController.js';

const router = express.Router();

router.post("/send", sendMessage);
router.get("/history/:user1/:user2", getChatHistory);

export default router;
