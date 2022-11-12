const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique : true, dropDups: true },
  email: { type: String, required: true, unique : true, dropDups: true },
  password: { type: String, required: true },
  address: { type: String, default: null },
  phone: { type: String, default: null },
  isSeller: { type: Boolean, default: false },
  isTerms: { type: Boolean, default: false },

  articles: [{ id: { type: mongoose.Types.ObjectId, required: true }}],
  chats: [{ id: { type: mongoose.Types.BojectId, required: true }}],
  reviews: [{ rating: { type: Number, required: true }, text: { type: String, default: null }}],
});

const User = mongoose.model('User', UserSchema);

module.exports = User;