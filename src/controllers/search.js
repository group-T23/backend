const Item = require("../models/Item");
const Category = require("../models/Category");
const User = require("../models/Seller");
const Review = require("../models/Review");

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
    
    if (keyWord) {
        //ricerca con almeno parametro keyWord

        if (!category && !location) {
            //ricerca solo per parola chiave
            result = await Item.find({ title: { '$regex': keyWord, '$options': 'i' } });
        } else if (category && !location) {
            //ricerca per keyWord e category

            //ricerca id della categoria indicata
            result = await Category.findOne({ title: { '$regex': category, '$options': 'i' } });
            category_id = result;
            if (!category_id) return res.status(404).json({ code: "704", message: "category not found" });

            if (!category_id) return res.status(404).json({ code: "704", message: "category not found" });

            result = await Item.find({
                $and: [{ title: { '$regex': keyWord, '$options': 'i' } },
                { "categories": { '$in': [category_id] } }
                ]
            });
            
        } else if (location && !category) {
            //ricerca per keyWord e location
            result = await Item.find({
                $and: [{ title: { '$regex': keyWord, '$options': 'i' } },
                    { city: { '$regex': location, '$options': 'i' } }
                ]
            });
        } else {
            //ricerca completa 
            result = await Category.findOne({ title: { '$regex': category, '$options': 'i' } });
            category_id = result;
            if (!category_id) return res.status(404).json({ code: "704", message: "category not found" });

            if (!category_id) return res.status(404).json({ code: "704", message: "category not found" });

            result = await Item.find({
                $and: [{ title: { '$regex': keyWord, '$options': 'i' } }, { city: { '$regex': location, '$options': 'i' } },
                    { "categories": { '$in': [category_id] } }
                ]
            });
        }
    } else if (category) {
        //ricerca con almeno parametro category
        result = await Category.findOne({ title: { '$regex': category, '$options': 'i' } });
        category_id = result;
        if (!category_id) return res.status(404).json({ code: "704", message: "category not found" });

        if (!keyWord && !location) {
            //ricerca solo per categoria
            //ricerca id della categoria indicata
            result = await Item.find({ "categories": { '$in': [category_id] } });
        } else if (keyWord && !location) {
            //ricerca per keyWord e category
            result = await Item.find({
                $and: [{ title: { '$regex': keyWord, '$options': 'i' } },
                    { "categories": { '$in': [category_id] } }
                ]
            });
        } else if (location && !keyWord) {
            //ricerca per category e location
            result = await Item.find({ $and: [{ city: { '$regex': location, '$options': 'i' } }, { "categories": { '$in': [category_id] } }] });
        } else {
            //ricerca completa 
            result = await Item.find({
                $and: [{ title: { '$regex': keyWord, '$options': 'i' } }, { city: { '$regex': location, '$options': 'i' } },
                    { "categories": { '$in': [category_id] } }
                ]
            });
        }
    } else {
        //mancanza parametri base per la ricerca
        return res.status(400).json({ code: "702", message: "missing arguments" });
    }

    if (!result)
        return res.status(404).json({ code: "701", message: "database error" });

    /**
     * parametri diposnibili per i filrti:
     * min_price - double
     * max_price - double
     * shipment - boolean
     * rating - int
     * orderBy - String (solo per prezzo al momento)
     */
    let minPrice = req.query.min_price;
    let maxPrice = req.query.max_price;
    let isShipment = req.query.shipment;
    let rating = req.query.rating;
    let orderBy = req.query.orderBy;

    //applicazione filtri

    //filtri fascia prezzo e spedizione
    if(minPrice || maxPrice || isShipment){
        result = result.filter(function (elem) {
            let flagMin = true;
            let flagMax = true;
            let flag = true;
     
            if(minPrice || maxPrice){
                //filtro per prezzo
                if(minPrice)
                    flagMin = (parseFloat(elem.price) >= minPrice)
                
                if(maxPrice)
                    flagMax = (parseFloat(elem.price) <= maxPrice)

            }
 
            flag = flagMin && flagMax;

            if(isShipment != undefined){
                //filtro per spedizione disponibile
                //se il campo è false questo prende in cosiderazione tutti gli articoli
                //che hanno anche la spedizione disponibile in modo contrario, 
                //se il campo è true prende in considerazione solo quelli con spedizione disponibile
                (isShipment === "true") ? flag = flag && !Object.is(elem.shipmentAvail, null) : flag = flag && true;
            }

            return flag;
        });
    }

    //controllo recensione
    if(rating){
        //filtro per valutazione venditore
        //il venditore deve avere ALMENO una valutazione pari o maggiore a 
        //quella indicata nella query
        
        //ricerca user che ha pubblicato l'articolo
        for(let i=0; i<result.length; i++){
            let elem = result[i];
            const seller = await User.findOne({"items": {"$in": [elem._id]}});

            var valutazione = null;
            
            //calcolo media recensioni di ogni utente
            if(seller.reviews) {
                const rt = await Review.aggregate(
                    [
                        {
                            "$group":
                            {
                                _id: "$sellerId",
                                requests: {$sum: 1},
                                avgRating: { $avg: "$rating"}
                            }
                        }
                    ]
                );

                //ricerco all'interno dei gruppi quello del venditore ricercato usando seller.userId
                let found = false;
                for(let i=0; i<rt.length && !found; i++){
                    if((rt[i]._id).equals(seller.userId)){
                        found = true;
                        valutazione = rt[i].avgRating;
                    }
                }

                if(valutazione < rating) delete result[i];

            } else {
                delete result[i];
            }

        }
    }
    
    //ordinamento articoli se indicato nella query
    if(orderBy){
        if(orderBy === "asc_price"){
            //prezzo crescente
            result.sort(function(a, b){
                return a.price - b.price
            });
        }
        else if(orderBy === "desc_price"){
            //prezzo decrescente
            result.sort(function(a, b){
                return b.price - a.price
            });
        }
    }

    //filtro finale, prendere i soli articoli che sonno stati pubblicati ovvero,
    //gli articoli che presentano il campo state = PUBLISHED
    result = result.filter(function(elem){
        return ((elem.state == "PUBLISHED" ? true : false));
    });

    return res.status(200).json({articles: result, code: "700", message: "success"});
}

/**
 * la funzione ritorna tutte le categorie disponibili 
 */
const getCategories = async (req, res) => {
    const result = await Category.find({});

    if(!result)
    res.status(500).json({code: "701", message: "database error"});

    res.status(200).json({categories: result, code: "700", message: "success"});
};

module.exports = { 
    search,
    getCategories,
};