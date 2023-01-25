const { getAuthenticatedBuyer } = require('../utils/auth');
const Mail = require('../utils/email');
const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const Item = require('../models/Item');
const Review = require('../models/Review');

const getInfo = async(req, res) => {
    const buyer = await getAuthenticatedBuyer(req, res);
    if (!buyer.isSeller)
        return res.status(422).json({ code: "", message: "invalid account type" });

    const seller = await Seller.findById(buyer.sellerId);
    return res.status(200).json({ seller: seller, code: "", message: "success" });
}

const getPublicInfo = async(req, res) => {

    if (!req.params.username)
        return res.status(400).json({ code: "", message: "missing arguments" });

    if (!(await Buyer.exists({ username: req.params.username })))
        return res.status(400).json({ code: "", message: "invalid arguments" });

    const buyer = await Buyer.findOne({ username: req.params.username })

    if (!buyer.isSeller)
        return res.status(422).json({ code: "", message: "invalid account type" });

    const seller = await Seller.findById(buyer.sellerId);

    var rating = null;
    
    //calcolo media recensioni di ogni utente
    if(seller.reviews) {
        const rt = await Review.aggregate(
            [
                {
                    "$group":
                    {
                        _id: "$sellerId",
                        requests: {$sum: 1},
                        avgRating: { $avg: "$rating"}
                    }
                }
            ]
        );

        //ricerco all'interno dei gruppi quello del venditore ricercato usando seller.userId
        let found = false;
        for(let i=0; i<rt.length && !found; i++){
            if((rt[i]._id).equals(seller.userId)){
                found = true;
                rating = rt[i].avgRating;
            }
        }
    }

    const pub = {
        username: buyer.username,
        rating: rating,
    }

    return res.status(200).json({ seller: pub, code: "", message: "success" });
}

const create = async(req, res) => {
    let buyer = await getAuthenticatedBuyer(req, res);

    if (buyer.isSeller)
        return res.status(422).json({ code: "", message: "unable to create, the buyer is already a seller" });

    const seller = new Seller({
        userId: buyer.id,
    });
    seller.save()
        .then(ok => {})
        .catch(err => {
            return res.status(500).json({ code: "", message: "unable to create" });
        });

    buyer.sellerId = seller.id;
    buyer.isSeller = true;
    buyer.save()
        .then(ok => {})
        .catch(err => {
            return res.status(500).json({ code: "", message: "unable to save changes" });
        });

    //TODO: notify via email
    return res.status(201).json({ code: "", message: "success" });
}

const remove = async(req, res) => {
    const buyer = await getAuthenticatedBuyer(req, res);
    if (!buyer.isSeller)
        return res.status(422).json({ code: "", message: "invalid account type" });

    let seller = await Seller.findById(buyer.sellerId)

    if (seller.items)
        seller.items.forEach(async itemId => {
            let item = await Item.findById(itemId);
            item.state = 'DELETED';
            item.save().catch(err => {
                if (err)
                    return res.status(500).json({ code: "", message: "unable to save changes" });
            });
        });

    Seller.deleteOne({ id: seller.id })
        .then(ok => {})
        .catch(err => {
            return res.status(500).json({ code: "", message: "unable to remove" });
        });

    buyer.isSeller = false;
    buyer.save()
        .then(ok => {
            return res.status(200).json({ code: "", message: "success" });
        })
        .catch(err => {
            return res.status(500).json({ code: "", message: "unable to save changes" });
        })
};


module.exports = {
    getInfo,
    getPublicInfo,
    create,
    remove
};