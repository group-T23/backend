const { getAuthenticatedUser } = require('../utils/auth');
const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const Item = require('../models/Item');
const Review = require('../models/Review');

const getInfo = async(req, res) => {
    const buyer = await getAuthenticatedUser(req, res);
    if (!buyer.isSeller)
        return res.status(422).json({ code: '0103', message: 'Invalid Arguments' });

    const seller = await Seller.findById(buyer.sellerId);
    return res.status(200).json({ seller: seller, code: '0100', message: 'Success' });
}

const getPublicInfo = async(req, res) => {
    if (!req.query.username && !req.query.id)
        return res.status(400).json({ code: '0102', message: 'Missing Arguments' });

    let seller
    let buyer

    if (req.query.username) {
        if (!(await Buyer.exists({ username: req.query.username })))
            return res.status(400).json({ code: '0102', message: 'Invalid Arguments' });

        buyer = await Buyer.findOne({ username: req.query.username })
        seller = await Seller.findById(buyer.sellerId);

    } else if (req.query.id) {
        if (!(await Seller.exists({ id: req.query.id })))
            return res.status(400).json({ code: '0102', message: 'Invalid Arguments' });

        seller = await Seller.findById(req.query.id);
        buyer = await Buyer.findById(seller.userId);
    }

    var rating = null;

    //calcolo media recensioni di ogni utente
    if (seller.reviews) {
        const rt = await Review.aggregate(
            [{
                "$group": {
                    _id: "$sellerId",
                    requests: { $sum: 1 },
                    avgRating: { $avg: "$rating" }
                }
            }]
        );

        let found = false;
        for (let i = 0; i < rt.length && !found; i++) {
            if ((rt[i]._id).equals(seller._id)) {
                found = true;
                rating = rt[i].avgRating;
            }
        }
    }

    const pub = {
        username: buyer.username,
        rating: rating,
    }

    return res.status(200).json({ seller: pub, code: '0100', message: 'Success' });
}


const create = async(req, res) => {
    let buyer = await getAuthenticatedUser(req, res);

    if (buyer.isSeller)
        return res.status(422).json({ code: '0104', message: 'User Already Seller' });

    const seller = new Seller({
        userId: buyer.id,
    });
    seller.save()
        .then(ok => {})
        .catch(err => {
            return res.status(500).json({ code: '0101', message: 'Database Error' });
        });

    buyer.sellerId = seller.id;
    buyer.isSeller = true;
    buyer.save()
        .then(ok => {})
        .catch(err => {
            return res.status(500).json({ code: '0101', message: 'Database Error' });
        });

    return res.status(201).json({ code: '0100', message: 'Success' });
}

const remove = async(req, res) => {
    const buyer = await getAuthenticatedUser(req, res);
    if (!buyer.isSeller)
        return res.status(422).json({ code: '0103', message: 'Invalid Arguments' });

    let seller = await Seller.findById(buyer.sellerId)

    if (seller.items)
        seller.items.forEach(async itemId => {
            let item = await Item.findById(itemId);
            item.state = 'DELETED';
            await item.save().catch(err => {
                return res.status(500).json({ code: '0101', message: 'Database Error' });
            });
        });

    Seller.deleteOne({ id: seller.id })
        .then(ok => {})
        .catch(err => {
            return res.status(500).json({ code: '0101', message: 'Database Error' });
        });

    buyer.isSeller = false;
    buyer.save()
        .then(ok => {
            return res.status(200).json({ code: '0100', message: 'Success' });
        })
        .catch(err => {
            return res.status(500).json({ code: '0101', message: 'Database Error' });
        })
};


module.exports = {
    getInfo,
    getPublicInfo,
    create,
    remove
};