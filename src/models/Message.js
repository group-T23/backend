const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { id: { type: mongoose.Types.ObjectId, required: true }},
  text: { type: String, required: false },
  file: { type: String, required: false },
  date: { type: Date, default: Date.now() },
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message