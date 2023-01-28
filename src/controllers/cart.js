const Buyer = require("../models/Buyer")
const Item = require("../models/Item");
const mongoose = require('mongoose');
const { getAuthenticatedBuyer } = require('../utils/auth');

/**
 * la funzione ritorna la lista degli articoli presenti nel carrello
 * dell'utente specificato nella richiesta
 */
const getItems = async(req, res) => {
    //get all items inserted in the cart
    let user = await getAuthenticatedBuyer(req, res);

    const result = await Buyer.findById(user._id);
    if (!result) return res.status(404).json({ code: "403", message: "user not found" });

    //una volta trovati gli id, devo trovare i prodotti all'interno della collection articoli
    let cart = result.cart;
    let articoli = [];

    for (let i = 0; i < cart.length; i++) {
        const result = await Item.findOne({ _id: cart[i].id });
        if (result) articoli.push(result);
    }

    //inserire nella risposta gli articoli
    return res.status(200).json({ code: "400", message: "success", cart: articoli, cart_ids: cart });
}

/**
 * la funzione inserisce all'interno del carrello un nuovo articolo
 * e nel caso questo sia presente, ne modifica la quantità aumentandola
 * di una unità.
 * Inoltre, imposta l'articolo corrispondente della wishlist come inserito nel carrello
 */
const insertItem = async(req, res) => {
    const data = req.body;
    let id_item = data.id;
    let user = await getAuthenticatedBuyer(req, res);

    if (!id_item)
        return res.status(400).json({ code: "402", message: "missing arguments" });
    
    if(!(mongoose.Types.ObjectId.isValid(id_item)) || !(await Item.findById(id_item)))
        return res.status(404).json({code: "401", message: "item not found"});

    //se l'elemento è un duplicato, questo non viene inserito e non va a modificare la 
    //quantità di quello già presente
    const result = await Buyer.find({ "$and": [{ _id: user._id }, { cart: { "$elemMatch": { id: id_item } } }] });
    if (!result) return res.status(404).json({ code: "401", message: "user or item not found" });
    else {
        if (Object.keys(result).length === 0) {
            //item non già presente nel carrello, inserimento id
            const result = await Buyer.updateOne({ _id: user._id }, { $push: { cart: { id: id_item } } });
            return res.status(200).json({ code: "400", message: "product added in cart" });
        } else
            return res.status(200).json({ code: "400", message: "product not added in cart" });
    }

}

/**
 * la funzione modifica la quantità dell'articolo indicato
 * con un valore passato da input
 */
const updateQuantity = async(req, res) => {
    let id = req.body.id; //id item
    let quantity = req.body.quantity;
    let user = await getAuthenticatedBuyer(req, res);

    if (!id || quantity < 0) {
        return res.status(400).json({ code: "402", message: "missing arguments" });
        //campi non presenti o non validi, sessione probabilmente non valida
    }

    if(!(mongoose.Types.ObjectId.isValid(id)) || !(await Item.findById(id)))
        return res.status(404).json({code: "401", message: "item not found"});

    let result = await Buyer.findById(user._id);
    if (!result) return res.status(404).json({ code: "403", message: "user not found" });

    //modifica quantità articolo carrello
    const items = result.cart;
    let id_item; //questo è l'objectid dell'item
    let notFound = true;

    for (i = 0; i < items.length && notFound; i++) {
        if (items[i].id == id) {
            //item trovato
            notFound = false;
            id_item = items[i]._id;
        }
    }

    if (notFound) return res.status(404).json({ code: "404", message: "product not found" });

    result = await Buyer.updateOne({ "$and": [{ id: user._id}, { 'cart._id': id_item }] }, {
        $set: { 'cart.$.quantity': quantity }
    });

    if (!result) return res.status(500).json({ code: "401", message: "database error" });
        return res.status(200).json({ code: "400", message: "product's quantity updated" });

}

/**
 * la funzione rimuove dalla lista del carrello l'articolo
 * identificato dal proprio id il quale viene passato tramite
 * la richiesta
 */
const deleteOneItem = async(req, res) => {
    //remove an item with a defined id
    let id = req.body.id;
    let user = await getAuthenticatedBuyer(req, res);

    if (!id)
        return res.status(400).json({ code: "402", message: "missing arguments" });
    //campi non presenti, sessione probabilmente non valida

    //modifica carrello del risultato ottenuto
    const items = user.cart;
    let id_item;
    let notFound = true;

    for (i = 0; i < items.length && notFound; i++) {
        if (items[i].id == id) {
            //item trovato
            notFound = false;
            id_item = items[i]._id;
        }
    }

    if (notFound) return res.status(404).json({ code: "404", message: "product not found" });

    result = await Buyer.updateOne({ _id: user._id }, {
        $pull: {
            cart: {
                _id: { $in: id_item }
            }
        }
    });

    if (!result) return res.status(404).json({ code: "401", message: "database error" });
        return res.status(200).json({ code: "400", message: "product removed" });
};

/**
 * la funzione rimuove dalla lista del carrello tutti gli 
 * articoli presenti.
 * questa funzione verrà usata nel momento del checkout dal carrello
 */
const deleteAll = async(req, res) => {
    let user = await getAuthenticatedBuyer(req, res);

    //ricerca utente
    let result = await Buyer.findById(user._id);
    if (!result) return res.status(404).json({ code: "403", message: "user not found" });
    
    const cart = result.cart;
    let ids = [];

    //lettura id articoli
    for(let i=0; i<cart.length; i++){
        ids.push(cart[i]._id);
    }

    //pull valori array per rimozione articoli dal carrello
    result = await Buyer.updateOne({ _id: user._id },  { $pull: {
        cart: {
            _id: { $in: ids }
        }
    }});

    if (!result) return res.status(404).json({ code: "401", message: "database error" });
        return res.status(200).json({ code: "400", message: "cart cleared" });

}

/**
 * la funzione si occupa di eseguire il checkout
 * e dello svuotamento del carrello
 */
const checkout = async(req, res) => {
    //se la quantità è disponibile e, in caso positivo, modificarla sottraendo
    //la quantità definita nel carrello
    let result = await checkQuantity(req.body.items, req.body.modify);
    if(result) {
        return res.status(200).json({code: 400, message: "success"});
    }
    else
        return res.status(400).json({code: 406, message: "checkout failed"});
};

/**
 * la funzione verifica la quantità dei singoli prodotti
 * ovvero, se sono disponibili.
 * se indicato diversamente, la funzione aggiorna nel db la quantità dei prodotti acquistati
 */
const checkQuantity = async(items, modify) => {
    let success = true;
    let newItems = [];
    for(let i=0; i<items.length && success; i++){
        //viene preso in considerazione l'articolo se ha una quantità maggiore di 0
        if(items[i].quantity > 0) {
            if (!mongoose.Types.ObjectId.isValid(items[i].id) || !(await Item.exists({ id: items[i].id }))) {
                success = false;
            }
            
            let item = await Item.findById(items[i].id);

            if (item.state != 'PUBLISHED'){
                success = false;
            }
         
            if (item.quantity < items[i].quantity) {
                success = false;
            }
     
            //se il flag è true, vengono modificate le quantità
            if(modify){
                item.quantity -= items[i].quantity;
                if (item.quantity <= 0) {
                    item.state = 'SOLD';
                    item.quantity = 0;
                }   

                //salvataggio del "nuovo" articolo in array
                newItems.push(item);
            }

        }
    }
    
    //se il checkout è possibile, vado a salvare gli articoli 
    //modificati così da aggiornare le loro quantità
    if(success && modify) {
        for(let i=0; i<newItems.length; i++){
            newItems[i].save(err => {
                if (err) {
                    return false;
                }
            });
        }
    }

    return success;
}

module.exports = {
    getItems,
    insertItem,
    updateQuantity,
    deleteOneItem,
    deleteAll,
    checkout,
}