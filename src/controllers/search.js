const Article = require("../models/Article");
const Category = require("../models/Category");

/**
 * la fuzione effettua una ricerca degli articoli in base 
 * al numero e al tipo di parametri inseriti
 */
const search = async(req, res) => {
    const keyWord = req.query.key;
    const category = req.query.category;
    const location = req.query.location;
    let category_id;
    let result;

    if(keyWord){
        //ricerca con almeno parametro keyWord

        if(!category && !location){
            //ricerca solo per parola chiave
            result = await Article.find({title: {'$regex': keyWord, '$options': 'i'}});
        } 
        else if(category && !location){
            //ricerca per keyWord e category

            //ricerca id della categoria indicata
            result = await Category.findOne({title: {'$regex': category, '$options': 'i'}});
            category_id = result;
            if(!category_id) return res.status(404).json({code: "704", message: "category not found"});    

            if(!category_id) return res.status(404).json({code: "704", message: "category not found"});
            
            result = await Article.find({$and: [{title: {'$regex': keyWord, '$options': 'i'}}, 
            {"categories.id": {'$in': [category_id]}}]});
        } 
        else if(location && !category) {
            //ricerca per keyWord e location
            result = await Article.find({$and: [{title: {'$regex': keyWord, '$options': 'i'}}, 
                                    {location: {'$regex': location, '$options': 'i'}}]});                     
        } 
        else {
            //ricerca completa 
            result = await Category.findOne({title: {'$regex': category, '$options': 'i'}});
            category_id = result;
            if(!category_id) return res.status(404).json({code: "704", message: "category not found"});    

            if(!category_id) return res.status(404).json({code: "704", message: "category not found"});
            
            result = await Article.find({$and: [{title: {'$regex': keyWord, '$options': 'i'}}, {location: {'$regex': location, '$options': 'i'}},
                                    {"categories.id": {'$in': [category_id]}}]});
        }
    }
    else if(category){
        //ricerca con almeno parametro category
        result = await Category.findOne({title: {'$regex': category, '$options': 'i'}});
        category_id = result;
        if(!category_id) return res.status(404).json({code: "704", message: "category not found"});

        if(!keyWord && !location){
            //ricerca solo per categoria
            //ricerca id della categoria indicata
            result = await Article.find({"categories.id": {'$in': [category_id]}});
        } 
        else if(keyWord && !location){
            //ricerca per keyWord e category
            result = await Article.find({$and: [{title: {'$regex': keyWord, '$options': 'i'}}, 
            {"categories.id": {'$in': [category_id]}}]});
        } 
        else if(location && !keyWord) {
            //ricerca per category e location
            result = await Article.find({$and: [{location: {'$regex': location, '$options': 'i'}}, {"categories.id": {'$in': [category_id]}}]});
        } 
        else {
            //ricerca completa 
            result = await Article.find({$and: [{title: {'$regex': keyWord, '$options': 'i'}}, {location: {'$regex': location, '$options': 'i'}},
                                    {"categories.id": {'$in': [category_id]}}]});
        }    
    } 
    else {
        //mancanza parametri base per la ricerca
        return res.status(400).json({code: "702", message: "missing arguments"});
    }    

    if(!result)
        return res.status(404).json({code: "701", message: "database error"});

/**
 * la funzione restituisce tutti i prodotti che rispettano i criteri di ricerca
 * (prezzo min-max, spedizione disponibile, valutazione , order by)
 */
 //db.collection.find("condizioni varie").sort( { age: -1 } )
    //questo ordine per age in ordine decrescente

    return res.status(200).json({articles: result, code: "700", message: "success"});
}

module.exports = { 
    search
 };