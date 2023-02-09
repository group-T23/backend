const dotenv = require('dotenv');
dotenv.config();

const request = require('supertest');
const mongoose = require('mongoose');
const Buyer = require('../models/Buyer');
const crypto = require('crypto');
const app = `${process.env.SERVER}:${process.env.PORT}`;

describe('Cart test', () => {
    const fetch = require('node-fetch');
    const TIMEOUT = 10000;
    jest.setTimeout(TIMEOUT);

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
        });

        await user.save().catch(err => console.log(err))
    });

    afterAll(async() => {
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        mongoose.disconnect();
    })

    //test autenticazione con credenziali errate
    test('test /login - credenziali errate', async() => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "test@skupply.shop",
                password: "passwordErrata"
            })
        }

        const response = (await fetch(`${app}/login`, options).then(response => response.json()))
        expect({ code: "303", message: "wrong credentials", ok: false })
    });


    //test autenticazione con credenziali corrette
    test('test /login - credenziali corrette', async() => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "test@gmail.com",
                password: "test"
            })
        }

        const response = (await fetch(`${app}/login`, options).then(response => response.json()))
        expect({ code: "300", message: "loged in", ok: true })
        expect(response.user).toBeDefined();
        expect(response.user).toHaveProperty("id");
        expect(response.user).toHaveProperty("isSeller");
        expect(response.user).toHaveProperty("sellerId");
        expect(response.user).toHaveProperty("token");
    });

});