const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
    article: { type: mongoose.Types.ObjectId, required: true },
    author: { type: mongoose.Types.ObjectId, required: true },
    state: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'DELETED'], default: 'PENDING', requried: true },
    price: { type: mongoose.Types.Decimal128, required: true },
});

const Proposal = mongoose.model('Proposal', ProposalSchema);

module.exports = Proposal