const mongoose = require('mongoose');
const Article = require("../models/Article");

/**
 * funzione che restituisce tutti i prodotti che presentano nel titolo
 * la parola chiave indicata nella url
 */
const newSearch = async (req, res) => { 
    const keyWord = req.params.key;
    if(!keyWord)
        return res.status(400).json({code: "702", message: "missing arguments"});

    const result = await Article.find({title: {'$regex': keyWord}});    

    if(!result)
        return res.status(404).json({code: "703", message: "articles not found"});

    return res.status(200).json({articles: result, code: "700", message: "success"});
};

/**
 * la funzione restituisce tutti i prodotti relativi ad una categoria
 */
const newSearchCateogries = async (req, res) => {

};

module.exports = { newSearch };