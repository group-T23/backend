const mongoose = require('mongoose');
const Item = require("../models/Item");
const Seller = require("../models/Seller");
const Buyer = require("../models/Buyer");
const Proposal = require("../models/Proposal");
const { getAuthenticatedUser } = require('../utils/auth');


const create = async(req, res) => {

    // required params
    if (!(req.body.itemId && req.body.price))
        return res.status(400).json({ code: '0802', massage: 'Missing Arguments' });

    let valid = true;
    // article ID must exist
    if (valid)
        valid = mongoose.Types.ObjectId.isValid(req.body.itemId) && (await Item.exists({ _id: req.body.itemId }));


    let author = await getAuthenticatedUser(req, res);

    // only one proposal can exists for one author and one item
    if (valid)
        valid = !(await Proposal.findOne({ itemId: req.body.itemId, authorId: author._id, state: 'PENDING' }));

    // the author of the proposal must be different from the item owner
    if (valid)
        valid = !author.isSeller || !(await Seller.findById(author.sellerId)).items.includes(req.body.itemId);

    if (!valid)
        return res.status(422).json({ code: '0803', message: 'Invalid Arguments' });

    let proposal = new Proposal({
        itemId: req.body.itemId,
        authorId: author.id,
        state: 'PENDING',
        price: req.body.price
    })

    await proposal.save()
        .catch(err => {
            return res.status(500).json({ code: '0801', message: 'Database Error' });
        });

    author.proposals.push(proposal.id);
    await author.save()
        .catch(err => {
            return res.status(500).json({ code: '0801', message: 'Database Error' });
        })

    const item = await Item.findById(req.body.itemId);
    let seller = await Seller.findById(item.ownerId);
    seller.proposals.push(proposal.id);
    seller.save()
        .then(ok => {
            return res.status(201).json({ code: '0800', message: 'Success' });
        })
        .catch(err => {
            return res.status(500).json({ code: '0801', message: 'Database Error' });
        });
}

const getInfo = async(req, res) => {
    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Proposal.exists({ id: req.query.id })))
        return res.status(500).json({ code: '0803', message: 'Invalid Arguments' });

    let proposal = await Proposal.findById(req.query.id);
    return res.status(200).json({ proposal: proposal, code: '0800', message: 'Success' });
}

const getAllIn = async(req, res) => {
    const buyer = await getAuthenticatedUser(req, res);

    if (!buyer.isSeller)
        return res.status(422).json({ code: '0803', message: 'Invalid Arguments' });

    const seller = await Seller.findById(buyer.sellerId);
    let proposals = await Proposal.find({
        $and: [
            { _id: { $in: seller.proposals } },
            { state: { $in: ['PENDING'] } }
        ]
    });

    return res.status(200).json({ proposals: proposals, code: '0800', message: 'Success' });
}

const getAllOut = async(req, res) => {
    const buyer = await getAuthenticatedUser(req, res);

    //ricerco le proposte del buyer nella collection Proposals
    let proposals = [];
    for (let i = 0; i < buyer.proposals.length; i++) {
        let result = await Proposal.findById(buyer.proposals[i]);
        if (result != null)
            proposals.push(result);
    }

    return res.status(200).json({ proposals: proposals, code: '0800', message: 'Success' });
}

const accept = async(req, res) => {

    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !(await Proposal.exists({ id: req.params.id })))
        return res.status(500).json({ code: '0803', message: 'Invalid Arguments' });
    let proposal = await Proposal.findById(req.params.id);

    // verify authorization
    let buyer = await getAuthenticatedUser(req, res);
    if (!buyer.isSeller || !(await Seller.findById(buyer.sellerId)).proposals.includes(proposal.id))
        return res.status(403).json({ code: '0805', message: 'Item Not Match Seller' })

    //proposal must be in 'PENDING' state
    if (proposal.state != 'PENDING')
        return res.status(422).json({ code: '0804', message: 'Invalid Proposal State' });

    proposal.state = 'ACCEPTED';
    proposal.save()
        .then(ok => {
            return res.status(200).json({ code: '0800', message: 'Success' });
        })
        .catch(err => {
            return res.status(500).json({ code: '0801', message: 'Database Error' });
        });
}

const reject = async(req, res) => {

    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !(await Proposal.exists({ id: req.params.id })))
        return res.status(500).json({ code: '0803', message: 'Invalid Arguments' });
    let proposal = await Proposal.findById(req.params.id);

    // verify authorization
    let buyer = await getAuthenticatedUser(req, res);
    if (!buyer.isSeller || !(await Seller.findById(buyer.sellerId)).proposals.includes(proposal._id))
        return res.status(403).json({ code: '0805', message: 'Item Not Match Seller' })

    //proposal must be in 'PENDING' state
    if (proposal.state != 'PENDING')
        return res.status(422).json({ code: '0804', message: 'Invalid Proposal State' });

    proposal.state = 'REJECTED';
    proposal.save()
        .then(ok => {
            return res.status(200).json({ code: '0800', message: 'Success' });
        })
        .catch(err => {
            return res.status(500).json({ code: '0801', message: 'Database Error' });
        });
}

const remove = async(req, res) => {
    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Proposal.exists({ id: req.query.id })))
        return res.status(500).json({ code: '0803', message: 'Invalid Arguments' });
    let proposal = await Proposal.findById(req.query.id);

    // verify authorization
    let buyer = await getAuthenticatedUser(req, res);
    if (proposal.authorId != buyer.id)
        return res.status(403).json({ code: '0806', message: 'Not Authorized' })

    //proposal must be in 'PENDING' state
    if (proposal.state != 'PENDING')
        return res.status(422).json({ code: '0804', message: 'Invalid Proposal State' });

    proposal.state = 'DELETED';
    proposal.save()
        .then(ok => {
            return res.status(200).json({ code: '0800', message: 'Success' });
        })
        .catch(err => {
            return res.status(500).json({ code: '0801', message: 'Database Error' });
        });
}

const paid = async(req, res) => {
    //id must exist
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Proposal.exists({ id: req.query.id })))
        return res.status(500).json({ code: '0803', message: 'Invalid Arguments' });
    let proposal = await Proposal.findById(req.query.id);

    // verify authorization
    let buyer = await getAuthenticatedUser(req, res);
    if (proposal.authorId != buyer.id)
        return res.status(403).json({ code: '0805', message: 'Item Not Match Seller' })

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

    if (!result) return res.status(500).json({ code: '0801', message: 'Database Error' });
    return res.status(200).json({ code: '0800', message: 'Success' });
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