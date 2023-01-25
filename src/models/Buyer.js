const mongoose = require('mongoose');

const BuyerSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true, unique: true, dropDups: true },
    email: { type: String, required: true, unique: true, dropDups: true },
    passwordHash: { type: String, required: true },
    addresses: [{
        address: { type: String, default: null },
        isVerified: { type: Boolean, default: false },
        isDefault: { type: Boolean, default: false }
    }],
    phone: {
        prefix: { type: String, default: null },
        number: { type: String, default: null }
    },
    isTerms: { type: Boolean, default: false },

    isVerified: { type: Boolean, default: false },
    creationDate: { type: Date, default: Date.now },
    verificationCode: { type: String, required: true, unique: true },

    cart: [{ id: { type: mongoose.Types.ObjectId, required: true }, quantity: { type: Number, default: 1 } }],
    wishlist: [{ id: { type: mongoose.Types.ObjectId, required: true } }],
    proposals: { type: [mongoose.Types.ObjectId], required: true },
    chats: { type: [mongoose.Types.ObjectId], required: true },

    isSeller: { type: Boolean, default: false },
    sellerId: { type: mongoose.Types.ObjectId, default: null },
});

const Buyer = mongoose.model('Buyer', BuyerSchema);

module.exports = Buyer;