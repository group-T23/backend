const mongoose = require("mongoose");
const { getAuthenticatedBuyer } = require('../utils/auth');
const Order = require('../models/Order');
const Buyer = require("../models/Buyer");
const Item = require("../models/Item");

/**
 * la funzione permette la crezione di un oggetto ordine da salvare
 * all'interno del db
 */
const create = async(req, res) => {
    let user = await getAuthenticatedBuyer(req, res);

    const buyer = user._id;//id del compratore
    const articles = req.body.articles;
    const price = req.body.price;
    const shipment = req.body.shipment;
    const state = "PAID";//l'ordine creato ha come stato pagato
  
    //verifica presenza parametri di richiesta
    //non viene fatto il controller per shipment perchè potrebbe avere valore zero 
    //che un valore valido a differenza di price
    if(!buyer || !articles || !price) {
        return res.status(400).json({code: 1002, message: "Missing arguments"});
    }

    //verifica esistenza buyer e articoli
    if(!(mongoose.Types.ObjectId.isValid(buyer)) || !(await Buyer.findById(buyer))){
        return res.status(404).json({code: 1005, message: "Buyer not found"});
    }

    let result = true;
    for(let i=0; i<articles.length && result; i++){
        let id = articles[i].id;
        if(mongoose.Types.ObjectId.isValid(id)){
            result = await Item.findById(id);
        }
        else {
            result = false;
        }  
    }

    if(!result){
        return res.status(404).json({code: 1006, message: "Item not found"});
    }

    //creazione ordine e salvataggio su db
    const order = new Order({
        buyer: buyer,
        articles: articles,
        price: price,
        shipment: shipment,
        state: state,
    });

    try{
        await order.save();
        return res.status(200).json({code: 1000, message: "success"});
    }catch(error){
        return res.status(500).json({code: 1001, message: "database error"});
    }
};

/**
 * la funzione permette di recuperare tutti gli ordini fatti da un utente
 */
const getAll = async(req, res) => {
    let user = await getAuthenticatedBuyer(req, res);

    const buyer = user._id;//id del compratore
    //verifica presenza parametri di richiesta
    if(!buyer)
        return res.status(400).json({code: 1002, message: "Missing arguments"});
    
    //verifica esistenza buyer e articoli
    if(!(mongoose.Types.ObjectId.isValid(buyer)) || !(await Buyer.findById(buyer))){
        return res.status(404).json({code: 1005, message: "Buyer not found"});
    }

    //recupero ordini fatti dal buyer
    try{
        const result = await Order.find({buyer: buyer});
        return res.status(200).json({code: 1000, message: "success", orders: result});
    }catch(error){
        return res.status(500).json({code: 1001, message: "database error"});
    }
};

/**
 * la funzione permette di modificare lo stato dell'ordine e il flag reviewed
 */
const edit = async(req, res) => {
    
    const order = req.body.order;//id ordine
    const newState = req.body.state;//nuovo stato dell'ordine
    const newReviewed = req.body.reviewed;//valore nuovo flag reviewed

    //verifica presenza parametri di richiesta
    if(!order)
        return res.status(400).json({code: 1002, message: "Missing arguments"});
    
    //verifica esistenza ordine
    if(!(mongoose.Types.ObjectId.isValid(order)) || !(await Order.findById(order))){
        return res.status(404).json({code: 1007, message: "Order not found"});
    }

    //verifica valore enumerativo newState [ PAID, SHIPPED, COMPLETED, DELETED]
    if(newState){
        if(newState != "PAID" && newState != "SHIPPED" && newState != "COMPLETED" && newState != "DELETED")
            return res.status(403).json({code: 1003, message: "Invalid arguments"});
    }

    //recupero ordine e modifica del campo state e/o reviewed
    try{
        let result = await Order.findById(order);
        if(newState)//il parametro newState è opzionale e può non essere indicato
            result.state = newState;
        if(newReviewed)//il parametro newReviewed è opzionale e può non essere indicato
            result.reviewed = newReviewed;

        await result.save();
        return res.status(200).json({code: 1000, message: "success"});
    }catch(error){
        return res.status(500).json({code: 1001, message: "database error"});
    }
};

module.exports = {
    create,
    getAll,
    edit
};