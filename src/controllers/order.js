const mongoose = require("mongoose");
const { getAuthenticatedUser } = require('../utils/auth');
const Order = require('../models/Order');
const Buyer = require("../models/Buyer");
const Item = require("../models/Item");
const Seller = require("../models/Seller");

/**
 * la funzione permette la crezione di un oggetto ordine da salvare
 * all'interno del db
 */
const create = async(req, res) => {
    let user = await getAuthenticatedUser(req, res);

    const buyer = user._id; //id del compratore
    const seller = req.body.seller; //id del venditore
    const article = req.body.article;
    const price = req.body.price;
    const shipment = req.body.shipment;
    const state = "PAID"; //l'ordine creato ha come stato pagato
    const payment = "LOCKED"; //l'ordine create ha come stato pagamento locked
    const trackingCode = req.body.trackingCode; //codice di tracking del pacco
    const courier = req.body.courier; //il corriere che gestisce la spedizione


    //verifica presenza parametri di richiesta
    //non viene fatto il controller per shipment perchè potrebbe avere valore zero 
    //che un valore valido a differenza di price
    if (!buyer || !seller || !article || !price) {
        return res.status(400).json({ code: '0902', message: 'Missing Arguments' });
    }

    //verifica esistenza buyer e articolo
    if (!(mongoose.Types.ObjectId.isValid(buyer)) || !(await Buyer.findById(buyer))) {
        return res.status(404).json({ code: '0905', message: 'Buyer Not Found' });
    }

    if (!(mongoose.Types.ObjectId.isValid(article.id)) || !(await Item.findById(article.id))) {
        return res.status(404).json({ code: '0906', message: 'Item Not Found' });
    }

    //creazione ordine e salvataggio su db
    const order = new Order({
        buyer: buyer,
        seller: seller,
        article: article,
        price: price,
        shipment: shipment,
        state: state,
        payment: payment,
        trackingCode: trackingCode,
        courier: courier
    });

    try {
        await order.save();
        return res.status(200).json({ code: '0900', message: 'Success' });
    } catch (error) {
        return res.status(500).json({ code: '0901', message: 'Database Error' });
    }
};

/**
 * la funzione permette di recuperare tutti gli ordini fatti da un utente
 */
const getAll = async(req, res) => {
    let user = await getAuthenticatedUser(req, res);

    const buyer = user._id; //id del compratore
    //verifica presenza parametri di richiesta
    if (!buyer)
        return res.status(400).json({ code: '0902', message: 'Missing Arguments' });

    //verifica esistenza buyer e articoli
    if (!(mongoose.Types.ObjectId.isValid(buyer)) || !(await Buyer.findById(buyer))) {
        return res.status(404).json({ code: '0905', message: 'Buyer Not Found' });
    }

    //recupero ordini fatti dal buyer
    try {
        const result = await Order.find({ buyer: buyer });

        return res.status(200).json({ code: '0900', message: 'Success', orders: result });
    } catch (error) {
        return res.status(500).json({ code: '0901', message: 'Database Error' });
    }
};

/**
 * la funzione permette di modificare lo stato dell'ordine, lo stato reviewed e il pagamento
 */
const edit = async(req, res) => {

    const order = req.body.orderId; //id ordine
    const newState = req.body.state; //nuovo stato dell'ordine
    const newReviewed = req.body.reviewed; //valore nuovo flag reviewed
    const newPayment = req.body.payment; //valore nuovo stato pagamento
    const trackingCode = req.body.trackingCode; //codice di tracking del pacco
    const courier = req.body.courier; //il corriere che gestisce la spedizione

    //verifica presenza parametri di richiesta
    if (!order)
        return res.status(400).json({ code: '0902', message: 'Missing Arguments' });

    //verifica esistenza ordine
    if (!(mongoose.Types.ObjectId.isValid(order)) || !(await Order.findById(order))) {
        return res.status(404).json({ code: '0907', message: 'Order Not Found' });
    }

    //verifica valore enumerativo newState [ PAID, SHIPPED, COMPLETED, DELETED]
    if (newState && newState != "PAID" && newState != "SHIPPED" && newState != "COMPLETED" && newState != "DELETED")
        return res.status(403).json({ code: '0903', message: 'Invalid Arguments' });

    //verifica valore enumerativo newState [ PAID, SHIPPED, COMPLETED, DELETED]
    if (newPayment && newPayment != "LOCKED" && newPayment != "SENT" && newPayment != "REJECTED")
        return res.status(403).json({ code: '0903', message: 'Invalid Arguments' });


    //recupero ordine e modifica dei campi
    try {
        let result = await Order.findById(order);
        if (newState) result.state = newState;
        if (newReviewed) result.reviewed = newReviewed;
        if (newPayment) result.payment = newPayment;
        //per la modifica dei parametri riguardanti l'ordine, i valori trackingCode e courier
        //devono essere entrambi presenti
        if (trackingCode && courier) {
            result.trackingCode = trackingCode;
            result.courier = courier;
        }

        await result.save();
        return res.status(200).json({ code: '0900', message: 'Success' });
    } catch (error) {
        return res.status(500).json({ code: '0901', message: 'Database Error' });
    }
};

const getBySeller = async(req, res) => {

    const buyer = await getAuthenticatedUser(req, res);

    if (!buyer.isSeller)
        return res.status(422).json({ code: '0903', message: 'Invalid Arguments' })

    const seller = await Seller.findById(buyer.sellerId);
    const query = await Order.find({ seller: seller.id });

    return res.status(200).json({ orders: query, code: '0900', message: 'Success' })
}

module.exports = {
    create,
    getAll,
    edit,
    getBySeller
};