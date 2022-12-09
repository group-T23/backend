const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  user1: { id: { type: mongoose.Types.ObjectId, required: true }},
  user2: { id: { type: mongoose.Types.ObjectId, required: true }},
  messages: [{ id: { type: mongoose.Types.ObjectId }}],
});

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat