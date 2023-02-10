const mongoose = require("mongoose");
const { getAuthenticatedBuyer } = require('../utils/auth');
const crypto = require('crypto');
const Buyer = require('../models/Buyer');
const Seller = require('../models/Seller');
const Item = require('../models/Item');
const Mail = require('../utils/email');
const Review = require("../models/Review");
const Proposal = require("../models/Proposal");
const Chat = require("../models/Chat");

const getInfo = async(req, res) => {
    const buyer = await getAuthenticatedBuyer(req, res);
    const ret = {
        id: buyer.id,
        firstname: buyer.firstname,
        lastname: buyer.lastname,
        username: buyer.username,
        email: buyer.email,
        addresses: buyer.addresses,
        phone: buyer.phone,
        cart: buyer.cart,
        wishlist: buyer.wishlist,
        proposals: buyer.proposals,
        isVerified: buyer.isVerified,
        isSeller: buyer.isSeller,
        sellerId: buyer.sellerId
    }
    return res.status(200).json({ buyer: ret, code: "", message: "success" });
}

const getInfoBuyer = async(req, res) => {
    // required params
    if (!req.params.id)
        return res.status(400).json({ code: "", message: "missing arguments" });

    // invalid params
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !(await Buyer.exists({ userId: req.params.id })))
        return res.status(400).json({ code: "", message: "invalid arguments" });

    let buyer = await Buyer.findOne({ _id: req.params.id });

    return res.status(200).json({ user: buyer, code: "", message: "success" });
}

const create = async(req, res) => {
    const url = process.env.FE_SERVER;
    const data = req.body;

    if (!(data.firstname && data.lastname && data.username && data.email && data.password && data.terms))
        return res.status(403).json({ code: 102, message: 'Missing arguments' });

    const hash = crypto.createHash('sha256');
    const password = hash.update(data.password, 'utf-8').digest('hex');

    let code, result;
    do {
        code = crypto.randomBytes(32).toString('hex');
        result = await Buyer.exists({ verificationCode: code });
    } while (result);

    if (await Buyer.exists({ username: data.username }))
        return res.status(422).json({ code: 103, message: "Username not available" });

    const buyer = new Buyer({
        firstname: data.firstname,
        lastname: data.lastname,
        username: data.username,
        email: data.email,
        passwordHash: password,
        addresses: { address: data.address, isDefault: true },
        phone: { prefix: data.prefix, number: data.number },
        isTerms: true,

        isVerified: false,
        verificationCode: code,
    });

    if (!data.address)
        buyer.addresses = [];

    let seller;
    if (data.isSeller && data.address && data.prefix && data.number) {
        buyer.isSeller = true;
        seller = new Seller({
            userId: buyer
        });
        buyer.sellerId = seller.id;
    }

    try {
        await buyer.save();
        if (seller)
            await seller.save();

        await Mail.send(data.email, 'Creazione Account Skupply', `Grazie per aver scelto skupply.\nPer verificare l'account apra la seguente pagina:\n${url}/verify/?email=${data.email}&code=${code}`);
        return res.status(201).json({ code: "100", message: "success" });
    } catch (error) {
        return res.status(500).json({ code: "101", message: "unable to create" });
    }
}

const edit = async(req, res) => {
    let buyer = await getAuthenticatedBuyer(req, res);

    if (req.body.firstname)
        buyer.firstname = req.body.firstname;

    if (req.body.lastname)
        buyer.lastname = req.body.lastname;

    if (req.body.password) {
        const hash = crypto.createHash('sha256');
        const password = hash.update(req.body.password, 'utf-8').digest('hex');
        buyer.passwordHash = password;
    }

    if (req.body.prefix)
        buyer.phone.prefix = req.body.prefix;

    if (req.body.number)
        buyer.phone.number = req.body.number;

    if (req.body.addresses)
        buyer.addresses = req.body.addresses

    buyer.save()
        .then(ok => {
            return res.status(200).json({ code: "", message: "success" })
        })
        .catch(err => {
            return res.status(500).json({ code: "", message: "unable to save changes" });
        });
}

const remove = async(req, res) => {
    let buyer = await getAuthenticatedBuyer(req, res);

    //remove seller
    if (buyer.isSeller) {
        let seller = await Seller.findById(buyer.sellerId);

        if (seller.items)
            seller.items.forEach(async itemId => {
                let item = await Item.findById(itemId);
                item.state = 'DELETED';
                item.save().then(ok => {}).catch(err => {
                    return res.status(500).json({ code: "", message: "unable to save changes" });
                });
            });

        if (seller.reviews) {
            await Review.deleteMany({ _id: { $in: seller.reviews } }).catch(err => { return res.status(500).json({ code: "", message: "unable to save changes" }) })
        }

        if (seller.proposals)
            seller.proposals.forEach(async proposalId => {
                let proposal = await Proposal.find({ $and: [{ _id: proposalId }, { state: 'PENDING' }] })
                proposal.state = 'DELETED'
                await proposal.save().catch(err => { return res.status(500).json({ code: "", message: "unable to save changes" }) })
            })

        Seller.deleteOne({ _id: seller._id }, err => {
            if (err)
                return res.status(500).json({ code: "", message: "unable to remove" });
        })
    }

    if (buyer.proposals)
        buyer.proposals.forEach(async proposalId => {
            let proposal = await Proposal.find({ $and: [{ _id: proposalId }, { state: 'PENDING' }] })
            proposal.state = 'DELETED'
            await proposal.save().catch(err => { return res.status(500).json({ code: "", message: "unable to save changes" }) })
        })

    if (buyer.chats) {
        await Chat.deleteMany({ $or: [{ user1: buyer._id }, { user2: buyer._id }] }).catch(err => { return res.status(500).json({ code: "", message: "unable to save changes" }) })
    }

    Buyer.deleteOne({ _id: buyer._id }, err => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to remove" });
    });

    return res.status(200).json({ code: "", message: "success" });
}

const find = async(req, res) => {
    const username = req.query.username
    if (!username) { res.status(400).json({ code: 102, message: 'Username argument is missing' }); return }

    const check = await Buyer.findOne({ username: username })
    if (check) res.status(200).json({ code: 107, message: 'Username found' })
    else res.status(200).json({ code: 104, message: 'Username available' })
};

module.exports = {
    getInfo,
    getInfoBuyer,
    create,
    find,
    edit,
    remove
};