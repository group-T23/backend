const { getAuthenticatedUser } = require('../utils/auth');
const Buyer = require('../models/Buyer');
const Seller = require('../models/Seller');
const Item = require('../models/Item');
const Category = require('../models/Category');
const Proposal = require('../models/Proposal')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Mail = require('../utils/email');

const create = async(req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(400).json({ code: '0602', message: 'Missing Arguments' });

    const email = jwt.verify(token, process.env.ACCESS_TOKEN, (err, data) => data);
    const buyer = await Buyer.findOne({ email });

    let seller = await Seller.findById(buyer.sellerId);

    const itemCategories = await Category.find({ title: { $in: req.body.categories } });
    const categories = itemCategories.map(category => category.id)
    let item = new Item({
        title: req.body.title,
        description: req.body.description,
        ownerId: seller.id,
        quantity: req.body.quantity,
        categories: categories,
        photos: [`${buyer.sellerId}_${seller.items.length}.${req.body.ext}`],
        conditions: req.body.conditions,
        price: req.body.price,
        city: req.body.city,
        state: 'DRAFT',
        pickUpAvail: req.body.pickUpAvail,
        shipmentAvail: req.body.shipmentAvail,
        shipmentCost: req.body.shipmentCost,
    });

    let error = false;
    await item.save().catch(err => {
        console.log(err);
        error = true
    })

    if (error) return res.status(500).json({ code: '0601', message: 'Database Error' });

    if (!seller.items) seller.items = [];
    seller.items.push(item.id);

    await seller.save().catch(err => {
        console.log(err);
        error = true;
    });

    if (error) return res.status(500).json({ code: '0601', message: 'Database Error' });

    await Mail.send(buyer.email, 'Creazione nuovo annuncio', `Grazie per aver scelto skupply.\nA breve il tuo nuovo annuncio verrà creato!`);
    return res.status(201).json({ code: '0600', message: 'Success', item: item.id });
}

const getInfo = async(req, res) => {
    //required params
    if (!req.query.id)
        return res.status(400).json({ code: '0602', message: 'Missing Arguments' });

    // invalid params
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Item.exists({ id: req.query.id })))
        return res.status(400).json({ code: '0603', message: 'Invalid Arguments' });

    const item = await Item.findById(req.query.id);
    return res.status(200).json({ item: item, code: '0600', message: 'Success' });
}

const getByUser = async(req, res) => {
    //required params
    if (!req.query.username)
        return res.status(400).json({ code: '0602', message: 'Missing Arguments' });

    // invalid params
    if (!(await Buyer.exists({ username: req.query.username })))
        return res.status(400).json({ code: '0603', message: 'Invalid Arguments' });

    let buyer = await Buyer.findOne({ username: req.query.username });

    if (!buyer.isSeller)
        return res.status(400).json({ code: '0604', message: 'Invalid User Type' });

    const items = await Item.find({ ownerId: buyer.sellerId })

    return res.status(200).json({ items: items, code: '0600', message: 'Success' });
}


const edit = async(req, res) => {

    // required params
    if (!req.body.itemId)
        return res.status(400).json({ code: '0602', message: 'Missing Arguments' });

    if (!mongoose.Types.ObjectId.isValid(req.body.itemId) || !(await Item.exists({ id: req.body.itemId })))
        return res.status(400).json({ code: '0603', message: 'Invalid Arguments' });

    let buyer = await getAuthenticatedUser(req, res);
    if (!buyer.isSeller)
        return res.status(400).json({ code: '0604', message: 'Invalid User Type' });

    let seller = await Seller.findById(buyer.sellerId);
    if (!seller.items.includes(req.body.itemId))
        return res.status(400).json({ code: '0605', message: 'Operation Not Permitted' });

    let item = await Item.findById(req.body.itemId);

    const itemCategories = await Category.find({ title: { $in: req.body.categories } });
    const categories = itemCategories.map(category => category.id)

    item.title = req.body.title ? req.body.title : item.title;
    item.description = req.body.description ? req.body.description : item.description;
    item.quantity = req.body.quantity ? Number(req.body.quantity) : item.quantity;
    item.categories = req.body.categories ? categories : item.categories;
    item.conditions = req.body.conditions ? req.body.conditions : item.conditions;
    item.price = req.body.price ? parseFloat(req.body.price) : item.price;
    item.city = req.body.city ? req.body.city : item.city;
    item.pickUpAvail = req.body.pickUpAvail ? req.body.pickUpAvail : item.pickUpAvail;
    item.shipmentAvail = req.body.shipmentAvail ? req.body.shipmentAvail : item.shipmentAvail;
    item.shipmentCost = req.body.shipmentCost ? parseFloat(req.body.shipmentCost) : item.shipmentCost;
    item.photos[0] = req.body.ext ? String(buyer.sellerId).concat('_').concat(seller.items.length).concat('.').concat(req.body.ext) : item.photos[0];

    item.save()
        .then(ok => {
            return res.status(200).json({ code: '0600', message: 'Success' });
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({ code: '0601', message: 'Database Error' })
        })
}

const publish = async(req, res) => {
    // required params
    const token = req.headers['x-access-token'];
    if (!req.query.id || !token)
        return res.status(400).json({ code: '0602', message: 'Missing Arguments' });

    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Item.exists({ id: req.query.id })))
        return res.status(400).json({ code: '0603', message: 'Invalid Arguments' });


    const email = jwt.verify(token, process.env.ACCESS_TOKEN, (err, data) => data);
    const buyer = await Buyer.findOne({ email: email });
    if (!buyer.isSeller)
        return res.status(400).json({ code: '0604', message: 'Invalid User Type' });

    let seller = await Seller.findById(buyer.sellerId);
    if (!seller.items.includes(req.query.id))
        return res.status(400).json({ code: '0605', message: 'Operation Not Permitted' });

    let item = await Item.findById(req.query.id);

    if (item.state != 'DRAFT')
        return res.status(400).json({ code: '0607', message: 'Invalid Item State' });

    item.state = 'PUBLISHED';
    await item.save().catch(err => {
        return res.status(500).json({ code: '0601', message: 'Database Error' });
    });

    return res.status(200).json({ code: '0600', message: 'Success' });
}

const retire = async(req, res) => {
    // required params
    if (!req.query.id)
        return res.status(400).json({ code: '0602', message: 'Missing Arguments' });

    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Item.exists({ id: req.query.id })))
        return res.status(400).json({ code: '0603', message: 'Invalid Arguments' });

    let buyer = await getAuthenticatedUser(req, res);
    if (!buyer.isSeller)
        return res.status(400).json({ code: '0604', message: 'Invalid User Type' });

    let seller = await Seller.findById(buyer.sellerId);
    if (!seller.items.includes(req.query.id))
        return res.status(400).json({ code: '0605', message: 'Operation Not Permitted' });

    let item = await Item.findById(req.query.id);

    if (item.state != 'PUBLISHED')
        return res.status(400).json({ code: '0607', message: 'Invalid Item State' });

    // delete all proposals
    var proposals = await Proposal.find({ $and: [{ itemId: item._id }, { state: "PENDING" }] });
    proposals.forEach(async proposal => {
        proposal.state = "DELETED"
        await proposal.save().catch(err => res.status(500).json({ code: '0601', message: 'Database Error' }))
    })

    // remove from carts and wishlists
    var buyers = await Buyer.find()
    buyers.forEach(async buyer => {
        if (buyer.wishlist.find(x => x.id.equals(item._id))) {
            buyer.wishlist = buyer.wishlist.filter(x => !x.id.equals(item._id))
        }
        if (buyer.cart.find(x => x.id.equals(item._id))) {
            buyer.cart = buyer.cart.filter(x => !x.id.equals(item._id))
        }

        await buyer.save().catch(err => res.status(500).json({ code: '0601', message: 'Database Error' }))
    })

    item.state = 'DRAFT';
    await item.save().catch(err => {
        return res.status(500).json({ code: '0601', message: 'Database Error' });
    });

    return res.status(200).json({ code: '0600', message: 'Success' });
}

const buy = async(req, res) => {
    // required params
    if (!req.query.id || !req.query.quantity)
        return res.status(400).json({ code: '0602', message: 'Missing Arguments' });

    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Item.exists({ _id: req.query.id })))
        return res.status(400).json({ code: '0603', message: 'Invalid Arguments' });

    if (!Number.isInteger(req.query.quantity) || !req.query.quantity > 0)
        return res.status(400).json({ code: '0603', message: 'Invalid Arguments' });

    let item = await Item.findById(req.query.id);

    if (item.state != 'PUBLISHED')
        return res.status(400).json({ code: '0607', message: 'Invalid Item State' });

    if (item.quantity < req.query.quantity)
        return res.status().json({ code: '0606', message: 'Max Quantity Exceeded' })

    item.quantity -= req.query.quantity;
    if (item.quantity <= 0) {
        item.state = 'SOLD';
        item.quantity = 0;

        // delete all proposals
        var proposals = await Proposal.find({ $and: [{ itemId: item._id }, { state: "PENDING" }] });
        proposals.forEach(async proposal => {
            proposal.state = "DELETED"
            await proposal.save().catch(err => res.status(500).json({ code: '0601', message: 'Database Error' }))
        })

        // remove from carts and wishlists
        var buyers = await Buyer.find()
        buyers.forEach(async buyer => {
            if (buyer.wishlist.find(x => x.id.equals(item._id))) {
                buyer.wishlist = buyer.wishlist.filter(x => !x.id.equals(item._id))
            }
            if (buyer.cart.find(x => x.id.equals(item._id))) {
                buyer.cart = buyer.cart.filter(x => !x.id.equals(item._id))
            }

            await buyer.save().catch(err => res.status(500).json({ code: '0601', message: 'Database Error' }))
        })
    }

    await item.save().catch(err => {
        return res.status(500).json({ code: '0601', message: 'Database Error' });
    });

    return res.status(200).json({ code: '0600', message: 'Success' });
}

const remove = async(req, res) => {
    // required params
    if (!req.query.id)
        return res.status(400).json({ code: '0602', message: 'Missing Arguments' });

    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !(await Item.exists({ id: req.query.id })))
        return res.status(400).json({ code: '0603', message: 'Invalid Arguments' });

    let buyer = await getAuthenticatedUser(req, res);
    if (!buyer.isSeller)
        return res.status(400).json({ code: '0604', message: 'Invalid User Type' });

    let seller = await Seller.findById(buyer.sellerId);
    if (!seller.items.includes(req.query.id))
        return res.status(400).json({ code: '0605', message: 'Operation Not Permitted' });

    let item = await Item.findById(req.query.id);

    // delete all proposals
    var proposals = await Proposal.find({ $and: [{ itemId: item._id }, { state: "PENDING" }] });
    proposals.forEach(async proposal => {
        proposal.state = "DELETED"
        await proposal.save().catch(err => res.status(500).json({ code: '0601', message: 'Database Error' }))
    })

    // remove from carts and wishlists
    var buyers = await Buyer.find()
    buyers.forEach(async buyer => {
        if (buyer.wishlist.find(x => x.id.equals(item._id))) {
            buyer.wishlist = buyer.wishlist.filter(x => !x.id.equals(item._id))
        }
        if (buyer.cart.find(x => x.id.equals(item._id))) {
            buyer.cart = buyer.cart.filter(x => !x.id.equals(item._id))
        }

        await buyer.save().catch(err => res.status(500).json({ code: '0601', message: 'Database Error' }))
    })

    item.state = 'DELETED';
    await item.save().catch(err => {
        return res.status(500).json({ code: '0601', message: 'Database Error' });
    });

    return res.status(200).json({ code: '0600', message: 'Success' });
}

module.exports = {
    create,
    getInfo,
    getByUser,
    edit,
    publish,
    retire,
    buy,
    remove
};