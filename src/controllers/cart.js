const User = require("../models/User")

/**
 * la funzione ritorna la lista degli articoli presenti nel carrello
 * dell'utente specificato nella richiesta
 */
const getItems = async(req, res) => {
    //get all items inserted in the cart
    const data = req.body; 
    const result = await User.findOne({email: data.email});
    if(!result) return res.status(404).json({cart: null});
    return res.status(200).json({cart: result.cart});
}

/**
 * la funzione inserisce all'interno del carrello un nuovo articolo
 * e nel caso questo sia presente, ne modifica la quantità aumentandola
 * di una unità
 */
 const insertItem = async(req, res) => {

}

/**
 * la funzione modifica la quantità dell'articolo indicato
 * con un valore passato da input
 */
const updateQuantity = async(req, res) => {

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
        return res.status(404).json({message: "invalid session"});
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
            notFound = true;
            id_item = items[i]._id;
        }
    }

    result = await User.updateOne({"email": email}, {
        $pull: {
            cart: {
                _id: {$in: id_item}
            }
        }
    }); 

    if(!result) return res.status(404).json({message: "error"});
    return res.status(200).json({message: "item removed"});   
};

/**
 * la funzione rimuove dalla lista del carrello tutti gli 
 * articoli presenti.
 * questa funzione verrà usata nel momento del checkout dal carrello
 */
const deleteAll = async(req, res) => {

}

module.exports = {
    getItems,
    insertItem,
    updateQuantity,
    deleteOneItem,
    deleteAll,
}