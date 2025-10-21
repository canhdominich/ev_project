import Chat from "../models/chat.js";

//  Gửi tin nhắn
export const sendMessage = async (req, res) => {
  try {
    const { Sender_ID, Receiver_ID, Message } = req.body;

    if (!Sender_ID || !Receiver_ID || !Message) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    const chat = await Chat.create({ Sender_ID, Receiver_ID, Message });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Lấy lịch sử chat giữa 2 người
export const getChatHistory = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const chats = await Chat.findAll({
      where: {
        [Chat.sequelize.Op.or]: [
          { Sender_ID: user1, Receiver_ID: user2 },
          { Sender_ID: user2, Receiver_ID: user1 },
        ],
      },
      order: [["Timestamp", "ASC"]],
    });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
