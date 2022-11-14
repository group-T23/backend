const mongoose = require('mongoose');

const OrderSchema = new mongoose.schema({
  buyer: { type: mongoose.Types.ObjectId, required: true },
  article: { type: mongoose.Types.ObjectId, required: true },
  price: { type: mongoose.Types.Decimal128, required: true },
  quantity: { type: Number, required: true },
  state: { type: String, required: true },
  shipment: { type: mongoose.Types.ObjectId, default: null },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order