const mongoose = require('mongoose');
const Article = require("../models/Article");
const Buyer = require("../models/Buyer");
const Seller = require("../models/Seller");
const Proposal = require("../models/Proposal");


const create = async(req, res) => {

    // required params
    if (!(req.body.itemId && req.body.price && req.body.authorId))
        return res.status(400).json({ code: "", massage: "missing arguments" });
    //FIXME: add error codes

    let valid = true;
    // article ID must exist
    if (valid)
        valid = mongoose.Types.ObjectId.isValid(req.body.itemId) && (await Article.exists({ _id: req.body.itemId }));

    //  author (user) ID must exist
    if (valid)
        valid = mongoose.Types.ObjectId.isValid(req.body.authorId) && (await Buyer.exists({ _id: req.body.authorId }));
    let author = await Buyer.exists({ _id: req.body.authorId });

    // only one proposal can exists for one author and one item
    if (valid)
        valid = !Proposal.exists({ item_id: req.body.itemId, author_id: req.body.authorId });

    // the author of the proposal must be different from the item owner
    if (valid)
        valid = !author.items.includes(req.body.itemId);


    if (!valid)
        return res.status(500).json({ code: "", message: "invalid arguments" });
    //FIXME: add error codes



    const p = new Proposal({
        author_id: req.body.authorId,
        item_id: req.body.itemId,
        state: 'PENDING',
        price: req.body.price
    });

    p.save((err, data) => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to create" });
        //FIXME: add error codes

        return res.status(200).json({ code: "", message: "success" });
        //FIXME: add error codes
    });

    //FIXME: add proposal ID in author.proposals (DB)
    /*author.proposals.push(p.id);
    author.save((err, data) => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to create" });
        //FIXME: add error codes

        return res.status(200).json({ code: "", message: "success" });
        //FIXME: add error codes
    });
    */
};

const getAllIn = async(req, res) => {

    // required params
    if (!req.body.sellerId)
        return res.status(400).json({ code: "", massage: "missing arguments" });
    //FIXME: add error codes


    //user must exist
    if (!mongoose.Types.ObjectId.isValid(req.body.sellerId) || !(await Seller.exists({ _id: req.body.sellerId })))
        return res.status(500).json({ code: "", message: "invalid arguments" });
    //FIXME: add error codes


    let proposals = (await Proposal.find()).filter(checkIncoming);

    async function checkIncoming(proposal) {
        let item = await Article.find({ _id: proposal.item_id });
        if (!item)
            return false;

        return item.owner == req.body.sellerId;
        //FIXME: owner doesn't exists in Article
    }

    return res.status(200).json({ proposals: proposals, code: "", message: "success" });
}

const getAllOut = async(req, res) => {

    // required params
    if (!req.body.buyerId)
        return res.status(400).json({ code: "", massage: "missing arguments" });
    //FIXME: add error codes


    //user must exist
    if (!mongoose.Types.ObjectId.isValid(req.body.buyerId) || !(await Buyer.exists({ _id: req.body.buyerId })))
        return res.status(500).json({ code: "", message: "invalid arguments" });
    //FIXME: add error codes

    let proposals = await Proposal.find({ author_id: req.body.buyerId });

    return res.status(200).json({ proposals: proposals, code: "", message: "success" });
}

const accept = async(req, res) => {

    // required params
    if (!req.id)
        return res.status(400).json({ code: "", massage: "missing arguments" });
    //FIXME: add error codes


    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.id) || !(await Proposal.exists({ _id: req.id })))
        return res.status(500).json({ code: "", message: "invalid arguments" });
    //FIXME: add error codes
    let proposal = await Proposal.findOne({ _id: req.id });

    //proposal must be in 'PENDING' state
    if (proposal.state != 'PENDING')
        return res.status(500).json({ code: "", message: "invalid arguments" });
    //FIXME: add error codes

    proposal.state = 'ACCEPTED';
    proposal.save((err, data) => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to accept" });
        //FIXME: add error codes
    });

    //TODO: notify owner and buyer via email
}

const reject = async(req, res) => {

    // required params
    if (!req.id)
        return res.status(400).json({ code: "", massage: "missing arguments" });
    //FIXME: add error codes


    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.id) || !(await Proposal.exists({ _id: req.id })))
        return res.status(500).json({ code: "", message: "invalid arguments" });
    //FIXME: add error codes
    let proposal = await Proposal.findOne({ _id: req.id });

    //proposal must be in 'PENDING' state
    if (proposal.state != 'PENDING')
        return res.status(500).json({ code: "", message: "invalid arguments" });
    //FIXME: add error codes

    proposal.state = 'REJECTED';
    proposal.save((err, data) => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to reject" });
        //FIXME: add error codes
    });

    //TODO: notify owner and buyer via email
}

const remove = async(req, res) => {

    // required params
    if (!req.id)
        return res.status(400).json({ code: "", massage: "missing arguments" });
    //FIXME: add error codes


    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.id) || !(await Proposal.exists({ _id: req.id })))
        return res.status(500).json({ code: "", message: "invalid arguments" });
    //FIXME: add error codes
    let proposal = await Proposal.findOne({ _id: req.id });

    //proposal must be in 'PENDING' state
    if (proposal.state != 'PENDING')
        return res.status(500).json({ code: "", message: "invalid arguments" });
    //FIXME: add error codes

    proposal.state = 'DELETED';
    proposal.save((err, data) => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to delete" });
        //FIXME: add error codes
    });

    //TODO: notify owner and buyer via email
}


module.exports = {
    create,
    getAllIn,
    getAllOut,
    accept,
    reject,
    remove
};





/*
// C - create
router.post('/create', proposalController.create())

// R - read
router.post('/', proposalController.getAll());

// U - update
router.put('/accept/?id=:id', proposalController.accept());
router.put('/reject/?id=:id', proposalController.reject());

// D - delete
router.delete('/delete/?id=:id', proposalController.delete());
*/