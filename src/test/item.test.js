const dotenv = require('dotenv');
dotenv.config();

const request = require('supertest');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const Buyer = require('../models/Buyer');
const Seller = require('../models/Seller');
const crypto = require('crypto');
const app = `${process.env.SERVER}:${process.env.PORT}`;

describe('Item test', () => {
    const fetch = require('node-fetch');

    beforeAll(async() => {
        await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);

        //creazione account
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });

        //hash della password del profilo (test)
        const hash = crypto.createHash('sha256');
        const password = hash.update('test', 'utf-8').digest('hex');

        let user = new Buyer({
            firstname: 'test',
            lastname: 'test',
            username: 'test',
            email: 'test@gmail.com',
            passwordHash: password,
            isVerified: true,
            verificationCode: 'fedcba9876543210',
            isSeller: true
        });

        await user.save().catch(err => console.log(err))
        const buyer = await Buyer.findOne({username: "test"});

        //creazione due articoli di prova
        let item1 = new Item({
            title: "Libro matematica",
            description: "Libro di matematica sui numeri complessi",
            ownerId: buyer._id,
            quantity:"1",
            categories: ["63a033e4498a01f9bada19d2"],//id generale
            conditions: "NEW",
            price: "20",
            city: "Belluno-test",
            state: 'PUBLISHED',
            pickUpAvail: true,
            shipmentAvail: false,
            shipmentCost: 0.00,
        });

        await item1.save().catch(err => {
            console.log(err);
        })

        let item2 = new Item({
            title: "Quaderni",
            description: "Blocco di quaderno 10pz",
            ownerId: buyer._id,
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

        await item2.save().catch(err => {
            console.log(err);
        })

         //Creo il suo profilo venditore con i due articoli creati
         const items = await Item.find({ownerId: buyer._id});
       
         let seller = new Seller({
            userId: buyer._id,
            items: items
         })

         await seller.save().catch(err => console.log(err));

         seller = await Seller.findOne({userId: buyer._id});

         user.sellerId = seller._id;

         await user.save().catch(err => console.log(err));

         //aggiorno l'ownerId degli item con quello del profilo venditore
         item1.ownerId = seller._id;
         item2.ownerId = seller._id;

         await item1.save().catch(err => console.log(err));
         await item2.save().catch(err => console.log(err));
    });

    afterAll(async() => {
        //cancellazione profilo di testing se presente
        const buyer = await Buyer.findOne({username: "test"});
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });

        const seller = await Seller.findOne({userId: buyer._id});
        await Seller.deleteOne({userId: buyer._id});

        //cancellazione items di prova
        await Item.deleteMany({ownerId: seller._id});

        mongoose.disconnect();
    })

    //test ricerca item per id
    test('tests /item - ricerca per id', async() => {
        const item = await Item.findOne({city: "Belluno-test"});
        const response = await request(app).get(`/item?id=`+item._id);
        expect(response.statusCode).toBe(200)
        expect({ code: "900", message: "success" })
        expect(response.body.item).toBeDefined();
        expect(response.body.item).toHaveProperty('title', "Libro matematica");
    });

    //test ricerca item senza passaggio id
    test('tests /item - ricerca senza id', async() => {
        const response = await request(app).get(`/item`)
        expect(response.statusCode).toBe(400)
        expect({ code: "902", message: "missing arguments" })
        expect(response.body.item).toBeUndefined();
    });

    //test ricerca item con id non valido o non esistente
    test('tests /item - ricerca con id non valido o non presente', async() => {
        const response = await request(app).get(`/item`)
            .query({ id: '63a0fffffffffffff' });
        expect(response.statusCode).toBe(400)
        expect({ code: "903", message: "invalid arguments" })
    });

    //test ricerca items di un utente venditore
    test('tests /item - ricerca items di un venditore', async() => {
        const response = await request(app).get(`/item/seller?username=test`);
        expect(response.statusCode).toBe(200)
        expect({ code: "900", message: "success" })
        expect(response.body.items).toBeDefined();
        expect(response.body.items).toStrictEqual(expect.arrayContaining([expect.any(Object)]))
    });

    //test ritiro item come non venditore
    test('tests /item - ritiro item', async() => {
        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': process.env.ACCESS_TOKEN }
        }

        const response = (await fetch(`${app}/item/retire?id=63a031fbff52385f7b1857de`, options).then(response => response.json()))
        expect({ code: "904", message: "invalid user type" })
    });

});