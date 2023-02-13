const dotenv = require('dotenv');
dotenv.config();

const mongoose = require("mongoose");
const Order = require("../models/Order");
const Item = require("../models/Item");
const Buyer = require("../models/Buyer");
const crypto = require('crypto');

const app = `${process.env.SERVER}:${process.env.PORT}`;

describe('Order test', () => {
    const fetch = require('node-fetch');
    let item;
    beforeAll(async() => {
        await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);
   
         //creazione articolo di prova
         item = new Item({
            title: "Libro matematica",
            description: "Libro di matematica sui numeri complessi",
            ownerId: "63e50c0633652302f120e0f5",//id generato casualmente
            quantity:"1",
            categories: ["63a033e4498a01f9bada19d2"],//id generale
            photos: [`${"sellerId"}_${"1"}.${"XXX"}`],
            conditions: "NEW",
            price: "20",
            city: "Belluno",
            state: 'PUBLISHED',
            pickUpAvail: true,
            shipmentAvail: false,
            shipmentCost: 0.00,
        });
    
        await item.save().catch(err => {
            console.log(err);
        })

         //creazione account
         await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });

         //hash della password del profilo (test)
         const hash = crypto.createHash('sha256');
         const password = hash.update('test', 'utf-8').digest('hex');
 
         const user = new Buyer({
             firstname: 'test',
             lastname: 'test',
             username: 'test',
             email: 'test@gmail.com',
             passwordHash: password,
             isVerified: true,
             verificationCode: 'fedcba9876543210',
         });
 
         await user.save().catch(err => console.log(err))

         let buyer = await Buyer.findOne({username: 'test'});
         item = await Item.findOne({ownerId: "63e50c0633652302f120e0f5"});

         //creazione di un ordine fatto dal buyer creato
         const order = new Order({
            buyer: buyer._id,
            seller: "63e50c0633652302f120e0f5",//id seller dell'item creato
            article: {id: item._id, quantity: 1},
            price: 20,
            shipment: 0.00,
            state: "PAID",
            payment: "LOCKED",
            trackingCode: "codiceTracking - testing",
            courier: "GLS - testing"
         });

         order.save().catch(err => console.log(err));
       
    });

    afterAll(async() => {
        //cancellazione profilo di testing se presente
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });

        //cancellazione items di prova
        await Item.deleteMany({ownerId: "63e50c0633652302f120e0f5"});

        //cancellazione ordine eseguito
        await Order.deleteOne({courier: "GLS - testing", trackingCode: "codiceTracking - testing"});

        mongoose.disconnect();
    })

    //test recupero degli ordini fatti da un utente
    test('tests /order - ordini fatti da un utente', async() => {
        let options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@gmail.com',
                password: 'test'
            })
        }

        const access = (await fetch(`${app}/login`, options).then(response => response.json()))
        let token = access.user.token;
        
        options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token }
        }

        const response = (await fetch(`${app}/order/getAll`, options).then(response => response.json()))
        expect({ code: '0900', message: 'Success' })
        expect(response.orders).toBeDefined();
        if (response.orders.length != 0) {
            expect(response.orders[0]).toHaveProperty('buyer');
            expect(response.orders[0]).toHaveProperty('article');
            expect(response.orders[0]).toHaveProperty('price');
            expect(response.orders[0]).toHaveProperty('shipment');
            expect(response.orders[0]).toHaveProperty('state');
        }
    });

    //test creazione ordine
    test('tests /order - creazione ordine', async() => {
        let options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@gmail.com',
                password: 'test'
            })
        }

        const access = (await fetch(`${app}/login`, options).then(response => response.json()))
        let token = access.user.token;
        
        options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token},
            body: JSON.stringify({
                seller: "639f6b399b38c1bfc9633360",//id generato casualemente
                article: { id: item._id, quantity: 1 },
                price: 10,
                shipment: 0,
                trackingCode: "trackingCodeTest",
                courier: "corriereTest"
            })
        }

        const response = await fetch(`${app}/order`, options).then(response => response.json())
        expect(response).toMatchObject({ code: '0900', message: 'Success' });

        //cancellazione ordine creato
        await Order.deleteOne({ courier: "corriereTest" , seller: "639f6b399b38c1bfc9633360"});
    });

});