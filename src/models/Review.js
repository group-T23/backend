const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    authorId: { type: mongoose.Types.ObjectId, required: true },
    sellerId: { type: mongoose.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String },
    rating: { type: Number, required: true },
});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;