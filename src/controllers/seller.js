const { getAuthenticatedBuyer } = require('../utils/auth');
const mail = require('../utils/email');
const Seller = require('../models/Seller');
const Seller = require('../model/Buyer');
const Buyer = require('../models/Buyer');
const Item = require('../models/Item')

const getInfo = async(req, res) => {
    const seller = Seller.find({ _id: getAuthenticatedBuyer.sellerId });
    return res.status(200).json({ seller: seller, code: "", message: "success" });
}

const getPublicInfo = async(req, res) => {
    //FIXME: req.username or req.query.username ??  
    if (!req.username)
        return res.status(400).json({ code: "", message: "missing arguments" });

    if (!(await Buyer.exists({ username: req.username })))
        return res.status(400).json({ code: "", message: "invalid arguments" });

    const buyer = Buyer.find({ username: req.username })
    const seller = Seller.find({ _id: buyer.sellerId });

    let rating;
    seller.reviews.forEach(review => {
        rating += review;
    });
    rating = rating * 1.0 / seller.reviews.length;

    const pub = {
        username: buyer.username,
        items: seller.items,
        rating: rating,
    }

    return res.status(200).json({ seller: pub, code: "", message: "success" });
}

const getItems = async(req, res) => {
    if (!req.username)
        return res.status(400).json({ code: "", message: "missing arguments" });

    if (!(await Buyer.exists({ username: req.username })))
        return res.status(400).json({ code: "", message: "invalid arguments" });

    const seller = Seller.find({ _id: getAuthenticatedBuyer.sellerId });
    let items = seller.items.filter((i) => { return i.state == 'PUBLISHED' });

    return res.status(200).json({ items: items, code: "", message: "success" });
}

const create = async(req, res) => {
    let buyer = getAuthenticatedBuyer;

    const seller = new Seller({});
    seller.save(err => {
        if (err)
            return res.state(500).json({ code: "", message: "unable to create" });
    });

    buyer.sellerId = seller.id;
    buyer.isSeller = true;
    buyer.save(err => {
        if (err)
            return res.state(500).json({ code: "", message: "unable to save changes" });
    });

    return res.state(200).json({ code: "", message: "success" });
}

const remove = async(req, res) => {
    let seller = Seller.find({ _id: getAuthenticatedBuyer.sellerId });

    seller.items.forEach(itemId => {
        let item = Item.find({ _id: itemId });
        item.state = 'DELETED';
        item.save(err => {
            if (err)
                return res.status(500).json({ code: "", message: "unable to save changes" });
        });
    });

    seller.remove(err => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to remove" });
    })

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