const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true, dropDups: true },
    email: { type: String, required: true, unique: true, dropDups: true },
    password: { type: String, required: true },
    address: { type: String, default: null },
    phone: { type: String, default: null },
    isSeller: { type: Boolean, default: false },
    isTerms: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    creationDate: { type: Date, default: Date.now },
    verificationCode: { type: String, required: true, unique: true },

    cart: [{ id: { type: mongoose.Types.ObjectId, required: true, unique: true, dropsDups: true }, quantity: { type: Number, default: 1 } }],
    wishlist: [{ id: { type: mongoose.Types.ObjectId, required: true, unique: true, dropsDups: true } }],

  articles: [{ id: { type: mongoose.Types.ObjectId, required: true }}],
  reviews: [{ rating: { type: Number, required: true }, text: { type: String, default: null }}],
    proposals: [{ id: { type: mongoose.Types.ObjectId, required: true } }],
    chats: [{ id: { type: mongoose.Types.ObjectId, required: true } }],
});

const User = mongoose.model('User', UserSchema);

module.exports = User;