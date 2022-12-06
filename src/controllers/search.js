const mongoose = require('mongoose');
const Article = require("../models/Article");
const Category = require("../models/Category");

/**
 * funzione che restituisce tutti i prodotti che presentano nel titolo
 * la parola chiave indicata nella url
 */
const newSearch = async (req, res) => { 
    //NB per effettuare la richiesta senza inserire tutti i campi,
    //usare la forma: param=""&...
    const keyWord = req.params.key;
    const category = req.params.category;
    const location = req.params.location;
    const compareText = '""';//pattern per quando il campo non è stato definito

    if(!keyWord || keyWord === compareText)
        return res.status(400).json({code: "702", message: "missing arguments"});

    //in base al numero di parametri ottenuti effettuo la ricerca
    let result;
    let id_cat;//contiene l'object id della categoria indicata nell'url

    if(category !== compareText){
        //ricerca objectId della categoria
        let result = await Category.findOne({title: {'$regex': category}});
        
        if(!result)
            return res.status(404).json({code: "704", message: "category not found"});
        id_cat = result._id;
    }

    if(id_cat == undefined && location === compareText)//solo parametro keyword
        result = await Article.find({title: {'$regex': keyWord, '$options': 'i'}});   

    else if(id_cat != undefined && location !== compareText){//tutti i parametri sono presenti
        result = await Article.find({$and: [{title: {'$regex': keyWord, '$options': 'i'}}, {location: {'$regex': location, '$options': 'i'}},
                                    {"categories.id": {'$in': [id_cat]}}]});

    } else if(location !== compareText){//in aggiunta solo location
        result = await Article.find({$and: [{title: {'$regex': keyWord, '$options': 'i'}}, {location: {'$regex': location, '$options': 'i'}}]});

    } else if(id_cat != undefined){//in aggiunta solo categorie
        result = await Article.find({$and: [{title: {'$regex': keyWord, '$options': 'i'}}, {"categories.id": {'$in': [id_cat]}}]});
    }

    if(!result)
        return res.status(404).json({code: "703", message: "articles not found"});

    return res.status(200).json({articles: result, code: "700", message: "success"});
};

/**
 * la funzione restituisce tutti i prodotti relativi ad una categoria
 */
const newSearchCateogries = async (req, res) => {
    const category = req.params.category;

    if(!category){
        return res.status(400).json({code: "702", message: "missing arguments"});
    }

    let result;
    let id_cat;//contiene l'object id della categoria indicata nell'url

    //ricerca objectId della categoria
    result = await Category.findOne({title: {'$regex': category}});
    
    if(!result)
        return res.status(404).json({code: "704", message: "category not found"});
    id_cat = result._id;

    result = await Article.find({"categories.id": {'$in': [id_cat]}});

    if(!result)
    return res.status(404).json({code: "703", message: "articles not found"});

    return res.status(200).json({articles: result, code: "700", message: "success"});
};

/**
 * la funzione restituisce tutti i prodotti che rispettano i criteri di ricerca
 * (prezzo min-max, spedizione disponibile, valutazione , order by)
 */
const newSearchFilters = async (req, res) => {

};

module.exports = { 
    newSearch,
    newSearchCateogries,
    newSearchFilters,
 };