const mongoose = require('mongoose');
const Article = require("../models/Article");
const User = require("../models/User");

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
 * l'articolo corrispondente se presente e il rispettivo venditore.
 * da notare che basti che non venga trovato l'articolo o il venditore
 * per ottenre un codice di errore 404 
 */
const getProduct = async (req, res) => {
  const id = req.params.id;

  if(!id)
    return res.status(400).json({code: "603", message: "missing arguments"});

  let result;
  //controllo se l'id inserito è valido o meno
  if(mongoose.Types.ObjectId.isValid(id))  
    result = await Article.findById(id);

    console.log(id);
    console.log(result);

  if(!result)
    return res.status(404).json({code: "603", message: "product not found"});
  
  let item = result;

  //ricerca venditore del prodotto
  result = await User.findOne({"articles.id": id});

  if(!result)
  return res.status(404).json({code: "603", message: "user not found"});

  return res.status(200).json({ article: item, seller: result, code: "600", message: 'success' });
};

const newProduct = async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const location = req.body.location;
  const date = req.body.date;
  const state = req.body.state;
  const price = req.body.price;
  const quantity = req.body.quantity;
  const shipment = req.body.shipment;
  const shipmentPrice = req.body.shipmentPrice;
  const handDeliver = req.body.handDeliver;
  const handDeliverZone = req.body.handDeliverZone;
  const isPublished = req.body.isPublished;
  const categories = req.body.categories;
  const photos = req.body.photos;

  const articolo = new Article({
    title: title,
    description: description,
    location: location,
    date: date,
    state: state,
    price: price,
    quantity: quantity,
    shipment: shipment,
    shipmentPrice: shipmentPrice,
    handDeliver: handDeliver,
    handDeliverZone: handDeliverZone,
    isPublished: isPublished,
    categories: categories,
    photos: photos,
  });

    articolo.save((err, data) => {
      if(err) res.status(404).json({code: "601", message: "error database"});
      else res.status(200).json({code: "600", message: "success"});
    });

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