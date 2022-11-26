const User = require("../models/User")
const Article = require("../models/Article");

/**
 * la funzione ritorna la lista degli articoli presenti nel carrello
 * dell'utente specificato nella richiesta
 */
const getItems = async(req, res) => {
    //get all items inserted in the cart
    const data = req.body; 
    const result = await User.findOne({email: data.email});
    if(!result) return res.status(404).json({message: "user not found"});

    //una volta trovati gli id, devo trovare i prodotti all'interno della collection articoli
    let cart = result.cart;
    let articoli = [];

    for(let i=0; i<cart.length; i++){
        let result = await Article.findOne({_id: cart[i].id});
        if(result){
            articoli.push(result);
        }
    }

    //inserire nella risposta gli articoli
    return res.status(200).json({cart: cart, articles: articoli});
}

/**
 * la funzione inserisce all'interno del carrello un nuovo articolo
 * e nel caso questo sia presente, ne modifica la quantità aumentandola
 * di una unità
 */
 const insertItem = async(req, res) => {
    const data = req.body;
    let email = data.email;
    let id_item = data.id;

    if(!email || !id_item){
        return res.status(404).json({message: "invalid parameters"});
        //campi non presenti o non validi, sessione probabilmente non valida
    }

    //se l'elemento è un duplicato, questo non viene inserito e non va a modificare la 
    //quantità di quello già presente
    const result = await User.find({"$and": [{email: data.email}, {cart: {"$elemMatch": {id: id_item}}}]});
    if(!result) return res.status(404).json({message: "error"});
    else {
        if(Object.keys(result).length === 0){
            //item non già presente nel carrello, inserimento id
            const result = await User.updateOne({email: data.email},{$push: {cart: {id: id_item}}});
            return res.status(200).json({message: "item added in cart"});
        } else 
            return res.status(200).json({message: "item not added in cart"});
    }

}

/**
 * la funzione modifica la quantità dell'articolo indicato
 * con un valore passato da input
 */
const updateQuantity = async(req, res) => {
    let email = req.body.email;
    let id = req.body.id;//id item
    let quantity = req.body.quantity;

    if(!email || !id || !quantity || quantity<=0){
        return res.status(404).json({message: "invalid parameters"});
        //campi non presenti o non validi, sessione probabilmente non valida
    }

    let result = await User.findOne({email: email});
    if(!result) return res.status(404).json({message: "user not found"});

    //modifica quantità articolo carrello
    const items = result.cart;
    let id_item;//questo è l'objectid dell'item
    let notFound = true;

    for(i=0; i<items.length && notFound; i++){
        if(items[i].id == id){
            //item trovato
            notFound = false;
            id_item = items[i]._id;
        }
    }

    if(notFound) return res.status(404).json({message: "item not found"});

    result = await User.updateOne({"$and": [{"email": email}, {'cart._id': id_item}]}, {
        $set: {'cart.$.quantity': quantity}    
    }); 

    if(!result) return res.status(404).json({message: "error when updating quantity"});
    return res.status(200).json({message: "quantity item updated"});  


}

/**
 * la funzione rimuove dalla lista del carrello l'articolo
 * identificato dal proprio id il quale viene passato tramite
 * la richiesta
 */
const deleteOneItem = async(req, res) => {
    //remove an item with a defined id
    let email = req.body.email;//email ricavata dal corpo della richiesta come in post
    let id = req.body.id;

    if(!email || !id){
        return res.status(404).json({message: "invalid parameters"});
        //campi non presenti, sessione probabilmente non valida
    }

    let result = await User.findOne({email: email});
    if(!result) return res.status(404).json({message: "user not found"});

    //modifica carrello del risultato ottenuto
    const items = result.cart;
    let id_item;
    let notFound = true;

    for(i=0; i<items.length && notFound; i++){
        if(items[i].id == id){
            //item trovato
            notFound = false;
            id_item = items[i]._id;
        }
    }

    if(notFound) return res.status(404).json({message: "item not found"});

    result = await User.updateOne({"email": email}, {
        $pull: {
            cart: {
                _id: {$in: id_item}
            }
        }
    }); 

    if(!result) return res.status(404).json({message: "error when deleting"});
    return res.status(200).json({message: "item removed"});   
};

/**
 * la funzione rimuove dalla lista del carrello tutti gli 
 * articoli presenti.
 * questa funzione verrà usata nel momento del checkout dal carrello
 */
const deleteAll = async(req, res) => {
    let email = req.body.email;

    if(!email){
        return res.status(404).json({message: "invalid parameters"});
        //campi non presenti, sessione probabilmente non valida
    }

    //nota: oltre che agli elementi, viene rimosso anche il parametro cart
    //ma questo non comporta errori dato che lo schema definisce che l'utente
    //abbia come attributo anche il carrello
    const result = await User.updateOne({email: email}, {$unset: {cart: []}});    
    if(!result) return res.status(404).json({message: "error when deleting"});
    return res.status(200).json({message: "cart cleared"});   

}

/**
 * la funzione si occupa di eseguire il checkout
 * e dello svuotamento del carrello
 */
const checkout = async(req, res) => {
    //NB facendo il checkout è da verificare prima 
    //se la quantità è disponibile e, in caso positivo, modificarla sottraendo
    //la quantità definita nel carrello

};

module.exports = {
    getItems,
    insertItem,
    updateQuantity,
    deleteOneItem,
    deleteAll,
    checkout,
}