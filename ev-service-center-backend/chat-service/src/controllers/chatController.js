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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const where = {
      [Chat.sequelize.Op.or]: [
        { Sender_ID: user1, Receiver_ID: user2 },
        { Sender_ID: user2, Receiver_ID: user1 },
      ],
    };
    const { rows, count } = await Chat.findAndCountAll({
      where,
      limit,
      offset,
      order: [["Timestamp", "ASC"]],
    });
    res.status(200).json({
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      hasNext: offset + limit < count,
      hasPrev: page > 1,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
