const mongoose = require('mongoose');

const ArticleSchema = new mongoose.schema({
  title: { type: String, required: true },
  description: { type: String, default: null },
  state: { type: String, required: true },
  price: { type: mongoose.Types.Decimal128, required: true },
  quantity: { type: Number, required: true },
  shipment: { type: String, required: true },
  shipmentPrice: { type: mongoose.Types.Decimal128, default: 0.0 },
  handDeliver: { type: Bollean, default: false },
  handDeliverZone: { type: String, default: null },
  isPublished: { type: Boolean, default: false },

  categories: [{ id: { type: mongoose.Types.ObjectId, required: true }}],
  photos: [{ path: { type: String, required: true }}],
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article