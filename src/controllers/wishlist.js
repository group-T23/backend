const User = require("../models/User");
const Article = require("../models/Article");

/**
 * la funzione ritorna la lista degli articoli presenti nella wishlist
 */
const getItems = async(req, res) => {
    const email = req.body.email; 

    if(email == null)
        return res.status(404).json({code: "502", message: "missing arguments"});

    const result = await User.findOne({email: email});
    if(!result) return res.status(404).json({code: "503", message: "user not found"});

    //una volta trovati gli id, trovo gli articoli presenti nella lista
    let wishlist = result.wishlist;
    let articoli = [];

    for(let i=0; i<wishlist.length; i++){
        let result = await Article.findOne({_id: wishlist[i].id});
        if(result){
            articoli.push(result);
        }
    }

    //inserire nella risposta gli articoli
    return res.status(200).json({code: "500", message: "success", wishlist: articoli, wishlist_ids: wishlist});

}

/**
 * la funzione inserisce nella wishlist un articolo
 */
 const insertItem = async(req, res) => {
    const data = req.body;
    let email = data.email;
    let id_item = data.id;

    if(!email || !id_item)
        return res.status(404).json({code: "502", message: "missing arguments"});
        //campi non presenti, sessione probabilmente non valida

    //se l'elemento è un duplicato, questo non viene inserito
    const result = await User.find({"$and": [{email: email}, {wishlist: {"$elemMatch": {id: id_item}}}]});
    if(!result) return res.status(404).json({code: "501", message: "user or item not found"});
    else {
        if(Object.keys(result).length === 0){
            //item non presente nel carrello, inserimento id
            const result = await User.updateOne({email: email},{$push: {wishlist: {id: id_item}}});

            return res.status(200).json({code: "500", message: "product added in wishlist"});
        } else 
            return res.status(200).json({code: "500", message: "product not added in wishlist"});
    }

}

/**
 * la funzione rimuove dalla wishlist un articolo
 */
 const deleteOneItem = async(req, res) => {
    //remove an item with a defined id
    let email = req.body.email;//email ricavata dal corpo della richiesta come in post
    let id = req.body.id;

    if(!email || !id)
        return res.status(404).json({code: "502", message: "missing arguments"});
        //campi non presenti, sessione probabilmente non valida

    let result = await User.findOne({email: email});
    if(!result) return res.status(404).json({code: "503", message: "user not found"});

    //modifica wishlist
    const items = result.wishlist;
    let id_item;
    let notFound = true;

    for(i=0; i<items.length && notFound; i++){
        if(items[i].id == id){
            //item trovato
            notFound = false;
            id_item = items[i]._id;
        }
    }

    if(notFound) return res.status(404).json({code: "504", message: "product not found"});

    result = await User.updateOne({"email": email}, {
        $pull: {
            wishlist: {
                _id: {$in: id_item}
            }
        }
    }); 

    if(!result) return res.status(404).json({code: "501", message: "database error"});
    return res.status(200).json({code: "500", message: "product removed"});   
}

module.exports = {
    getItems,
    insertItem,
    deleteOneItem,
}