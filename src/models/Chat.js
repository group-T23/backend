const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  user1: { type: mongoose.Types.ObjectId, required: true },
  user2: { type: mongoose.Types.ObjectId, required: true },
  path: { type: String, required: true }, // Path referring to the Chat file
  lastMessage: [{ text: { type: String, required: true },
                  date: { type: Date, required: true }}],
});

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat