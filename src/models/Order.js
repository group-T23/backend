const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Types.ObjectId, required: true },
  articles: [{id: { type: mongoose.Types.ObjectId, required: true }, quantity: {type: Number, required: true}}],
  date: { type: Date, default: Date.now },
  price: { type: mongoose.Types.Decimal128, required: true },
  shipment: { type: mongoose.Types.Decimal128, required: true },
  state: { type: String, required: true },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order