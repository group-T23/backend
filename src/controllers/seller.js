const { getAuthenticatedBuyer } = require('../utils/auth');
const Mail = require('../utils/email');
const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const Item = require('../models/Item');
const Review = require('../models/Review');

const getInfo = async(req, res) => {
    const seller = await Seller.find({ _id: (await getAuthenticatedBuyer).sellerId });
    return res.status(200).json({ seller: seller, code: "", message: "success" });
}

const getPublicInfo = async(req, res) => {

    if (!req.query.username)
        return res.status(400).json({ code: "", message: "missing arguments" });

    if (!(await Buyer.exists({ username: req.query.username })))
        return res.status(400).json({ code: "", message: "invalid arguments" });

    const buyer = await Buyer.find({ username: req.query.username })
    const seller = await Seller.find({ _id: buyer.sellerId });

    let rating;
    seller.reviews.forEach(async reviewId => {
        const review = await Review.find({ id: reviewId });
        rating += review.rating;
    });
    rating = rating * 1.0 / seller.reviews.length;

    const pub = {
        username: buyer.username,
        rating: rating,
    }

    return res.status(200).json({ seller: pub, code: "", message: "success" });
}

const getItems = async(req, res) => {
    if (!req.query.username)
        return res.status(400).json({ code: "", message: "missing arguments" });

    if (!(await Buyer.exists({ username: req.query.username })))
        return res.status(400).json({ code: "", message: "invalid arguments" });
    const buyer = await Buyer.find({ username: req.query.username });

    if (!buyer.isSeller)
        return res.status(400).json({ code: "", message: "invalid user type" });

    const seller = await Seller.find({ _id: buyer.sellerId });
    const items = await Item.find({ ownerId: seller.id, state: 'PUBLISHED' });

    return res.status(200).json({ items: items, code: "", message: "success" });
}

const create = async(req, res) => {
    let buyer = await getAuthenticatedBuyer;

    const seller = new Seller({});
    seller.save(err => {
        if (err)
            return res.state(500).json({ code: "", message: "unable to create" });
    });

    buyer.sellerId = seller.id;
    buyer.isSeller = true;
    await buyer.save(err => {
        if (err)
            return res.state(500).json({ code: "", message: "unable to save changes" });
    });

    //TODO: notify via email
    return res.state(200).json({ code: "", message: "success" });
}

const remove = async(req, res) => {
    let seller = await Seller.find({ _id: (await getAuthenticatedBuyer).sellerId });

    seller.items.forEach(async itemId => {
        let item = await Item.find({ _id: itemId });
        item.state = 'DELETED';
        await item.save(err => {
            if (err)
                return res.status(500).json({ code: "", message: "unable to save changes" });
        });
    });

    await Seller.deleteOne({ id: seller.id }, err => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to remove" });
    });

    return res.status(200).json({ code: "", message: "success" });
};



module.exports = {
    getInfo,
    getPublicInfo,
    getItems,
    create,
    addItem,
    remove
};