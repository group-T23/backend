const mongoose = require('mongoose');

const ShipmentSchema = new mongoose.schema({
  state: { type: String, required: true },
  courier: { type: String, default: null },
  trackId: { type: String, default: null },
  date: { type: Date, default: Date.now() },
});

const Shipment = mongoose.model('Shipment', ShipmentSchema);

module.exports = Shipment