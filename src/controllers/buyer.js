const mongoose = require("mongoose");
const { getAuthenticatedUser } = require('../utils/auth');
const crypto = require('crypto');
const Buyer = require('../models/Buyer');
const Seller = require('../models/Seller');
const Item = require('../models/Item');
const Mail = require('../utils/email');
const Review = require("../models/Review");
const Proposal = require("../models/Proposal");
const Chat = require("../models/Chat");

const getInfo = async(req, res) => {
    const user = await getAuthenticatedUser(req, res);

    // Filtering attributes returned by backend
    const buyer = {
      id: user.id, firstname: user.firstname, lastname: user.lastname,
      username: user.username, email: user.email, addresses: user.addresses,
      phone: user.phone, cart: user.cart, wishlist: user.wishlist, proposal: user.proposal,
      isVerified: user.isVerified, isSeller: user.isSeller, sellerId: user.isSeller
    };

    return res.status(200).json({ buyer, code: '0000', message: 'Success' });
}

const getInfoBuyer = async(req, res) => {
    const parameters = req.params;
    const required = ['id'];

    if (!required.every(param => parameters.hasOwnProperty(param)))
        return res.status(400).json({ code: '0002', message: 'Missing Arguments' });

    const valid = mongoose.Types.ObjectId.isValid(parameters.id);
    const exists = await Buyer.exists({ userId: parameters.id });
    if (!valid || !exists)
        return res.status(400).json({ code: '0003', message: 'Invalid Arguments' });

    const buyer = await Buyer.findById(parameters.id);
    return res.status(200).json({ user: buyer, code: '0000', message: "Success" });
}

const create = async(req, res) => {
    const body = req.body;
    const required = ['firstname', 'lastname', 'username', 'email', 'password', 'terms'];

    if (!required.every(param => parameters.hasOwnProperty(param)))
        return res.status(400).json({ code: '0002', message: 'Missing Arguments' });

    const hash = crypto.createHash('sha256');
    const password = hash.update(data.password, 'utf-8').digest('hex');

    let code = null;
    let result = null;
    do {
      code = crypto.randomBytes(32).toString('hex');
      result = await Buyer.exists({ verificationCode: code });
    } while (result);

    if (await Buyer.exists({ username: body.username }))
        return res.status(422).json({ code: '0004', message: "Username Not Available" });

    const buyer = new Buyer({
        firstname: body.firstname,
        lastname: body.lastname,
        username: body.username,
        email: body.email,
        passwordHash: password,
        addresses: { address: body.address, isDefault: true },
        phone: { prefix: body.prefix, number: body.number },
        isTerms: body.terms,

        isVerified: false,
        verificationCode: code,
    });

    if (!body.address)
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

        const frontend = process.env.FE_SERVER;
        await Mail.send(data.email, 'Creazione Account Skupply', `Grazie per aver scelto skupply.\nPer verificare l'account apra la seguente pagina:\n${frontend}/verify/?email=${data.email}&code=${code}`);
        return res.status(201).json({ code: '0000', message: 'Success' });
    } catch (error) {
        return res.status(500).json({ code: '0001', message: 'Database Error' });
    }
}

const edit = async(req, res) => {
    let buyer = await getAuthenticatedUser(req, res);

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
            return res.status(200).json({ code: '0000', message: 'Success' })
        })
        .catch(err => {
            return res.status(500).json({ code: '0001', message: 'Database Error' });
        });
}

const remove = async(req, res) => {
    let buyer = await getAuthenticateder(req, res);

    //remove seller
    if (buyer.isSeller) {
        let seller = await Seller.findById(buyer.sellerId);

        if (seller.items)
            seller.items.forEach(async itemId => {
                let item = await Item.findById(itemId);
                item.state = 'DELETED';
                item.save().then(ok => {}).catch(err => {
                    return res.status(500).json({ code: '0001', message: 'Database Error' });
                });
            });

        if (seller.reviews) {
            await Review.deleteMany({ _id: { $in: seller.reviews } }).catch(err => { return res.status(500).json({ code: '0001', message: 'Database Error' }) })
        }

        if (seller.proposals)
            seller.proposals.forEach(async proposalId => {
                let proposal = await Proposal.find({ $and: [{ _id: proposalId }, { state: 'PENDING' }] })
                proposal.state = 'DELETED'
                await proposal.save().catch(err => { return res.status(500).json({ code: '0001', message: 'Database Error' }) })
            })

        Seller.deleteOne({ _id: seller._id }, err => {
            if (err)
                return res.status(500).json({ code: '0001', message: 'Database Error' });
        })
    }

    if (buyer.proposals)
        buyer.proposals.forEach(async proposalId => {
            let proposal = await Proposal.find({ $and: [{ _id: proposalId }, { state: 'PENDING' }] })
            proposal.state = 'DELETED'
            await proposal.save().catch(err => { return res.status(500).json({ code: '0001', message: 'Database Error' }) })
        })

    if (buyer.chats) {
        await Chat.deleteMany({ $or: [{ user1: buyer._id }, { user2: buyer._id }] }).catch(err => { return res.status(500).json({ code: '0001', message: 'Database Error' }) })
    }

    Buyer.deleteOne({ _id: buyer._id }, err => {
        if (err)
            return res.status(500).json({ code: '0001', message: 'Database Error' });
    });

    return res.status(200).json({ code: '0000', message: 'Success' });
}

const find = async(req, res) => {
    const username = req.query.username
    if (!username) { res.status(400).json({ code: '0002', message: 'Missing Arguments' }); return }

    const check = await Buyer.findOne({ username: username })
    if (check) res.status(404).json({ code: '0006', message: 'Username Found' })
    else res.status(200).json({ code: '0005', message: 'Username Available' })
};

module.exports = {
    getInfo,
    getInfoBuyer,
    create,
    find,
    edit,
    remove
};