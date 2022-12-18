const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    items: { type: [mongoose.Types.ObjectId], required: true },
    reviews: { type: [mongoose.Types.ObjectId], required: true },
    proposals: { type: [mongoose.Types.ObjectId], required: true },
});

const Seller = mongoose.model('Seller', SellerSchema);

module.exports = Seller;