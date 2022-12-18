const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    ownerId: { type: mongoose.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, default: 1 },
    categories: { type: [mongoose.Types.ObjectId], required: true },
    photos: { type: [String], required: true },
    conditions: { type: String, enum: ['NEW', 'LIKE_NEW', 'GOOD', 'USED'], required: true },
    price: { type: mongoose.Types.Decimal128, required: true },
    city: { type: String },
    state: { type: String, enum: ['DRAFT', 'PUBLISHED', 'SOLD', 'DELETED'], default: 'DRAFT', required: true },

    pickUpAvail: { type: Boolean, default: false },

    shipmentAvail: { type: Boolean, default: true },
    shipmentCost: { type: mongoose.Types.Decimal128, default: 0.0 }
});

const Item = mongoose.model('Item', ItemSchema);

module.exports = Item