const dotenv = require('dotenv');
dotenv.config();

const request = require('supertest');
const mongoose = require('mongoose');
const app = `${process.env.SERVER}:${process.env.PORT}`;

describe('Cart test', () => {
    const fetch = require('node-fetch');
    const TIMEOUT = 10000;
    jest.setTimeout(TIMEOUT);

    beforeAll(async() => {
        await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);
    });

    afterAll(async() => {
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
                email: "andrea@skupply.shop",
                password: "Skupply30*"
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