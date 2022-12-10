const mongoose = require('mongoose');
const Article = require("../models/Article");
const User = require("../models/User");
const Proposal = require("../models/Proposal");


const create = async(req, res) => {

    // required params
    if (!(eq.body.article && req.body.price && req.body.author))
        return res.status(400).json({ code: "", massage: "missing arguments" });
    //FIXME: add error codes

    let valid = true;
    // article ID must exist
    if (valid)
        valid = mongoose.Types.ObjectId.isValid(req.body.article) && (await Article.exists({ _id: req.body.article }));

    //  author (user) ID must exist
    if (valid)
        valid = mongoose.Types.ObjectId.isValid(req.body.author) && (await User.exists({ _id: req.body.author }));
    let author = await User.exists({ _id: req.body.author });

    // only one proposal can exists for one author and one item
    if (valid)
        valid = !Proposal.exists({ article: req.body.article, author: req.body.author });

    // the author of the proposal must be different from the item owner
    if (valid)
        valid = !author.articles.includes(req.body.article);


    if (!valid)
        return res.status(500).json({ code: "", message: "invalid arguments" });
    //FIXME: add error codes



    const p = new Proposal({
        article: req.body.article,
        state: 'PENDING',
        price: req.body.price
    });

    p.save((err, data) => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to create" });
        //FIXME: add error codes
    });

    //FIXME: add proposal ID in author.proposals (DB)
    author.proposals.push(p.id);
    author.save((err, data) => {
        if (err)
            return res.status(500).json({ code: "", message: "unable to create" });
        //FIXME: add error codes

        return res.status(200).json({ code: "", message: "success" });
        //FIXME: add error codes
    });
};

const getAllIn = async(req, res) => {

    // required params
    if (!req.body.user)
        return res.status(400).json({ code: "", massage: "missing arguments" });
    //FIXME: add error codes


    //user must exist
    if (!mongoose.Types.ObjectId.isValid(req.body.user) || !(await User.exists({ _id: req.body.user })))
        return res.status(500).json({ code: "", message: "invalid arguments" });
    //FIXME: add error codes

    //let user = await User.exists({ _id: req.body.user });
    let proposals = (await Proposal.find()).filter(checkIncoming);

    async function checkIncoming(proposal) {
        let item = await Article.find({ _id: proposal.article });
        if (!item)
            return false;

        return item.owner == req.body.user;
        //FIXME: owner doesn't exists in Article
    }

    return res.status(200).json({ proposals: proposals, code: "", message: "success" });
}

const getAllOut = async(req, res) => {

    // required params
    if (!req.body.user)
        return res.status(400).json({ code: "", massage: "missing arguments" });
    //FIXME: add error codes


    //user must exist
    if (!mongoose.Types.ObjectId.isValid(req.body.user) || !(await User.exists({ _id: req.body.user })))
        return res.status(500).json({ code: "", message: "invalid arguments" });
    //FIXME: add error codes

    return res.status(200).json({ proposals: user.proposals, code: "", message: "success" });
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
    let proposal = await Proposal.exists({ _id: req.id });

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
    let proposal = await Proposal.exists({ _id: req.id });

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
    let proposal = await Proposal.exists({ _id: req.id });

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