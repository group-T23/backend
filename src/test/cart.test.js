const dotenv = require('dotenv');
dotenv.config();

const request = require('supertest');
const mongoose = require('mongoose');
const Buyer = require('../models/Buyer');
const Item = require('../models/Item');
const crypto = require('crypto');

const app = `${process.env.SERVER}:${process.env.PORT}`;

describe('Cart test', () => {
    const fetch = require('node-fetch');

    beforeAll(async() => {
        await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);

        //creazione due articoli di prova
        let item = new Item({
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

        item = new Item({
            title: "Quaderni",
            description: "Blocco di quaderno 10pz",
            ownerId: "63e50c0633652302f120e0f5",
            quantity:"20",
            categories: ["63a033e4498a01f9bada19d2"],
            photos: [`${"sellerId"}_${"1"}.${"XXX"}`],
            conditions: "NEW",
            price: "10",
            city: "Trento",
            state: 'PUBLISHED',
            pickUpAvail: true,
            shipmentAvail: true,
            shipmentCost: 10.00,
        });
    
        await item.save().catch(err => {
            console.log(err);
        })

        //creazione account
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });

        //hash della password del profilo (test)
        const hash = crypto.createHash('sha256');
        const password = hash.update('test', 'utf-8').digest('hex');

        const items = await Item.find({ownerId: "63e50c0633652302f120e0f5"});

        const user = new Buyer({
            firstname: 'test',
            lastname: 'test',
            username: 'test',
            email: 'test@gmail.com',
            passwordHash: password,
            isVerified: true,
            verificationCode: 'fedcba9876543210',
            cart: [{id: items[0]._id, quantity: 1}, {id: items[1]._id, quantity: 2}]
        });

        await user.save().catch(err => console.log(err))
      
    });

    afterAll(async() => {
        //cancellazione profilo di testing se presente
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });

        //cancellazione items di prova
        await Item.deleteMany({ownerId: "63e50c0633652302f120e0f5"});

        mongoose.disconnect();
    })

    //test senza autenticazione
    test('test /cart - senza autorizzazione', async() => {
        const response = await request(app).post('/cart')
        expect(response.statusCode).toBe(403);
        expect({ code: "", message: "Invalid access token" })
    });

    //test con autenticazione
    test('test /cart - con autorizzazione', async() => {
        //recupero access token profilo creato
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
            headers: { 'Content-Type': 'application/json', 'x-access-token': token }
        }
        const result = (await fetch(`${app}/cart`, options).then(response => response.json()))
        expect(result).toMatchObject({ "code": "400", "message": "success" })

        //verifica presenza parametro cart e cart_ids
        expect(result.cart).toBeDefined();
        expect(result.cart).toStrictEqual(expect.arrayContaining([expect.any(Object)]))
            //questo test funziona nel caso in cui sia presente almeno un elemento

        //verifica che sotto l'attributo cart vi sia un array di oggetti contenente alcuni attributi degli articoli
        result.cart.forEach(element => {
            expect(element.quantity).toBeDefined();
            expect(element.quantity).toStrictEqual(expect.any(Number));
            expect(element._id).toBeDefined();
            expect(element.state).toBeDefined();
        })

        expect(result.cart_ids).toBeDefined();
        expect(result.cart_ids).toStrictEqual(expect.arrayContaining([expect.any(Object)]))
            //questo test funziona nel caso in cui sia presente almeno un elemento

        //verifica che l'attributo quantity sia definita e che sia >=0
        result.cart_ids.forEach(element => {
            expect(element.quantity).toBeDefined();
            expect(element.quantity).toBeGreaterThan(0);
        })
    });

});