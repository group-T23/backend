const mongoose = require('mongoose');
const Article = require("../models/Article");

const getAllProduct = async (req, res) => {
  const result = await Article.find({});//per ottenere tutte le righe
 
  if(!result)
    return res.status(404).json({code: "603", message: "articles not found"});

  return res.status(200).json({articles: result, code: "600", message: "success"});
};

const deleteAllProduct = async (req, res) => {
  res.json({ message: 'Test Delete New Product' });
};

/**
 * la funzione legge da url il parametro id e ricerca nella collection articles 
 * l'articolo corrispondente se presente.
 */
const getProduct = async (req, res) => {
  const id = req.params.id;

  if(!id)
    return res.status(400).json({code: "603", message: "missing arguments"});

  let result;
  //controllo se l'id inserito è valido o meno
  if(mongoose.Types.ObjectId.isValid(id))  
    result = await Article.findById(id);

  if(!result)
    return res.status(404).json({code: "603", message: "product not found"});
  
  return res.status(200).json({ article: result, code: "600", message: 'success' });
};

const newProduct = async (req, res) => {
  res.json({ message: 'Test New Product' });
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;

  if(!id)
    return res.status(400).json({code: "603", message: "missing arguments"});

  let result;
  //controllo se l'id inserito è valido o meno
  if(mongoose.Types.ObjectId.isValid(id))  
    result = await Article.deleteOne({"_id": mongoose.Types.ObjectId(id)});

    if(!result)
    return res.status(404).json({code: "603", message: "product not found"});
  
  return res.status(200).json({ article: result, code: "600", message: 'success' });    
};

module.exports = {
  getAllProduct,
  deleteAllProduct,
  getProduct,
  newProduct,
  deleteProduct
};