import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import sequelize from "./src/config/db.js";
import Chat from "./src/models/chat.js";



const PORT = process.env.PORT || 5008;
const server = http.createServer(app);

// Thiết lập Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("send_message", async (data) => {
    const { Sender_ID, Receiver_ID, Message } = data;

    const chat = await Chat.create({ Sender_ID, Receiver_ID, Message });
    io.emit("receive_message", chat);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

server.listen(PORT, async () => {
  try {
    await sequelize.sync();
    console.log(`✅ Chat service running on port ${PORT}`);
  } catch (err) {
    console.error("❌ Database sync failed:", err);
  }
});
