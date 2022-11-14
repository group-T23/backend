const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  article: { type: String, required: true },
  state: { type: String, requried: true },
  price: { type: mongoose.Types.Decimal128, required: true },
});

const Proposal = mongoose.model('Proposal', ProposalSchema);

module.exports = Proposal