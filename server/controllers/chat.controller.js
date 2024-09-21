const Chat = require("../models/chat");
const chatController = {};

chatController.saveChat = async (message, user) => {
  const newChat = new Chat({
    chat: message,
    user: {
      id: user._id,
      name: user.name,
    },
    room: user.room,
  });

  await newChat.save();

  const newMessage = new Chat({
    chat: message,
    user: {
      id: user._id,
      name: user.name,
    },
  });
  await newMessage.save();

  return newMessage, newChat;
};

module.exports = chatController;
