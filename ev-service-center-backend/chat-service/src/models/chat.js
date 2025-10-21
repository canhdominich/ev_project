import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Chat = sequelize.define(
  "Chat",
  {
    Chat_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Sender_ID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Receiver_ID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    Timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Chats",
    timestamps: false,
  }
);

export default Chat;
