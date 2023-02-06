const { default: mongoose } = require('mongoose');
const Buyer = require('../models/Buyer');
const Review = require('../models/Review');
const Seller = require('../models/Seller');
const { getAuthenticatedBuyer } = require('../utils/auth');

const create = async(req, res) => {
    //required params
    if (!req.body.title || req.body.rating == undefined || !req.body.sellerId)
        return res.status(400).json({ code: "802", message: "missing arguments" });

    // params validity
    if (!Number.isInteger(req.body.rating) || !(0 <= req.body.rating && req.body.rating <= 5) || !String.toString(req.body.title).length > 0)
        return res.status(400).json({ code: "803", message: "invalid arguments" });

    if (!mongoose.Types.ObjectId.isValid(req.body.sellerId) || !(await Seller.exists({ id: req.body.sellerId })))
        return res.status(400).json({ code: "803", message: "invalid arguments" });

    const author = await getAuthenticatedBuyer(req, res);
    const seller = await Seller.findById(req.body.sellerId);
    const review = new Review({
        authorId: author._id,
        sellerId: req.body.sellerId,
        title: req.body.title,
        description: req.body.description,
        rating: req.body.rating
    });

    try {
        await review.save()
        seller.reviews.push(review.id)
        await seller.save()

        return res.status(200).json({ code: "800", message: "success" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ code: "801", message: "Error while creating review" });
    }
}

/**
 * la funzione ritorna la lista delle recensioni che hanno come seller_id 
 * quello definito del parametro dell'url
 */
const getSellerReviews = async(req, res) => {
    // required params
    if (!req.params.id)
        return res.status(400).json({ code: "802", message: "missing arguments" });

    const id = req.params.id;

    // params validity
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ code: "803", message: "invalid arguments" });

    //ricerca delle recensioni
    var ObjectId = require('mongodb').ObjectId;
    const result = await Review.find({ sellerId: ObjectId(id) });

    return res.status(200).json({ reviews: result, code: "800", message: "success" });
}

const getInfo = async(req, res) => {
    // required params
    if (!req.params.id)
        return res.status(400).json({ code: "802", message: "missing arguments" });

    // params validity
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !(await Review.exists({ id: req.params.id })))
        return res.status(400).json({ code: "803", message: "invalid arguments" });

    const review = await Review.findById(req.params.id);

    let pub = null;
    if (review) {
        pub = {
            username: await Buyer.findById(review.authorId).username,
            title: review.title,
            description: review.description,
            rating: review.rating
        };
    }

    return res.status(200).json({ review: pub, code: "800", message: "success" });
}

const getAllIn = async(req, res) => {
    const buyer = await getAuthenticatedBuyer;

    if (!buyer.isSeller)
        return res.status(400).json({ code: "807", message: "invalid user type" });

    const seller = await Seller.find({ id: buyer.sellerId });
    const reviews = (await Review.find({ "id": { '$in': [seller.reviews] } }));

    return res.status(200).json({ reviews: reviews, code: "800", message: "success" });
}

const getAllOut = async(req, res) => {
    const buyer = await getAuthenticatedBuyer;
    const reviews = await Review.find({ authorId: buyer.id });
    return res.status(200).json({ reviews: reviews, code: "800", message: "success" });
}

const remove = async(req, res) => {
    //required params
    if (!req.body.id)
        return res.status(400).json({ code: "802", message: "missing arguments" });

    // params validity
    if (!mongoose.Types.ObjectId.isValid(req.body.id) || !(await Review.exists({ id: req.body.id })))
        return res.status(400).json({ code: "803", message: "invalid arguments" });

    const review = Review.findById(req.body.id);
    let seller = Seller.findById(review.userId);

    //remove from seller
    seller.reviews = seller.reviews.filter(rid => { return rid != review.id });
    await seller.save().catch(err => {
        return res.status(500).json({ code: "801", message: "unable to save changes" });
    })

    //remove from DB
    await Review.deleteOne({ id: review.id }, err => {
        if (err)
            return res.status(500).json({ code: "801", message: "unable to delete" });
    })

    return res.status(200).json({ code: "800", message: "success" });
}


module.exports = {
    create,
    getSellerReviews,
    getInfo,
    getAllIn,
    getAllOut,
    remove
};