const dotenv = require('dotenv');
dotenv.config();

const mongoose = require("mongoose");
const Review = require("../models/Review");
const Buyer = require("../models/Buyer");
const Seller = require("../models/Seller");
const crypto = require('crypto');

const app = `${process.env.SERVER}:${process.env.PORT}`;

describe('Review test', () => {
    const fetch = require('node-fetch');

    beforeAll(async() => {
        await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);
   
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
             isSeller: true
         });
 
         await user.save().catch(err => console.log(err))

         let buyer = await Buyer.findOne({username: 'test'});

        //Creo il suo profilo venditore con i due articoli creati
        let seller = new Seller({
            userId: buyer._id
        })
 
        await seller.save().catch(err => console.log(err));
        seller = await Seller.findOne({userId: buyer._id});

         //creazione di una recensione
         const review = new Review({
            authorId: buyer._id,
            sellerId: seller._id,
            title: "Recensione di prova",
            description: "Questa recensione viene scritta dal file di testing",
            rating: 1
         });

         review.save().catch(err => console.log(err));
       
    });

    afterAll(async() => {
        //cancellazione profilo di testing se presente
        const buyer = await Buyer.findOne({username: "test"});
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });

        const seller = await Seller.findOne({userId: buyer._id});
        await Seller.deleteOne({userId: buyer._id});

        //cancellazione review di prova
        await Review.deleteOne({authorId: buyer._id, title: "Recensione di prova"});

        mongoose.disconnect();
    })

    //test recupero recensioni di un utente
    test('tests /review - recupero recensioni di un utente venditore', async() => {
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

        const response = (await fetch(`${app}/review/seller/id=639f6b399b38c1bfc9633360`, options).then(response => response.json()))
        expect({ code: "800", message: "success" })
        expect(response.reviews).toBeDefined();
        if (response.reviews.length != 0) {
            expect(response.reviews[0]).toHaveProperty('authorId');
            expect(response.reviews[0]).toHaveProperty('sellerId');
            expect(response.reviews[0]).toHaveProperty('title');
            expect(response.reviews[0]).toHaveProperty('description');
            expect(response.reviews[0]).toHaveProperty('rating');
        }
    });

    //test per recuperare tutte le recensioni scritte dall'utente autenticato
    test('tests /review - recupero recensioni scritte', async() => {
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

        const response = (await fetch(`${app}/review/out`, options).then(response => response.json()))
        expect({ code: "800", message: "success" })
        expect(response.reviews).toBeDefined();
        if (response.reviews.length != 0) {
            expect(response.reviews[0]).toHaveProperty('authorId');
            expect(response.reviews[0]).toHaveProperty('sellerId');
            expect(response.reviews[0]).toHaveProperty('title');
            expect(response.reviews[0]).toHaveProperty('description');
            expect(response.reviews[0]).toHaveProperty('rating');
        }
    });

});