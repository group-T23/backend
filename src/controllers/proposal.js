const mongoose = require('mongoose');
const Item = require("../models/Item");
const Seller = require("../models/Seller");
const Buyer = require("../models/Buyer");
const Proposal = require("../models/Proposal");
const { getAuthenticatedBuyer } = require('../utils/auth');


const create = async(req, res) => {

    // required params
    if (!(req.body.itemId && req.body.price))
        return res.status(400).json({ code: "1102", massage: "missing arguments" });

    let valid = true;
    // article ID must exist
    if (valid)
        valid = mongoose.Types.ObjectId.isValid(req.body.itemId) && (await Item.exists({ id: req.body.itemId }));


    let author = await getAuthenticatedBuyer(req, res);

    // only one proposal can exists for one author and one item
    if (valid)
        valid = !(await Proposal.findOne({ itemId: req.body.itemId, authorId: author._id, state: 'PENDING' }));

    // the author of the proposal must be different from the item owner
    if (valid)
        valid = !author.isSeller || !(await Seller.findById(author.sellerId)).items.includes(req.body.itemId);

    if (!valid)
        return res.status(422).json({ code: "1103", message: "invalid arguments" });

    let proposal = new Proposal({
        itemId: req.body.itemId,
        authorId: author.id,
        state: 'PENDING',
        price: req.body.price
    })

    proposal.save()
        .catch(err => {
            return res.status(500).json({ code: "1101", message: "unable to create" });
        });

    author.proposals.push(proposal.id);
    author.save()
        .catch(err => {
            return res.status(500).json({ code: "1101", message: "unable to save changes" });
        })

    const item = await Item.findOne({ id: req.body.itemId });
    let seller = await Seller.findOne({ id: item.ownerId });
    seller.proposals.push(proposal.id);
    seller.save()
        .then(ok => {
            return res.status(201).json({ code: "1100", message: "success" });
        })
        .catch(err => {
            return res.status(500).json({ code: "1101", message: "unable to save changes" });
        });
}

const getInfo = async(req, res) => {
    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Proposal.exists({ id: req.query.id })))
        return res.status(500).json({ code: "1103", message: "invalid arguments" });

    let proposal = await Proposal.findById(req.query.id);
    return res.status(200).json({ proposal: proposal, code: "1100", message: "success" });
}

const getAllIn = async(req, res) => {
    const buyer = await getAuthenticatedBuyer(req, res);

    if (!buyer.isSeller)
        return res.status(422).json({ code: "1103", message: "invalid user type" });

    const seller = await Seller.findById(buyer.sellerId);
    let proposals = await Proposal.find({ id: { $in: seller.proposals } });

    return res.status(200).json({ proposals: proposals, code: "1100", message: "success" });
}

const getAllOut = async(req, res) => {
    const buyer = await getAuthenticatedBuyer(req, res);

    //ricerco le proposte del buyer nella collection Proposals
    let proposals = [];
    for(let i=0; i<buyer.proposals.length; i++){
        let result = await Proposal.findById(buyer.proposals[i]);
        if(result != null)
            proposals.push(result);
    }
    
    return res.status(200).json({ proposals: proposals, code: "1100", message: "success" });
}

const accept = async(req, res) => {

    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !(await Proposal.exists({ id: req.params.id })))
        return res.status(500).json({ code: "1103", message: "invalid arguments" });
    let proposal = await Proposal.findById(req.params.id);

    // verify authorization
    let buyer = await getAuthenticatedBuyer(req, res);
    if (!buyer.isSeller || !(await Seller.findById(buyer.sellerId)).proposals.includes(proposal.id))
        return res.status(403).json({ code: "1105", message: "proposal on not owned item" })

    //proposal must be in 'PENDING' state
    if (proposal.state != 'PENDING')
        return res.status(422).json({ code: "1104", message: "invalid proposal state" });

    proposal.state = 'ACCEPTED';
    proposal.save()
        .then(ok => {
            //TODO: notify buyer via email
            return res.status(200).json({ code: "1100", message: "success" });
        })
        .catch(err => {
            return res.status(500).json({ code: "1101", message: "unable to accept" });
        });
}

const reject = async(req, res) => {

    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !(await Proposal.exists({ id: req.params.id })))
        return res.status(500).json({ code: "", message: "invalid arguments" });
    let proposal = await Proposal.findById(req.params.id);

    // verify authorization
    let buyer = await getAuthenticatedBuyer(req, res);
    if (!buyer.isSeller || !(await Seller.findById(buyer.sellerId)).proposals.includes(proposal.id))
        return res.status(403).json({ code: "", message: "proposal on not owned item" })

    //proposal must be in 'PENDING' state
    if (proposal.state != 'PENDING')
        return res.status(422).json({ code: "", message: "invalid proposal state" });

    proposal.state = 'REJECTED';
    proposal.save()
        .then(ok => {
            //TODO: notify buyer via email
            return res.status(200).json({ code: "", message: "success" });
        })
        .catch(err => {
            return res.status(500).json({ code: "", message: "unable to reject" });
        });
}

const remove = async(req, res) => {
    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Proposal.exists({ id: req.query.id })))
        return res.status(500).json({ code: "1102", message: "invalid arguments" });
    let proposal = await Proposal.findById(req.query.id);

    // verify authorization
    let buyer = await getAuthenticatedBuyer(req, res);
    if (proposal.authorId != buyer.id)
        return res.status(403).json({ code: "1106", message: "not authorized" })

    //proposal must be in 'PENDING' state
    if (proposal.state != 'PENDING')
        return res.status(422).json({ code: "1104", message: "invalid proposal state" });

    proposal.state = 'DELETED';
    proposal.save()
        .then(ok => {
            //TODO: notify buyer via email
            return res.status(200).json({ code: "1100", message: "success" });
        })
        .catch(err => {
            return res.status(500).json({ code: "1101", message: "unable to remove" });
        });
}

const paid = async(req, res) => {
    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Proposal.exists({ id: req.query.id })))
    return res.status(500).json({ code: "", message: "invalid arguments" });
    let proposal = await Proposal.findById(req.query.id);

    // verify authorization
    let buyer = await getAuthenticatedBuyer(req, res);
    if (proposal.authorId != buyer.id)
        return res.status(403).json({ code: "", message: "proposal on not owned item" })

    //cancellazione proposta da buyer, seller e collection proposals
    result = await Buyer.updateOne({ _id: buyer.id }, {
        $pull: {
            proposals: { $in: req.query.id }
        }
    });

    result = await Seller.updateOne({ proposals: req.query.id }, {
        $pull: {
            proposals: { $in: req.query.id }
        }
    });

    result = await Proposal.findByIdAndDelete(req.query.id);

    if (!result) return res.status(500).json({ code: "", message: "database error" });
        return res.status(200).json({ code: "", message: "proposal paid" });    

}

module.exports = {
    create,
    getInfo,
    getAllIn,
    getAllOut,
    accept,
    reject,
    remove,
    paid
};