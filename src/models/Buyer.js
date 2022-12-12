const mongoose = require('mongoose');

const BuyerSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true, unique: true, dropDups: true },
    email: { type: String, required: true, unique: true, dropDups: true },
    passwordHash: { type: String, required: true },
    addresses: [{
        address: { type: String, default: null, unique: true, dropDups: true, required: true },
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

    cart: [{ id: { type: mongoose.Types.ObjectId, required: true, unique: true, dropsDups: true }, quantity: { type: Number, default: 1 } }],
    wishlist: [{ id: { type: mongoose.Types.ObjectId, required: true, unique: true, dropsDups: true } }],
    proposals: { type: [mongoose.Types.ObjectId], required: true },

    isSeller: { type: Boolean, default: false },
    sellerId: { type: mongoose.Types.ObjectId },
});

const Buyer = mongoose.model('Buyer', BuyerSchema);

module.exports = Buyer;