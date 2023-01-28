const Buyer = require("../models/Buyer");
const Item = require("../models/Item");
const { getAuthenticatedBuyer } = require('../utils/auth');


/**
 * la funzione ritorna la lista degli articoli presenti nella wishlist
 */
const getItems = async(req, res) => {
    let user = await getAuthenticatedBuyer(req, res);

    //una volta trovati gli id, trovo gli articoli presenti nella lista
    let wishlist = user.wishlist;
    let articoli = [];

    for (let i = 0; i < wishlist.length; i++) {
        let result = await Item.findOne({ _id: wishlist[i].id });
        if (result) {
            articoli.push(result);
        }
    }

    //inserire nella risposta gli articoli
    return res.status(200).json({ code: "500", message: "success", wishlist: articoli, wishlist_ids: wishlist });
}

/**
 * la funzione inserisce nella wishlist un articolo
 */
const insertItem = async(req, res) => {
    const data = req.body;
    let id_item = data.id;
    let user = await getAuthenticatedBuyer(req, res);

    if (!id_item)
        return res.status(400).json({ code: "502", message: "missing arguments" });

    //se l'elemento è un duplicato, questo non viene inserito
    const result = await Buyer.find({ "$and": [{ _id: user._id }, { wishlist: { "$elemMatch": { id: id_item } } }] });
    if (!result) return res.status(404).json({ code: "501", message: "user or item not found" });
    else {
        if (Object.keys(result).length === 0) {
            //item non presente nel carrello, inserimento id
            console.log(user);
            const result = await Buyer.updateOne({ _id: user._id }, { $push: { wishlist: { id: id_item } } });
            return res.status(200).json({ code: "500", message: "product added in wishlist" });
        } else
            return res.status(200).json({ code: "500", message: "product not added in wishlist" });
    }
}

/**
 * la funzione rimuove dalla wishlist un articolo
 */
const deleteOneItem = async(req, res) => {
    //remove an item with a defined id
    let id = req.body.id;
    let user = await getAuthenticatedBuyer(req, res);

    if (!id)
        return res.status(400).json({ code: "502", message: "missing arguments" });

    //modifica wishlist
    const items = user.wishlist;
    let id_item;
    let notFound = true;

    for (i = 0; i < items.length && notFound; i++) {
        if (items[i].id == id) {
            //item trovato
            notFound = false;
            id_item = items[i]._id;
        }
    }

    if (notFound) return res.status(404).json({ code: "504", message: "product not found" });

    result = await Buyer.updateOne({ _id: user._id }, {
        $pull: {
            wishlist: {
                _id: { $in: id_item }
            }
        }
    });

    if (!result) return res.status(500).json({ code: "501", message: "database error" });
        return res.status(200).json({ code: "500", message: "product removed" });
}

module.exports = {
    getItems,
    insertItem,
    deleteOneItem,
}