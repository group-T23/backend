const mongoose = require('mongoose');
const Item = require("../models/Item");
const Seller = require("../models/Seller");
const Proposal = require("../models/Proposal");
const { getAuthenticatedBuyer } = require('../utils/auth');


const create = async(req, res) => {

    // required params
    if (!(req.body.itemId && req.body.price))
        return res.status(400).json({ code: "", massage: "missing arguments" });

    let valid = true;
    // article ID must exist
    if (valid)
        valid = mongoose.Types.ObjectId.isValid(req.body.itemId) && (await Item.exists({ _id: req.body.itemId }));


    let author = await getAuthenticatedBuyer;

    // only one proposal can exists for one author and one item
    // TODO: discuss
    if (valid)
        valid = !(await Proposal.exists({ item_id: req.body.itemId, author_id: req.body.authorId }));

    // the author of the proposal must be different from the item owner
    if (valid)
        valid = !author.isSeller || !(await Seller.find({ id: author.sellerId })).items.includes(req.body.itemId);


    if (!valid)
        return res.status(500).json({ code: "", message: "invalid arguments" });

    let proposal = new Proposal({
        itemId: req.body.itemId,
        authorId: author.id,
        state: 'PENDING',
        price: req.body.price
    })

    proposal.save(err => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to create" });
    });

    author.proposals.push(proposal);
    await author.save(err => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to save changes" });
    })

    const item = await Item.find({ id: req.body.itemId });
    let seller = await Seller.find({ id: item.ownerId });
    seller.proposals.push(proposal);
    await seller.save(err => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to save changes" });
    });

    return res.status(200).json({ code: "", message: "success" });
}

const getInfo = async(req, res) => {
    if (!req.query.id)
        return res.status(400).json({ code: "", massage: "missing arguments" });

    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Proposal.exists({ id: req.query.id })))
        return res.status(500).json({ code: "", message: "invalid arguments" });

    let proposal = await Proposal.find({ id: req.query.id });
    return res.status(200).json({ proposal: proposal, code: "", message: "success" });
}

const getAllIn = async(req, res) => {
    const buyer = await getAuthenticatedBuyer;

    if (!buyer.isSeller)
        return res.state(400).json({ code: "", message: "invalid user type" });

    const seller = await Seller.find({ id: buyer.sellerId });
    const proposals = (await Proposal.find({})).filter(i => seller.items.includes(i));

    return res.status(200).json({ proposals: proposals, code: "", message: "success" });
}

const getAllOut = async(req, res) => {
    const buyer = await getAuthenticatedBuyer;
    const proposals = await Proposal.find({ authorId: buyer.id });
    return res.status(200).json({ proposals: proposals, code: "", message: "success" });
}

const accept = async(req, res) => {

    // required params
    if (!req.query.id)
        return res.status(400).json({ code: "", massage: "missing arguments" });

    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Proposal.exists({ id: req.query.id })))
        return res.status(500).json({ code: "", message: "invalid arguments" });
    let proposal = await Proposal.find({ id: req.query.id });

    //proposal must be in 'PENDING' state
    if (proposal.state != 'PENDING')
        return res.status(500).json({ code: "", message: "invalid proposal state" });

    proposal.state = 'ACCEPTED';
    await proposal.save(err => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to accept" });
    });

    //TODO: notify owner and buyer via email
    return res.status(200).json({ code: "", message: "success" });
}

const reject = async(req, res) => {

    // required params
    if (!req.query.id)
        return res.status(400).json({ code: "", massage: "missing arguments" });

    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Proposal.exists({ id: req.query.id })))
        return res.status(500).json({ code: "", message: "invalid arguments" });
    let proposal = await Proposal.find({ id: req.query.id });

    //proposal must be in 'PENDING' state
    if (proposal.state != 'PENDING')
        return res.status(500).json({ code: "", message: "invalid proposal state" });

    proposal.state = 'REJECTED';
    await proposal.save(err => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to reject" });
    });

    //TODO: notify owner and buyer via email
    return res.status(200).json({ code: "", message: "success" });
}

const remove = async(req, res) => {

    // required params
    if (!req.query.id)
        return res.status(400).json({ code: "", massage: "missing arguments" });

    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Proposal.exists({ id: req.query.id })))
        return res.status(500).json({ code: "", message: "invalid arguments" });
    let proposal = await Proposal.find({ id: req.query.id });

    //proposal must be in 'PENDING' state
    if (proposal.state != 'PENDING')
        return res.status(500).json({ code: "", message: "invalid proposal state" });

    proposal.state = 'DELETED';
    await proposal.save(err => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to delete" });
    });

    //TODO: notify owner and buyer via email
    return res.status(200).json({ code: "", message: "success" });
}


module.exports = {
    create,
    getInfo,
    getAllIn,
    getAllOut,
    accept,
    reject,
    remove
};